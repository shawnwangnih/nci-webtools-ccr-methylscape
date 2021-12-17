const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { importTable } = require("./utils");
const sqlite = require("better-sqlite3");
const sources = require("./sources.json");
const args = require("minimist")(process.argv.slice(2));

(async function main() {
  const databaseFilePath = args.db || "data.sqlite";

  if (fs.existsSync(databaseFilePath)) fs.unlinkSync(databaseFilePath);

  const mainSql = await fsp.readFile("schema/tables.sql", "utf-8");

  // create schema
  const database = sqlite(databaseFilePath);
  database.exec(mainSql);

  // import all sources into staging tables
  for (const source of sources) {
    const { type, sourcePath, stageTable } = source;
    await importTable(database, sourcePath, stageTable);
    const stageTableColums = database
      .pragma(`table_info("${stageTable}")`)
      .map((row) => row.name);

    // import global tables and proceed with study-specific imports
    if (type === "annotation") {
      const { organSystem, embeddings } = source;

      for (const embedding of embeddings) {
        console.log(`Importing ${organSystem}: ${embedding}`);

        const columns = {
          class: "Combined_class_match_dkfz",
          label: "NIH_labels",
          x: `${embedding}_x`,
          y: `${embedding}_y`,
        };

        if (
          stageTableColums.includes(columns.class) &&
          stageTableColums.includes(columns.label) &&
          stageTableColums.includes(columns.x) &&
          stageTableColums.includes(columns.y)
        ) {
          database.exec(
            `insert into annotation 
            (
              "organSystem",
              "embedding",
              "class",
              "label",
              "x",
              "y"
            )
            select
              '${organSystem}',
              '${embedding}',
              "${columns.class}",
              "${columns.label}",
              "${columns.x}",
              "${columns.y}"
            from "${stageTable}"`,
          );
        }
      }
    }
  }

  console.log("Generating indexes");
  database.exec(await fsp.readFile("schema/indexes.sql", "utf-8"));
  database.close();

  console.log("Done");
})();
