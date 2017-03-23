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
const createUserApi = require('../../lib/create-user-api');
const roles = require('../../config/access/roles');

chai.use(chaiHttp);

const assert = chai.assert;

exports.models = require('../../models');


exports.beforeDb = function(done) {
  if (mongoose.connection.db) {
    return done();
  }
  mongoose.connect(dbUri, done);
};


exports.createOrGetUserAccount = function(userData) {
  return exports.models.User
    .findOneByUsername(userData.username)
    .then((user) => {
      if (user) {
        return user;
      }
      let userAccountPromise = createUserApi.createUserAccount(userData, true);
      if (!userData.password) {
        return userAccountPromise.then((args) => { return args[0]; });
      }

      let authPromise = userAccountPromise
        .then((args) => {
          return args[2].getAuthenticationNamed('local');
        });
      let accountPromise = Promise
        .all([authPromise, userAccountPromise])
        .then((args) => {
          let auth = args[0];
          let user = args[1][0];
          let account = args[1][2];
          account.resetAuthenticationToken = null;
          account.resetAuthenticationExpires = null;
          if (auth) {
            auth.userInfo = [req.body.password];
            // Reset any existing tokens.
            auth.browser = [];
          } else {
            account.authentications.push({
              source: 'local',
              id: account.accountEmail,
              userInfo: [userData.password],
              browser: []
            });
          }
          return account.save();
        });
      return Promise
        .all([userAccountPromise, accountPromise])
        .then((args) => {
          return args[0][0];
        });
    });
};


exports.createOrGetUser = function(userData) {
  userData.role = roles.USER.name;
  return exports.createOrGetUserAccount(userData);
};


exports.createOrGetAdmin = function(userData) {
  userData.role = roles.ADMIN.name;
  return exports.createOrGetUserAccount(userData);
};


exports.createOrGetBot = function(botData) {
  botData.role = roles.BOT.name;
  return exports.models.Account
    .findByUserRef(botData.username)
    .then((account) => {
      if (account) {
        return account;
      }
      return createUserApi.createBot(botData);
    });
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
