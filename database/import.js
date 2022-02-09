import { fileURLToPath } from "url";
import { createRequire } from "module";
import minimist from "minimist";
import { createSchema } from "./schema.js";
import { 
  createConnection, 
  createCsvRecordIterator, 
  importTable 
} from "./utils.js";

// determine if this script was launched from the command line
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);
const sources = require("./sources.json");

if (isMainModule) {
  const args = minimist(process.argv.slice(2));
  const connection = createConnection(args);
  await importDatabase(connection, sources);
  process.exit(0);
}

export async function importDatabase(connection, sources = sources) {
  await createSchema(connection);
  for (const { sourcePath, description, table, columns } of sources) {
    console.log(`Importing ${table}: ${description}`);
    const csvRecordIterator = createCsvRecordIterator(sourcePath, columns);
    await importTable(connection, csvRecordIterator, table);
  }
}
