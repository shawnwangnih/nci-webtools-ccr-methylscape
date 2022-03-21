const { mapValues, uniq } = require('lodash');
const { parse } = require('csv-parse');
const XLSX = require('xlsx');
const config = require('../../config');
const { getDataFile } = require('../aws');
const { enqueue } = require('../queue');

async function createRecordIterator(sourcePath, columns) {
  const fileExtension = sourcePath.split('.').pop().toLowerCase();
  const s3Key = config.aws.s3DataKey + sourcePath;
  const s3Response = await getDataFile(s3Key);
  const inputStream = s3Response.Body;

  switch (fileExtension) {
    case 'csv':
      return await createCsvRecordIterator(inputStream, columns);
    case 'txt':
      return await createCsvRecordIterator(inputStream, columns, {
        delimiter: '\t',
      });
    case 'xlsx':
      return await createExcelRecordIterator(inputStream, columns);
    default:
      throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}

async function createExcelRecordIterator(inputStream, columns) {
  let buffers = [];
  for await (const chunk of inputStream) {
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

function createCsvRecordIterator(inputStream, columns, options = {}) {
  const parseOptions = {
    columns: true,
    skip_empty_lines: true,
    cast: castValue,
    on_record: createRecordParser(columns),
    ...options,
  };

  return inputStream.pipe(parse(parseOptions));
}

async function importTableDebug(connection, iterable, tableName, logger) {
  let count = 0;

  for await (const record of iterable) {
    await connection(tableName).insert(record);
    if (++count % 1000 === 0) logger.info(`Imported ${count} rows`);
  }

  return count;
}

async function importTable(connection, iterable, tableName, logger) {
  let count = 0;
  let bufferSize = 10000;
  let buffer = [];

  async function flushBuffer() {
    await connection.batchInsert(tableName, buffer);
    count += buffer.length;
    buffer = [];
    logger.info(`Imported ${count} rows`);
  }

  for await (const record of iterable) {
    try {
      buffer.push(record);
      if (buffer.length >= bufferSize) await flushBuffer();
    } catch (error) {
      logger.info(record);
      throw error;
    }
  }

  await flushBuffer();
  return count;
}

function castValue(value) {
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

function createRecordParser(columns) {
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

async function withDuration(fn) {
  const start = Date.now();
  const results = await fn();
  const end = Date.now();
  const duration = (end - start) / 1000;
  return { results, duration };
}

async function createImportRequest(connection, queueName) {
  const ids = await connection('importLog')
    .returning('id')
    .insert({ status: 'PENDING' });
  const message = {
    timestamp: Date.now(),
    importLogId: ids[0].id,
    type: 'importData',
  };
  return await enqueue(queueName, message);
}

async function getImportLog(connection) {
  return await connection('importLog').select('*').orderBy('createdAt', 'desc');
}

module.exports = {
  importTable,
  getImportLog,
  createRecordIterator,
  createImportRequest,
  withDuration,
};
