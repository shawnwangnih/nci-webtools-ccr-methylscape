const { parse } = require("csv-parse");

function castValue(value) {
  if (["NA", "", null, undefined].includes(value)) {
    return null;
  } else if (!isNaN(value)) {
    return +value;
  } else {
    return value;
  }
}

function getTxtParser(columns, options = {}) {
  return parse({
    delimiter: "\t",
    from_line: 2,
    cast: castValue,
    columns,
    ...options,
  });
}

function parseChromosome(chromosome) {
  return +String(chromosome).replace("chr", "").replace("X", "23").replace("Y", "24");
}

module.exports = {
  castValue,
  getTxtParser,
  parseChromosome,
};
