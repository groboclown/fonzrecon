'use strict';

const roles = require('../../config/access/roles');
const models = require('../../models');
const User = models.User;

module.exports = function(account, behalfOfName) {
  if (! roles.canRunOnBehalfOf.includes(account.role)) {
    // Ensure that, if the account can't run on behalf of
    // another user, that we don't load up the behalf-of
    // user object.
    behalfOfName = null;
  }
  return User.findOne({ username: account.userRef })
    .then(function(user) {
      // User might be null, and that's fine.
      if (! behalfOfName || behalfOfName.length <= 0) {
        return {
          account: account,
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
            account: account,
            user: user,
            behalf: behalfUser,
          }
        });
    });
};
