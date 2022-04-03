import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { SQSClient } from '@aws-sdk/client-sqs';
import knex from 'knex';
import { processMessages } from './services/queue.js';
import { getLogger } from './services/logger.js';
import { CustomTransport } from './services/transports.js';
import { loadAwsCredentials } from './services/utils.js';
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
  await startQueueWorker(config);
}

export async function startQueueWorker(config) {
  const s3 = new S3Client();
  const sqs = new SQSClient();
  const connection = knex({
    client: 'pg',
    connection: config.database,
  });
  const sourceProvider = new S3Provider(s3, `s3://${config.aws.s3DataBucket}/${config.aws.s3DataKey}`);
  const logger = getLogger('methylscape-queue-worker');
  const customTransport = new CustomTransport();
  logger.add(customTransport);
  logger.info('Started methylscape queue worker');

  processMessages({
    sqs,
    queueName: config.aws.sqsName,
    visibilityTimeout: config.aws.sqsVisibilityTimeout || 300,
    pollInterval: config.aws.sqsPollInterval || 5,
    messageHandler: async (message) => {
      logger.info('Retrieved message from SQS queue');
      let { type, importLogId } = message;

      try {
        if (type === 'importData') {
          if (!importLogId || isNaN(importLogId)) {
            const newImportLogRecord = await connection('importLog')
              .insert({ status: 'PENDING' })
              .returning('id');
            importLogId = newImportLogRecord[0].id;
          }

          customTransport.setHandler(async (info) => {
            try {
              const logMessage = `${info.timestamp} ${info.message}`;
              await connection('importLog')
                .where({ id: importLogId })
                .update({ 
                  log: connection.raw(`concat("log", '\n', ?::text)`, [logMessage]),
                  updatedAt: new Date() 
                });
            } catch(exception) {
              logger.error(exception.stack);
              customTransport.setHandler(null);
              await connection('importLog')
                .where({ id: importLogId })
                .update({ status: 'FAILED', updatedAt: new Date() });
            }
          });
          
          await connection('importLog')
            .where({ id: importLogId })
            .update({ status: 'RUNNING', updatedAt: new Date() });

          await importDatabase(connection, schema, sources, sourceProvider, logger);
          logger.info('Finished importing data');

          await connection('importLog')
            .where({ id: importLogId })
            .update({ status: 'COMPLETE', updatedAt: new Date() });
        }
      } catch (exception) {
        logger.error(exception.stack);
        await connection('importLog')
          .where({ id: importLogId })
          .update({ status: 'FAILED', updatedAt: new Date() });
      } finally {
        customTransport.setHandler(null);
      }
    },
  });
}
