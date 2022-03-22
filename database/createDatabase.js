import minimist from 'minimist';
import { schema } from './schema.js';
import { createConnection, initializeTables } from './services/utils.js';

const args = minimist(process.argv.slice(2));
const connection = createConnection(args);
await initializeTables(connection, schema);
console.log("Initialized all tables");
process.exit(0);