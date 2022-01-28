const r = require('r-wrapper').async;
const path = require('path');
const fs = require('fs');
const { v4: uuidv4, validate } = require('uuid');
const { results_folder } = require('../../config');

// args is a JSON body containing {fn: R function name, args: function args}
async function wrapper(args) {
  const id = uuidv4();
  fs.mkdirSync(path.join(results_folder, id));
  const results = await r('services/R/wrapper.R', 'wrapper', {
    ...args,
    paths: { save: results_folder, id: id },
  });
  return results;
}

module.exports = { wrapper };
