import { basename, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import minimist from 'minimist';
import {
  createConnection,
  createRecordIterator,
  getFileMetadataFromPath,
  importTable,
  initializeSchemaForImport,
  loadAwsCredentials,
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
  const schemaPath = pathToFileURL(args.schema || './schema.js');
  const sourcesPath = pathToFileURL(args.sources || './sources.js');
  const providerName = args.provider || 'local';
  const forceRecreate = args.recreate;
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
  await importDatabase(connection, schema, sources, sourceProvider, logger, forceRecreate);
  process.exit(0);
}

export async function importDatabase(connection, schema, sources, sourceProvider, logger, forceRecreate = false) {
  const tableSources = sources.filter(source => source.table);
  const postImportSources = sources.filter(source => source.type === 'postImport');
  let totalCount = 0;
  
  let { results, duration } = await withDuration(async () => {
    return await connection.transaction(async (connection) => {
      await initializeSchemaForImport(connection, schema, sources, forceRecreate);

      for (let source of tableSources) {
        const { description, table, columns, skipImport, parseConfig } = source;
        const shouldSkip = skipImport ? await skipImport(connection) : () => false;
        const sourcePaths = await getSourcePaths(source, sourceProvider);
  
        for (const sourcePath of sourcePaths) {
          const metadata = getFileMetadataFromPath(sourcePath);
          if (shouldSkip(metadata)) continue;
  
          logger.info(`Importing ${sourcePath} => ${table} (${description})`);
          const { results, duration } = await withDuration(async () => {
            const records = await createRecordIterator(sourcePath, sourceProvider, { columns, parseConfig });
            return await importTable(connection, records, table, logger);
          });

          logger.info(getStatusMessage({ results, duration }));
          totalCount += results;
        }
      }
      return totalCount;
    })
  });

  // post-import callbacks are executed after the transaction is committed
  // this is to allow the database to autovacuum/analyze/etc.
  for (const source of postImportSources) {  
    logger.info(`Running post-import step: ${source.description}`);
    const status = await withDuration(async () => await source.callback(connection));
    logger.info(`${status.results} (${(status.duration.toFixed(2))}s)`);
    duration += status.duration;
  }

  logger.info(getStatusMessage({ results, duration }));
}

async function getSourcePaths(source, sourceProvider) {
  return (source.type === 'folder')
    ? await sourceProvider.listFiles(source.sourcePath)
    : [source.sourcePath]
}

function getStatusMessage({ results, duration }) {
  return `Finished importing ${results} rows in ${(
    duration.toFixed(2)
  )}s (${Math.round(results / duration)} rows/s)`;
}
