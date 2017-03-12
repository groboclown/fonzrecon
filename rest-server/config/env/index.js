'use strict';


const path = require('path');
const extend = require('util')._extend;

const defaults = {
  root: path.join(__dirname, '..')
};


const environments = {
  production: extend(require('./production'), defaults),
  development: extend(require('./development'), defaults),
  test: extend(require('./test'), defaults)
};

var envName = require('../settings').envName;
if (!envName || !environments[envName]) {
  envName = 'production';
}
module.exports = environments[envName];
