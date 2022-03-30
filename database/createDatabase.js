import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { schema } from './schema.js';
import { createConnection, initializeTables } from './services/utils.js';

// determine if this script was launched from the command line
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

if (isMainModule) {
  const config = require('./config.json');
  const connection = createConnection(config.database);
  await initializeTables(connection, schema);
  console.log("Initialized all tables");
  process.exit(0);
}