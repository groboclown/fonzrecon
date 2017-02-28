'use strict';

// User access restriction, for use in passport or other login function.

const permissions = require('../../config/access/permissions');
const roles = require('../../config/access/roles');
const models = require('../../models');
const Account = models.Account;
const findUserAndBehalf = require('./find-user-and-behalf');
const BAD_LOGIN_TEXT = 'Authentication required';

module.exports = function(username, password) {
  return Account.findOne({ _id: username })
    .then(function(account) {
      if (! account) {
        // TODO perform the encrypt function to wait the same
        // amount of time as a found user call.
        // console.log('No account found named ' + username);
        return new Promise(function(resolve, reject) {
          var err = new Error(BAD_LOGIN_TEXT);
          err.isDone = true;
          reject(err);
        });
      } else {
        return account.compareAuthentication(password)
          .then(function(isMatch) {
            if (! isMatch) {
              // console.log('No auth match for ' + username);
              return new Promise(function(resolve, reject) {
                var err = new Error(BAD_LOGIN_TEXT);
                err.isDone = true;
                reject(err);
              });
            }
            return { account: account };
          });
      }
    })
};
