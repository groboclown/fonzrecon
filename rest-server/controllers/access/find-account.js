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
  // Note: req.user is populated by passport to contain
  // the account object.
  if (!req.user) {
    return next(forbidden());
  }
  req.userAccount = null;
  var role = roles[req.user.role];
  var onBehalfOf = null;
  if (role && role.canRunOnBehalfOf) {
    onBehalfOf = req.body.behalf || req.query.behalf;
  }

  findUserAndBehalf(req.user, onBehalfOf)
    .then((userAccount) => {
      req.userAccount = userAccount;
      next();
    })
    .catch((err) => {
      next(err);
    });
}


/**
 * Uses passport to perform logged in status check.
 */
function discoverUserMiddleware(passport) {
  return function(req, res, next) {
    passport.authenticate(['token', 'local'], (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(forbidden());
      }
      req.user = user;
      next();
    })(req, res, next);
  };
}

// =========================================================================
// Utility functions


function forbidden() {
  var err = new Error('Forbidden');
  err.status = 403;
  return err;
}
