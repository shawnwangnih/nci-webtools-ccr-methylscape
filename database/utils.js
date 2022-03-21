import { createReadStream, readFileSync } from 'fs';
import mapValues from 'lodash/mapValues.js';
import { parse } from 'csv-parse';
import * as XLSX from 'xlsx';
import knex from 'knex';

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

export function createRecordIterator(filename, columns) {
  const fileExtension = filename.split('.').pop().toLowerCase();

  switch (fileExtension) {
    case 'csv':
      return createCsvRecordIterator(filename, columns);
    case 'txt':
      return createCsvRecordIterator(filename, columns, { delimiter: '\t' });
    case 'xlsx':
      return createExcelRecordIterator(filename, columns);
    default:
      throw new Error(`Unsupported file extension: ${fileExtension}`);
  }
}

export function createExcelRecordIterator(filename, columns) {
  const buffer = readFileSync(filename);
  const workbook = XLSX.read(buffer);
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

export function createCsvRecordIterator(filename, columns, options = {}) {
  const parseOptions = {
    columns: true,
    skip_empty_lines: true,
    cast: castValue,
    on_record: createRecordParser(columns),
    ...options,
  };

  return createReadStream(filename).pipe(parse(parseOptions));
}

export async function importTable(connection, iterable, tableName) {
  let count = 0;
  let bufferSize = 10000;
  let buffer = [];

  async function flushBuffer() {
    await connection.batchInsert(tableName, buffer);
    count += buffer.length;
    buffer = [];
    console.log(`Imported ${count} rows`);
  }

  for await (const record of iterable) {
    try {
      buffer.push(record);
      if (buffer.length >= bufferSize) await flushBuffer();
    } catch (error) {
      console.log(record);
      throw error;
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
      if (formatter) {
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
