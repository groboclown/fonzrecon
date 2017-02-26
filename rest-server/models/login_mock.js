'use strict';

const MockODM = require('./mock_api');
const roles = require('../lib/access/roles');

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

LoginDb.compareAuthentication = function(candidateAuthentication, cb) {
  return cb(null, this.authentication === candidateAuthentication);
};

module.exports = LoginDb;
