'use strict';

const models = require('../../models');
const User = models.User;

module.exports = function(login, behalfOfName) {
  return User.findOne({ username: login.userRef })
    .then(function(user) {
      // User might be null, and that's fine.
      if (! behalfOfName || behalfOfName.length <= 0) {
        return {
          login: login,
          user: user,
          behalf: null,
        }
      }
      return User.findOneByName(behalfOfName)
        .then(function(behalfUser) {
          // if behalf-of was specified, but the
          // behalf-of user does not exist, then this is
          // an error.
          if (! behalfUser) {
            return null;
          }
          return {
            login: login,
            user: user,
            behalf: behalfUser,
          }
        });
    });
};
