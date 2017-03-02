'use strict';

/**
 * Middleware controller to load the user, account, and on-behalf-of
 * objects into the `res.userAccount` object.
 */

const permissions = require('../../config/access/permissions');
const roles = require('../../config/access/roles');
const findUserAndBehalf = require('./find-user-and-behalf');
const log = require('../../config/log');

module.exports = function(passport) {
  return [
    // TODO figure out the right way to specify passport here for
    // any of the authentication methods that don't require login/session.
    // passport.authenticate('jwt', { session: false}),
    // passport.authenticate('local', { session: false}),

    // Placeholder until we get logins working right.
    discoverUserMiddleware,

    // Then, load the user and on-behalf-of objects.
    discoverOnBehalfOfMiddleware
  ];
};


/**
 * Load the User and on-behalf-of objects into the final
 * userAccount object.
 */
function discoverOnBehalfOfMiddleware(req, res, next) {
  // req.user is populated by passport to contain
  // the account object.
  if (! req.user) {
    // console.log("No user; forbidden.");
    return next(forbidden());
  }
  req.userAccount = null;
  var onBehalfOf = null;
  if (roles.canRunOnBehalfOf.includes(req.user.role)) {
    onBehalfOf = lookup(req.body, 'behalf') || lookup(req.query, 'behalf');
  }

  findUserAndBehalf(req.user, onBehalfOf)
    .then(function(userAccount) {
      req.userAccount = userAccount;
      next();
    })
    .catch(function(err) {
      next(err);
    });
}


/**
 * Super simple middleware in case passport doesn't work.
 */
function discoverUserMiddleware(req, res, next) {
  if (req.user) {
    return next();
  }
  const Account = require('../../models').Account;
  req.user = null;
  var username = lookup(req.body, 'username') || lookup(req.query, 'username');
  // really, shouldn't be checking the query for the password.
  var password = lookup(req.body, 'password') || lookup(req.query, 'password');
  if (!! username) {
    log("getting account for " + username);
    var accountPromise = Account.findOne({ _id: username });
    var loginMatchPromise = accountPromise
      .then(function(account) {
        if (! account) {
          return null;
        }
        return account.getAuthenticationNamed('local');
      })
      .then(function(auth) {
        if (! auth) {
          return false;
        }
        return auth.onLogin({ password: password });
      });
    Promise.all([accountPromise, loginMatchPromise])
      .then(function(args) {
        let account = args[0];
        let isMatch = args[1];
        if (! account) {
          return next();
        }
        if (! isMatch) {
          return next(forbidden());
        }
        req.user = account;
        next();
      })
      .catch(function(err) {
        return next(err);
      });
  } else {
    log("no account given");
    next();
  }
}

// =========================================================================
// Utility functions

function lookup(obj, field) {
  if (!obj) { return null; }
  var chain = field.split(']').join('').split('[');
  for (var i = 0, len = chain.length; i < len; i++) {
    var prop = obj[chain[i]];
    if (typeof(prop) === 'undefined') { return null; }
    if (typeof(prop) !== 'object') { return prop; }
    obj = prop;
  }
  return null;
}


function forbidden() {
  var err = new Error('Forbidden');
  err.status = 403;
  return err;
}
