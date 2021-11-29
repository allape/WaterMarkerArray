const path = require('path');

module.exports = {
  mode: 'production',
  entry: './worker-config/ts-compiled/worker.js',
  output: {
    filename: 'core.worker.js',
    path: path.resolve(__dirname, '..', 'public'),
  },
};
