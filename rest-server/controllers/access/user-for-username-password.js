'use strict';

// User access restriction, for use in passport or other login function.

const permissions = require('../../config/access/permissions');
const roles = require('../../config/access/roles');
const models = require('../../models');
const Login = models.Login;
const findUserAndBehalf = require('./find-user-and-behalf');

module.exports = function(username, password) {
  return Login.findOne({ _id: username })
    .then(function(login) {
      if (! login) {
        // TODO perform the encrypt function to wait the same
        // amount of time as a found user call.
        // console.log('No login found named ' + username);
        return new Promise(function(resolve, reject) {
          var err = new Error(BAD_LOGIN_TEXT);
          err.isDone = true;
          reject(err);
        });
      } else {
        return login.compareAuthentication(password)
          .then(function(isMatch) {
            if (! isMatch) {
              // console.log('No auth match for ' + username);
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
