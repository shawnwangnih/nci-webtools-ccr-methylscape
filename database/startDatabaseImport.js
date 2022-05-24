import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { getLogger } from './services/logger.js';
import { CustomTransport } from './services/transports.js';
import { loadAwsCredentials, createConnection, createPostgresClient } from './services/utils.js';
import { importDatabase } from './importDatabase.js';
import { schema } from './schema.js';
import { sources } from './sources.js';
import { S3Client } from '@aws-sdk/client-s3';
import { S3Provider } from './services/providers/s3Provider.js';

// determine if this script was launched from the command line
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

if (isMainModule) {
  const config = require('./config.json');
  loadAwsCredentials(config.aws);
  await importData(config);
}

async function importData(config) {
  const logger = createCustomLogger('methylscape-data-import');
  const sourceBasePath = `s3://${config.aws.s3DataBucket}/${config.aws.s3DataKey}`;
  const sourceProvider = new S3Provider(new S3Client(), sourceBasePath);
  const connection = createConnection(config.database);
  const logConnection = await createPostgresClient(config.database); // use a separate connection for all log operations
  const importLog = await getPendingImportLog(connection);
  const forceRecreate = importLog.type === 'full';

  logger.info(`Started methylscape data import: ${importLog.type}`);

  async function updateImportLog(params) {
    await connection('importLog')
      .where({ id: importLog.id })
      .update({ ...params, updatedAt: new Date() })
      .connection(logConnection);
  }

  async function handleLogEvent(event) {
    const logMessage = `${event.timestamp} ${event.message}`;
    const log = connection.raw(`concat("log", '\n', ?::text)`, [logMessage]);
    await updateImportLog({ log });
  }

  try {
    logger.customTransport.setHandler(handleLogEvent);
    await updateImportLog({ status: 'RUNNING' });
    await importDatabase(connection, schema, sources, sourceProvider, logger, forceRecreate);
    await updateImportLog({ status: 'COMPLETE' });
  } catch (exception) {
    logger.error(exception.stack);
    await updateImportLog({ status: 'FAILED' });
  } finally {
    logger.customTransport.setHandler(null);
  }

  return true;
}

function createCustomLogger(name) {
  const logger = getLogger(name);
  logger.customTransport = new CustomTransport();
  logger.add(logger.customTransport);
  return logger;
}

async function getPendingImportLog(connection) {
  const pendingImportLog = await connection('importLog')
    .where({ status: 'PENDING' })
    .orderBy('createdAt', 'asc')
    .first();
  return pendingImportLog || await createImportLog(connection);
}

async function createImportLog(connection) {
  await connection('importLog').insert({ status: 'PENDING' });
  return await getPendingImportLog(connection);
}