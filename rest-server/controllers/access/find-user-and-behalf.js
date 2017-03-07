'use strict';

const roles = require('../../config/access/roles');
const models = require('../../models');
const User = models.User;
const Account = models.Account;

module.exports = function(account, behalfOfName) {
  const role = roles[account.role];
  if (role && ! role.canRunOnBehalfOf) {
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
      var behalfPromise = User
        .findOneByName(behalfOfName)
        .exec();
      var behalfAcctPromise = behalfPromise
        .then(function(behalfUser) {
          if (! behalfUser) {
            return null;
          }
          return Account
            .findOne({ userRef: behalfUser.username });
        });
      return Promise
        .all([behalfPromise, behalfAcctPromise])
        .then(function(args) {
          var behalfUser = args[0];
          var behalfAcct = args[1];

          // If the behalf-of user doesn't have an account,
          // then the request is bad, so null out the behalf-of
          // user.
          if (! behalfAcct) {
            behalfUser = null;
          }

          return {
            account: account,
            user: user,
            behalfAcount: behalfAcct,
            behalf: behalfUser,
          }
        });
    });
};
