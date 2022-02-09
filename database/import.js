import { fileURLToPath } from "url";
import { createRequire } from "module";
import knex from "knex";
import minimist from "minimist";
import { createSchema } from "./schema.js";
import { createCsvRecordIterator, importTable } from "./utils.js";

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);
const sources = require("./sources.json");

if (isMainModule) {
  const args = minimist(process.argv.slice(2));

  const connection = knex({
    client: "pg",
    connection: {
      host: args.host || "localhost",
      port: args.port || 5432,
      user: args.user || "methylscape",
      password: args.password || "methylscape",
      database: args.database || "methylscape",
    },
  });

  importDatabase(connection, sources)
    .then(async () => {
      console.log("done");
      await connection.destroy();
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export async function importDatabase(connection, sources = sources) {
  await createSchema(connection);

  for (const { sourcePath, description, table, columns } of sources) {
    console.log(`Importing ${table}: ${description}`);
    const csvRecordIterator = createCsvRecordIterator(sourcePath, columns);
    await importTable(csvRecordIterator, table);
  }
}
