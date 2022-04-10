import { basename } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import minimist from 'minimist';
import {
  createConnection,
  createRecordIterator,
  importTable,
  initializeSchemaForImport,
  loadAwsCredentials,
  withDuration,
} from './services/utils.js';
import { LocalProvider } from './services/providers/localProvider.js';
import { S3Provider } from './services/providers/s3Provider.js';
import { getLogger } from './services/logger.js';
import { S3Client } from '@aws-sdk/client-s3';
import groupBy from 'lodash/groupBy.js';

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

export async function importDatabase(connection, schema, sources, sourceProvider, logger, forceRecreate = false) {
  const tableSchemaMap = groupBy(schema, 'name');
  await initializeSchemaForImport(connection, schema, forceRecreate);

  let totalCount = 0;
  const { results, duration } = await withDuration(async () => {
    for (let source of sources) {
      const { description, table, columns, skipImport, parseConfig } = source;
      const { partitionSchema } = tableSchemaMap[table][0];
      const sourcePaths = await getSourcePaths(source, sourceProvider);

      for (const sourcePath of sourcePaths) {
        logger.info(`Importing ${sourcePath} => ${table} (${description})`);
        const metadata = { filename: basename(sourcePath) };

        // determine if import should be skipped
        const shouldSkip = typeof skipImport === 'function' &&
          await skipImport(connection, metadata);

        if (shouldSkip) {
          logger.info(`Skipping import of ${sourcePath} => ${table} (${description})`);
        } else {
          // initialize partition if needed
          if (typeof partitionSchema === 'function') {
            await partitionSchema(connection, metadata);
          }

          const { results, duration } = await connection.transaction(async (transaction) => {
            return await withDuration(async () => {
              const records = await createRecordIterator(sourcePath, sourceProvider, { columns, parseConfig });
              return await importTable(transaction, records, table, logger);
            });
          });

          totalCount += results;
          logger.info(getStatusMessage({ results, duration }));
        }
      }
    }
    return totalCount;
  });

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
