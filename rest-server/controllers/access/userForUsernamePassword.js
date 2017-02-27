'use strict';

// User access restriction, for use in passport or other login function.

const permissions = require('../../config/access/permissions');
const roles = require('../../config/access/roles');
const models = require('../../models');
const Login = models.Login;
const findUserAndBehalf = require('./findUserAndBehalf');

module.exports = function(username, password) {
  return Login.findOne({ username: username })
    .then(function(login) {
      if (! login) {
        // TODO perform the encrypt function to wait the same
        // amount of time as a found user call.
        return new Promise(function(resolve, reject) {
          var err = new Error(BAD_LOGIN_TEXT);
          err.isDone = true;
          reject(err);
        });
      } else {
        return login.compareAuthentication(password)
          .then(function(isMatch) {
            if (! isMatch) {
              return new Promise(function(resolve, reject) {
                var err = new Error(BAD_LOGIN_TEXT);
                err.isDone = true;
                reject(err);
              });
            }
            return { login: login };
          });
      }
    })
};
