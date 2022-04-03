import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import minimist from 'minimist';
import {
  createConnection,
  createRecordIterator,
  importTable,
  importTableFromScript,
  initializeSchemaForImport,
  loadAwsCredentials,
  recreateTable,
  withDuration,
} from './services/utils.js';
import { LocalProvider } from './services/providers/localProvider.js';
import { S3Provider } from './services/providers/s3Provider.js';
import { getLogger } from './services/logger.js';
import { S3Client } from '@aws-sdk/client-s3';

// determine if this script was launched from the command line
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

if (isMainModule) {
  const config = require('./config.json');
  const args = minimist(process.argv.slice(2));
  const schemaPath = args.schema || './schema.js';
  const sourcesPath = args.sources || './sources.js';
  const providerName = args.provider || 'local';
  let providerArgs = [...args._];

  const SourceProvider = {
    local: LocalProvider,
    s3: S3Provider
  }[providerName];

  if (!SourceProvider) {
    throw new Error(`Unknown provider: ${providerName}`);
  }

  // if using an s3 provider, 
  // - load credentials into the environment
  // - determine the base path for the source data
  if (SourceProvider === S3Provider) {
    loadAwsCredentials(config.aws);
    const s3Client = new S3Client();
    const basePath = providerArgs[0] || `s3://${config.aws.s3DataBucket}/${config.aws.s3DataKey}`;
    providerArgs = [s3Client, basePath];
  }

  const connection = createConnection(config.database);
  const { schema } = await import(schemaPath);
  const { sources } = await import(sourcesPath);
  const sourceProvider = new SourceProvider(...providerArgs);
  const logger = getLogger("import");
  await importDatabase(connection, schema, sources, sourceProvider, logger);
  process.exit(0);
}

export async function importDatabase(connection, schema, sources, sourceProvider, logger) {
  // although we would like to use transactions for the
  // return await connection.transaction(async (transaction) => {
  return (async (transaction) => {
    await initializeSchemaForImport(transaction, schema);

    let totalCount = 0;
    const { results, duration } = await withDuration(async () => {
      for (let { sourcePath, type, description, table, columns, parseConfig, temporarySchema, importScript } of sources) {
        const sourcePaths = type === 'folder'
          ? await sourceProvider.listFiles(sourcePath)
          : [ sourcePath ];
  
        for (const sourcePath of sourcePaths) {
          logger.info(`Importing ${sourcePath} => ${table} (${description})`);
  
          const { results, duration } = await withDuration(async () => {
            const records = await createRecordIterator(sourcePath, sourceProvider, { columns, parseConfig });
            const count = (temporarySchema && importScript)
              ? await importTableFromScript(transaction, records, temporarySchema, importScript, logger)
              : await importTable(transaction, records, table, logger);

            return count;
          });

          totalCount += results;
          logger.info(
            `Finished importing ${sourcePath} => ${table} in ${(
              duration.toFixed(2)
            )}s (${Math.round(results / duration)} rows/s)`
          );
        }
      }
      return totalCount;
    });

    logger.info(
      `Finished importing ${results} rows in ${(
        duration.toFixed(2)
      )}s (${Math.round(results / duration)} rows/s)`
    );

    return true;
  })(connection);
}