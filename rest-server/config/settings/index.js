'use strict';

module.exports = {
  secret: require('./secret'),
  database: require('./database'),
  port: require('./port'),
  envName: require('./env-name'),
  ssl: require('./ssl'),
  staticFiles: require('./static-files')
};
