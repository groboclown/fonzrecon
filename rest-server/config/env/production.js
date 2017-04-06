'use strict';

const logger = require('morgan');

module.exports = {
  db: require('../settings').database,
  emailProvider: null,
  staticFiles: require('../settings').staticFiles,
  debug: (msg, err) => {
    // Do nothing
  },
  logError: (err) => {
    if (!err.status || err.status === 500) {
      if (err.details) { console.error(JSON.stringify(err.details)); }
      console.error(err.stack);
    }
  },
  setupLogger: (app) => {
    app.use(logger('dev'));
  }
};
