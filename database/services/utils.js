import { createReadStream, readFileSync } from 'fs';
import mapValues from 'lodash/mapValues.js';
import { parse } from 'csv-parse';
import * as XLSX from 'xlsx';
import knex from 'knex';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export function createConnection(args) {
  return knex({
    client: 'pg',
    connection: {
      host: args.host || 'localhost',
      port: args.port || 5432,
      user: args.user || 'methylscape',
      password: args.password || 'methylscape',
      database: args.database || 'methylscape',
    },
  });
}

export async function initializeTables(connection, tables) {
  // drop tables in reverse order to avoid foreign key constraints
  for (const { name } of [...tables].reverse()) {
    await connection.schema.dropTableIfExists(name);
  }

  for (const { name, schema } of tables) {
    await connection.schema.createTable(
      name, 
      table => schema(table, connection)
    );
  }

  return true;
}

export async function initializeTablesForImport(connection, tables) {
  const importSchema = tables.filter(table => table.import);
  return await initializeTables(connection, importSchema);
}

export async function getS3File(bucket, key) {
  const client = new S3Client();
  const object = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
  return object.Body;
}

export async function createRecordIterator(filename, columns, config = {}) {
  const fileExtension = filename.split('.').pop().toLowerCase();
  let inputStream;

  if (config.s3DataBucket) {
    const keyPrefix = config.s3DataKey || '';
    const s3Key = keyPrefix + filename;
    inputStream = await getS3File(config.s3DataBucket, s3Key);
  } else {
    inputStream = createReadStream(filename);
  }

  switch (fileExtension) {
    case 'csv':
      return createCsvRecordIterator(inputStream, columns);
    case 'txt':
    case 'tsv':
      return createCsvRecordIterator(inputStream, columns, { delimiter: '\t' });
    case 'xlsx':
      return await createExcelRecordIterator(inputStream, columns);
    default:
      throw new Error(`Unsupported file extension: ${fileExtension}`);
  }
}

export async function createExcelRecordIterator(stream, columns) {
  let buffers = [];
  for await (const chunk of stream) {
    buffers.push(chunk);
  }
  const workbook = XLSX.read(Buffer.concat(buffers));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const [headers] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    range: 'A1:ZZZ1',
  });
  const errors = [];

  for (const { sourceName } of columns) {
    if (sourceName && !headers.includes(sourceName)) {
      errors.push(`Missing column: ${sourceName}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  const records = XLSX.utils.sheet_to_json(sheet);
  const recordParser = createRecordParser(columns);

  return records.map((record) => recordParser(mapValues(record, castValue)));
}

export function createCsvRecordIterator(stream, columns, options = {}) {
  const parseOptions = {
    columns: true,
    skip_empty_lines: true,
    cast: castValue,
    on_record: createRecordParser(columns),
    ...options,
  };

  return stream.pipe(parse(parseOptions));
}

export async function importTable(connection, iterable, tableName, logger) {
  let count = 0;
  let bufferSize = 10000;
  let buffer = [];

  async function flushBuffer() {
    try {
      await connection.batchInsert(tableName, buffer);
      count += buffer.length;
      buffer = [];
      logger.info(`Imported ${count} rows`);
    } catch (error) {
      // batchInsert exceptions do not return the specific records that failed
      // so we need to check each record individually
      for (let record of buffer) {
        try {
          await connection(tableName).insert(record);
        } catch(error) {
          logger.error(record);
          throw error;
        }
      }
      throw error;
    }
  }

  for await (const record of iterable) {
    buffer.push(record);
    if (buffer.length >= bufferSize) {
      await flushBuffer();
    }
  }

  await flushBuffer();
  return count;
}

export function castValue(value) {
  if (value === '') {
    return null;
  } else if (!isNaN(value)) {
    return parseFloat(value);
  } else if (typeof value === 'number' && isNaN(value)) {
    return null;
  } else {
    return value;
  }
}

export function createRecordParser(columns) {
  return function (record) {
    let row = {};
    for (const { sourceName, name, defaultValue, formatter } of columns) {
      let value = record[sourceName] ?? defaultValue ?? null;
      if (formatter != null) {
        value = formatter(value);
      }
      row[name] = value;
    }
    return row;
  };
}

export async function withDuration(fn) {
  const start = Date.now();
  const results = await fn();
  const end = Date.now();
  const duration = (end - start) / 1000;
  return { results, duration };
}
