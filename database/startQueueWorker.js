import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { SQSClient } from '@aws-sdk/client-sqs';
import knex from 'knex';
import { processMessages } from './services/queue.js';
import { getLogger } from './services/logger.js';
import { CustomTransport } from './services/transports.js';
import { loadAwsCredentials } from './services/utils.js';
import { importDatabase } from './importDatabase.js';
import { sources } from './sources.js';

// determine if this script was launched from the command line
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

if (isMainModule) {
  const config = require('./config.json');
  loadAwsCredentials(config.aws);
  await startQueueWorker(config);
}

export async function startQueueWorker(config) {
  const sqs = new SQSClient({ region: config.aws.region || 'us-east-1' });
  const connection = knex({
    client: 'pg',
    connection: config.database,
  });
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
      const { type, importLogId } = message;
      let logBuffer = '';

      customTransport.setHandler(async (info) => {
        const logMessage = `${info.timestamp} ${info.message}`;
        logBuffer += logMessage + '\n';

        await connection('importLog')
          .where({ id: importLogId })
          .update({ log: logBuffer, updatedAt: new Date() });
      });

      try {
        if (type === 'importData') {
          await connection('importLog')
            .where({ id: importLogId })
            .update({ status: 'RUNNING', updatedAt: new Date() });

          await importDatabase(connection, sources, logger, config.aws);
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
