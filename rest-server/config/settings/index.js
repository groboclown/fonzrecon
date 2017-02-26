'use strict';

module.exports = {
  secret: require('./secret')(),
  database: require('./database')(),
  port: require('./port')(),
  passport: require('./passport')(),
  envName: require('./envName')(),
  ssl: require('./ssl')(),
};
