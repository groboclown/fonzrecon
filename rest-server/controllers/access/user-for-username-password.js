'use strict';

// User access restriction, for use in passport or other login function.

const permissions = require('../../config/access/permissions');
const roles = require('../../config/access/roles');
const models = require('../../models');
const Account = models.Account;
const BAD_LOGIN_TEXT = 'Authentication required';

module.exports = function(username, password) {
  var accountPromise = Account.findById(username);
  var loginMatchPromise = accountPromise
    .then((account) => {
      if (!account) {
        return null;
      }
      return account.getAuthenticationNamed('local');
    })
    .then((auth) => {
      if (!auth) {
        return false;
      }
      return auth.onLogin({ password: password });
    });
  return Promise
    .all([accountPromise, loginMatchPromise])
    .then((args) => {
      let account = args[0];
      let isMatch = args[1];
      if (!account) {
        return false;
      }
      if (!isMatch) {
        return false;
      }
      return account;
    });
};
