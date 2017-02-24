'use strict';

const AWS = require('aws-sdk');

function DbAccess(config) {
  AWS.config.update(config);
}


module.exports = DbAccess;
