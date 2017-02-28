'use strict';

const roles = require('../../config/access/roles');
const models = require('../../models');
const User = models.User;

module.exports = function(login, behalfOfName) {
  if (! roles.canRunOnBehalfOf.includes(login.role)) {
    // Ensure that, if the login can't run on behalf of
    // another user, that we don't load up the behalf-of
    // user object.
    behalfOfName = null;
  }
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
      // Search by name, not username.
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
