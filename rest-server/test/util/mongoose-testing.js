'use strict';

const dbUri = 'mongodb://localhost/fonzrecon-rest-test';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
exports.models = require('../../models');
const clearDb = require('mocha-mongoose')(dbUri);


exports.before = function(done) {
  if (mongoose.connection.db) {
    return done();
  }
  mongoose.connect(dbUri, done);
};
