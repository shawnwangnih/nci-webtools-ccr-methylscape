import { fileURLToPath } from "url";
import { createRequire } from "module";
import minimist from "minimist";
import { createSchema } from "./schema.js";
import { 
  createConnection, 
  createRecordIterator, 
  importTable, 
  withDuration
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
  return await connection.transaction(async transaction => {
    await createSchema(transaction);
    for (const { sourcePath, description, table, columns } of sources) {
      console.log(`Importing ${table} table (${description})`);
      const { results, duration } = await withDuration(async () => {
        const records = createRecordIterator(sourcePath, columns);
        return await importTable(transaction, records, table);
      });
      console.log(`Finished importing ${table} table in ${Math.round(duration)}s (${Math.round(results / duration)} rows/s)`);
    }
    return true;
  });
}
