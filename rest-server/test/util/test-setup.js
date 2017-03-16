'use strict';

// Turn off unnecessary logging and such from the server.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mongodb://localhost/fonzrecon-rest-test';

const dbUri = 'mongodb://localhost/fonzrecon-rest-test';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const clearDb = require('mocha-mongoose')(dbUri);
const chai = require('chai');
const chaiHttp = require('chai-http');
exports.server = require('../../app');

chai.use(chaiHttp);

const assert = chai.assert;

exports.models = require('../../models');


exports.beforeDb = function(done) {
  if (mongoose.connection.db) {
    return done();
  }
  mongoose.connect(dbUri, done);
};


exports.request = function() {
  return chai.request(exports.server);
};


/**
 * @return the login token as a promise result.
 */
exports.getLoginToken = function(username, password) {
  return exports.request()
    .post('/auth/login')
    .send({ username: username, password: password })
    .then((res) => {
      assert.equal(res.status, 200, 'status');
      assert.isString(res.body.token, 'token');
      return res.body.token;
    });
};
