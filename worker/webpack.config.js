const path = require('path');

module.exports = {
  mode: 'production',
  entry: './ts-compiled/core/worker.js',
  output: {
    filename: 'core.worker.js',
    path: path.resolve(__dirname, 'docs'),
  },
};
