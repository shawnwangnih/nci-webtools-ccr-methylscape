import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import minimist from 'minimist';
import { schema } from './schema.js';
import {
  createConnection,
  createRecordIterator,
  importTable,
  initializeTablesForImport,
  withDuration,
} from './services/utils.js';
import { sources } from './sources.js';
import { getLogger } from './services/logger.js';


// determine if this script was launched from the command line
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

if (isMainModule) {
  const args = minimist(process.argv.slice(2));
  const logger = getLogger("import");
  const connection = createConnection(args);
  const config = require('./config.json');
  await importDatabase(connection, sources, logger, config.aws);
  process.exit(0);
}

export async function importDatabase(connection, sources, logger, config) {
  return await connection.transaction(async (transaction) => {
    await initializeTablesForImport(transaction, schema);
    for (const { sourcePath, description, table, columns } of sources) {
      logger.info(`Importing ${table} table (${description})`);
      const { results, duration } = await withDuration(async () => {
        const records = await createRecordIterator(sourcePath, columns, config);
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
