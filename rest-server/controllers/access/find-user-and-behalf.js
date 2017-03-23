'use strict';

const roles = require('../../config/access/roles');
const models = require('../../models');
const User = models.User;
const Account = models.Account;

module.exports = function(account, behalfOfName) {
  const role = roles[account.role];
  if (role && !role.canRunOnBehalfOf) {
    // Ensure that, if the account can't run on behalf of
    // another user, that we don't load up the behalf-of
    // user object.
    behalfOfName = null;
  }
  return User
    .findOneByUsername(account.userRef)
    .then((user) => {
      // User might be null, and that's fine.
      if (!behalfOfName || behalfOfName.length <= 0) {
        return {
          account: account,
          user: user,
          behalf: null
        };
      }
      // Search by name, not username.
      var behalfPromise = User
        .findOneByName(behalfOfName)
        .exec();
      var behalfAcctPromise = behalfPromise
        .then((behalfUser) => {
          if (!behalfUser) {
            return null;
          }
          return Account
            .findByUserRef(behalfUser.username);
        });
      return Promise
        .all([behalfPromise, behalfAcctPromise])
        .then((args) => {
          var behalfUser = args[0];
          var behalfAcct = args[1];

          // If the behalf-of user doesn't have an account,
          // then the request is bad, so null out the behalf-of
          // user.
          if (!behalfAcct) {
            behalfUser = null;
          }

          return {
            account: account,
            user: user,
            behalfAcount: behalfAcct,
            behalf: behalfUser
          };
        });
    });
};
