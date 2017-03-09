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
    discoverUserMiddleware(passport),
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
  var role = roles[req.user.role];
  var onBehalfOf = null;
  if (role && role.canRunOnBehalfOf) {
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
function discoverUserMiddleware(passport) {
  return function(req, res, next) {
    console.log('starting passport auth check');
    passport.authenticate(['token', 'local'], function(err, user, info) {
      if (err) {
        console.log(`Passport error: ${err.message}`);
        console.log(err.stack);
        return next(err);
      }
      if (!user) {
        console.log(`forbidden via passport`);
        return next(forbidden());
      }
      console.log(`setting user`);
      req.user = user;
      next();
    })(req, res, next);
  };
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
