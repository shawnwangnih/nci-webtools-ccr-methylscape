const {
  createRecordIterator,
  importTable,
  withDuration,
  resetTables,
} = require('./utils');

const tables = ['sampleCoordinates', 'sample', 'annotations', 'genes'];

async function importData(connection, logger, sources) {
  await connection.transaction(async (transaction) => {
    logger.info('Initialized data import');
    for (const table of tables) {
      await connection.raw('TRUNCATE ?? RESTART IDENTITY CASCADE', [table]);
    }

    for (const { sourcePath, description, table, columns } of sources) {
      logger.info(`Importing ${table} table (${description})`);
      const { results, duration } = await withDuration(async () => {
        const records = await createRecordIterator(sourcePath, columns);
        return await importTable(transaction, records, table, logger);
      });
      logger.info(
        `Finished importing ${table} table in ${Math.round(
          duration
        )}s (${Math.round(results / duration)} rows/s)`
      );
    }
    return true;
  });
}

module.exports = { importData };
