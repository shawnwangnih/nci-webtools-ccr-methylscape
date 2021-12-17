const fsp = require("fs/promises");
const path = require("path");
const parseCsv = require("csv-parse/lib/sync");

module.exports = {
  readFileAsArray,
  importTable,
};

async function readFileAsArray(filePath) {
  switch (path.extname(filePath)) {
    case ".tsv":
      const contents = await fsp.readFile(filePath, "utf-8");
      return parseCsv(contents, {
        delimiter: "\t",
        columns: true,
        skip_empty_lines: true,
      });

    default:
      return [];
  }
}

async function importTable(database, filePath, tableName) {
  const rows = await readFileAsArray(filePath);
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);

  database.exec(
    `drop table if exists "${tableName}";
    create temporary table "${tableName}" (
        ${headers.map((header) => `"${header}" text`).join(",")}
    );`,
  );

  const placeholders = headers.map(() => "?").join(",");
  const insertStatement = database.prepare(
    `insert into "${tableName}" values (${placeholders})`,
  );

  const insertRows = database.transaction((rows) => {
    for (const row of rows) {
      const values = headers
        .map((header) => row[header])
        .map((value) => (value === "" ? null : value));

      insertStatement.run(values);
    }
  });

  insertRows(rows);
}
