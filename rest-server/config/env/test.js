'use strict';

const path = require('path');

module.exports = {
  db: require('../settings').database,
  emailProvider: 'test-email',
  staticFiles: path.join(__dirname, '../../.tmp/static'),
  debug: (msg, err) => {
    if (!err && msg && msg.stack) {
      err = msg;
      msg = null;
    }
    if (err) {
      console.log(`DEBUG ERROR ${msg} - ${err}`);
      if (err.stack) {
        console.log(err.stack);
      }
    }
  },
  logError: (err) => {
    if (!err.status || err.status === 500) {
      if (err.details) { console.error(JSON.stringify(err.details)); }
      console.error(err.stack);
    }
  },
  setupLogger: (app) => {
    // Do nothing
  }
};
