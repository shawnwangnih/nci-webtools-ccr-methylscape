const r = require('r-wrapper').async;
const { results_folder } = require('../../config');

// args is a JSON body containing {fn: R function name, args: function args}
async function wrapper(args) {
  const results = await r('wrapper.R', 'wrapper', {
    ...args,
    save: results_folder,
  });
  return results;
}

module.exports = { wrapper };
