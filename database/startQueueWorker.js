import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { SQSClient } from '@aws-sdk/client-sqs';
import { processMessages } from './services/queue.js';
import { getLogger } from './services/logger.js';
import { CustomTransport } from './services/transports.js';
import { loadAwsCredentials, createConnection, createPostgresClient } from './services/utils.js';
import { importDatabase } from './importDatabase.js';
import { schema } from './schema.js';
import { sources } from './sources.js';
import { S3Client } from '@aws-sdk/client-s3';
import { S3Provider } from './services/providers/s3Provider.js';
import knex from 'knex';

// determine if this script was launched from the command line
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

if (isMainModule) {
  const config = require('./config.json');
  loadAwsCredentials(config.aws);
  await startQueueWorker(config);
}

export async function startQueueWorker(config) {
  const logger = createCustomLogger('methylscape-queue-worker');
  logger.info('Started methylscape queue worker');

  processMessages({
    sqs: new SQSClient(),
    queueName: config.aws.sqsName,
    visibilityTimeout: config.aws.sqsVisibilityTimeout || 300,
    pollInterval: config.aws.sqsPollInterval || 5,
    messageHandler: async (message) => {
      logger.info('Retrieved message from SQS queue');
      logger.info(message);

      switch(message.type) {
        case 'importData':
          return await importData(config, message, logger);
        default:
          logger.error(`Unknown message type`);
          return false;
      }
    },
  });
}

async function importData(config, message, logger) {
  const sourceBasePath = `s3://${config.aws.s3DataBucket}/${config.aws.s3DataKey}`;
  const sourceProvider = new S3Provider(new S3Client(), sourceBasePath);
  const connection = createConnection(config.database);
  const logConnection = await createPostgresClient(config.database); // use a separate connection for all log operations
  const importLogId = await ensureImportLogExists(connection, message.importLogId);
  const forceRecreate = message.forceRecreate;

  async function updateImportLog(params) {
    await connection('importLog')
      .where({ id: importLogId })
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
    logger.customTransport.setHandler(null);
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

async function ensureImportLogExists(connection, importLogId) {
  return await importLogExists(connection, importLogId)
    ? importLogId
    : await createImportLogEntry(connection);
}

async function importLogExists(connection, importLogId) {
  if (!importLogId || isNaN(importLogId)) return false;
  const log = await connection('importLog').where({ id: importLogId })
  return log.length > 0;
}

async function createImportLogEntry(connection) {
  const record = await connection('importLog')
    .insert({ status: 'PENDING' })
    .returning('id');
  return record[0].id;
}