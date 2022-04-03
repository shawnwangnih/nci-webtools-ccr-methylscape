import { basename } from 'path';
import mapValues from 'lodash/mapValues.js';
import { parse } from 'csv-parse';
import * as XLSX from 'xlsx';
import knex from 'knex';

export function createConnection(
  args = {
    host: 'localhost',
    port: 5432,
    user: 'methylscape',
    password: 'methylscape',
    database: 'methylscape',
  }
) {
  return knex({
    client: 'pg',
    connection: args,
  });
}

export function loadAwsCredentials(config) {
  const { region, accessKeyId, secretAccessKey } = config;

  if (region) {
    process.env.AWS_REGION = region;
    process.env.AWS_DEFAULT_REGION = region;
  }

  if (accessKeyId) {
    process.env.AWS_ACCESS_KEY_ID = accessKeyId;
  }

  if (secretAccessKey) {
    process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
  }
}

export async function recreateTable(connection, name, schemaFn) {
  await connection.schema.dropTableIfExists(name);
  await connection.schema.createTable(name, table => schemaFn(table, connection));
  return true;
}

export async function initializeSchema(connection, schema) {
  const tables = schema.filter(({type}) => !type || type === 'table');
  const functions = schema.filter(({type}) => type === 'function');

  // drop tables in reverse order to avoid foreign key constraints
  for (const { name } of [...tables].reverse()) {
    await connection.schema.dropTableIfExists(name);
  }

  for (const { schema } of functions) {
    await connection.schema.raw(schema());
  }

  for (const { name, schema, type, triggers } of tables) {
    if (!type || type === 'table') {
      await connection.schema.createTable(
        name, 
        table => schema(table, connection)
      );
    }

    for (const trigger of triggers || []) {
      await connection.raw(trigger);
    }
  }

  return true;
}

export async function initializeSchemaForImport(connection, tables) {
  const importSchema = tables.filter(table => table.import);
  return await initializeSchema(connection, importSchema);
}

export async function createRecordIterator(sourcePath, sourceProvider, { columns, parseConfig }) {
  const fileExtension = sourcePath.split('.').pop().toLowerCase();
  const inputStream = await sourceProvider.readFile(sourcePath);
  const metadata = {
    filename: basename(sourcePath),
    filepath: sourcePath,
  }

  switch (fileExtension) {
    case 'csv':
      return createCsvRecordIterator(inputStream, columns, { delimiter: ',', ...parseConfig}, metadata);
    case 'txt':
    case 'tsv':
      return createCsvRecordIterator(inputStream, columns, { delimiter: '\t', ...parseConfig}, metadata);
    case 'xlsx':
      return await createExcelRecordIterator(inputStream, columns, metadata);
    default:
      throw new Error(`Unsupported file extension: ${fileExtension}`);
  }
}

export async function createExcelRecordIterator(stream, columns, metadata = {}) {
  let buffers = [];
  for await (const chunk of stream) {
    buffers.push(chunk);
  }
  const workbook = XLSX.read(Buffer.concat(buffers));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const [headers] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    range: 'A1:ZZZ1', // max column is XFD (2^14)
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
  const recordParser = createRecordParser(columns, metadata);

  return records.map((record) => recordParser(mapValues(record, castValue)));
}

export function createCsvRecordIterator(stream, columns, options = {}, metadata = {}) {
  const parseOptions = {
    columns: true,
    skip_empty_lines: true,
    cast: castValue,
    on_record: createRecordParser(columns, metadata),
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

  // this is needed to optimize the use of indexes in subsequent import steps
  await connection.raw(`VACUUM ANALYZE ??`, [tableName]);

  return count;
}

export async function importTableFromScript(connection, iterable, temporarySchema, importScript, logger) {
  const temporaryTable = `temp${process.hrtime()[1]}`;
  await connection.schema.dropTableIfExists(temporaryTable);
  await connection.schema.createTable(temporaryTable, table => temporarySchema(table, connection));
  const count = await importTable(connection, iterable, temporaryTable, logger);
  await connection.raw(importScript(), {temporaryTable});
  await connection.schema.dropTableIfExists(temporaryTable);
  return count;
}

export function castValue(value) {
  const nullValues = ['', 'NA'];
  if (nullValues.includes(value)) {
    return null;
  } else if (!isNaN(value)) {
    return parseFloat(value);
  } else if (typeof value === 'number' && isNaN(value)) {
    return null;
  } else {
    return value;
  }
}

export function createRecordParser(columns, metadata) {
  return function (record) {
    let row = {};
    for (const { sourceName, sourceMetadataName, name, defaultValue, formatter } of columns) {
      const sourceValue = record[sourceName] ?? defaultValue ?? null;
      const metadataValue = (sourceMetadataName && metadata[sourceMetadataName]) ?? null;
      let value = sourceMetadataName ? metadataValue : sourceValue;
      
      if (typeof formatter === 'function') {
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
