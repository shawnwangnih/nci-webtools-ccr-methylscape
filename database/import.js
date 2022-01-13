const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { importTable } = require('./utils');
const sqlite = require('better-sqlite3');
const sources = require('./sources.json');
const args = require('minimist')(process.argv.slice(2));

(async function main() {
  const databaseFilePath = args.db || 'data.sqlite';

  if (fs.existsSync(databaseFilePath)) fs.unlinkSync(databaseFilePath);

  const mainSql = await fsp.readFile('schema/tables.sql', 'utf-8');

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
    if (type === 'annotation') {
      const { organSystem, embeddings } = source;

      for (const embedding of embeddings) {
        console.log(`Importing ${organSystem}: ${embedding}`);

        const columns = {
          order: 'order',
          sample: 'Sample',
          idatFile: 'idat_filename',
          class: 'Combined_class_match_dkfz',
          label: 'NIH_labels',
          x: `${embedding}_x`,
          y: `${embedding}_y`,
          study: 'Primary_study',
          institution: 'Center_methy',
          category: 'Primary_category',
          matched: 'matched_cases',
        };

        if (
          stageTableColums.includes(columns.order) &&
          stageTableColums.includes(columns.sample) &&
          stageTableColums.includes(columns.idatFile) &&
          stageTableColums.includes(columns.class) &&
          stageTableColums.includes(columns.label) &&
          stageTableColums.includes(columns.x) &&
          stageTableColums.includes(columns.y) &&
          stageTableColums.includes(columns.study) &&
          stageTableColums.includes(columns.institution) &&
          stageTableColums.includes(columns.category) &&
          stageTableColums.includes(columns.matched)
        ) {
          database.exec(
            `insert into annotation 
            (
              "order",
              "sample",
              "idatFile",
              "organSystem",
              "embedding",
              "class",
              "label",
              "x",
              "y",
              "study",
              "institution",
              "category",
              "matched"
            )
            select
              "${columns.order}",
              "${columns.sample}",
              "${columns.idatFile}",
              '${organSystem}',
              '${embedding}',
              "${columns.class}",
              "${columns.label}",
              "${columns.x}",
              "${columns.y}",
              "${columns.study}",
              "${columns.institution}",
              "${columns.category}",
              "${columns.matched}"
            from "${stageTable}"`
          );
        }
      }
    }
  }

  console.log('Generating indexes');
  database.exec(await fsp.readFile('schema/indexes.sql', 'utf-8'));
  database.close();

  console.log('Done');
})();
