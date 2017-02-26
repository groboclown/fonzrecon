'use strict';


const path = require('path');
const extend = require('util')._extend;

const defaults = {
  root: path.join(__dirname, '..'),
};


const environments = {
  production: extend(require('./production'), defaults),
  development: extend(require('./development'), defaults),
  test: extend(require('./test'), defaults),
};

module.exports = function() {
  var env = environments[require('../settings').envName];
  if (! env) {
    env = environments['production'];
  }
  return env;
};
