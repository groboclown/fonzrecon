'use strict';

const MockODM = require('./mock_api');
// Note: due to load order, can't use `require('./config').access
const roles = require('../config/access').roles;

// For now, uses hard-coded values
const LOGIN_LIST = [
  {
    username: 'user1',
    email: 'user1@fonzrecon.github',
    authentication: '1234',
    role: roles.USER.name,
    resetAuthenticationToken: null,
    resetAuthenticationExpires: null,
    userRef: 'user1',
  },
  {
    username: 'bot1',
    email: 'bot1@fonzrecon.github',
    authentication: 'bot!',
    role: roles.BOT.name,
    resetAuthenticationToken: null,
    resetAuthenticationExpires: null,

    // cannot act as a user, meaning no one
    // can assign it stuff or send it stuff,
    // so it has no user.
    userRef: null,
  },
  {
    username: 'admin1',
    email: 'admin1@fonzrecon.github',
    authentication: 'sekret',
    role: roles.ADMIN.name,
    resetAuthenticationToken: null,
    resetAuthenticationExpires: null,
    userRef: 'admin1',
  },
];

const LoginDb = new MockODM(LOGIN_LIST);

LoginDb.extractData = function(d) {
  if (! d.compareAuthentication) {
    d.compareAuthentication = function(candidateAuthentication, cb) {
      return cb(null, this.authentication === candidateAuthentication);
    };
  }
  return d;
};

module.exports = LoginDb;
