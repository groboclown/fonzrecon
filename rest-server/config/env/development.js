'use strict';

const logger = require('morgan');

module.exports = {
  db: require('../settings').database,
  emailProvider: null,
  staticFiles: require('../settings').staticFiles,
  debug: (msg, err) => {
    if (!err && msg && msg.stack) {
      err = msg;
      msg = null;
    }
    if (msg) {
      console.log(`DEBUG ${msg}`);
    }
    if (err) {
      console.log(`DEBUG ERROR ${err}`);
      if (err.stack) {
        console.log(err.stack);
      }
    }
  },
  logError: (err) => {
    console.error(err.stack);
  },
  setupLogger: (app) => {
    app.use(logger('dev'));
  }
};
