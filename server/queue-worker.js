const knex = require('knex');
const { noop } = require('lodash');
const { processMessages } = require('./services/queue.js');
const getLogger = require('./services/logger');
const CustomTransport = require('./services/customTransport.js');
const { importData } = require('./services/database/import');
const config = require('./config');
const { sources } = require('./services/database/sources.js');

const logger = getLogger('methylscape-queue-worker');
const connection = knex({
  client: 'pg',
  connection: config.database,
});
const customTransport = new CustomTransport();
logger.add(customTransport);
logger.info('Started methylscape queue worker');

processMessages({
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

    await connection('importLog')
      .where({ id: importLogId })
      .update({ status: 'RUNNING', updatedAt: new Date() });

    try {
      if (type === 'importData') {
        await connection('importLog')
          .where({ id: importLogId })
          .update({ status: 'RUNNING', updatedAt: new Date() });

        await importData(connection, logger, sources);
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
      customTransport.setHandler(noop);
    }
  },
});
