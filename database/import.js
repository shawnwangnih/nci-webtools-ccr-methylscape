import { createReadStream } from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { parse } from "csv-parse";
import knex from "knex";
import { createSchema } from "./schema.js";
import minimist from "minimist";

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

  // create schema
  await createSchema(connection);

  // import all sources into staging tables
  for (const { sourcePath, description, table, columns } of sources) {
    console.log(`Importing ${table}: ${description}`);

    const parseOptions = {
      columns: true,
      skip_empty_lines: true,
      cast: (column) => {
        if (column === "") {
          return null;
        } else if (!isNaN(column)) {
          return parseFloat(column);
        } else {
          return column;
        }
      },
      on_record: (record) => {
        let row = {};
        for (const { sourceName, name, defaultValue } of columns) {
          row[name] = record[sourceName] ?? defaultValue ?? null;
        }
        return row;
      },
    };

    const parser = createReadStream(sourcePath).pipe(parse(parseOptions));

    let index = 0;
    for await (const record of parser) {
      try {
        await connection.insert(record).into(table);
      } catch (error) {
        console.log(record);
        throw error;
      }
      if (++index % 1000 === 0) {
        console.log(`Imported ${index} rows`);
      }
    }

    console.log(`Imported ${index} rows`);
  }
}
