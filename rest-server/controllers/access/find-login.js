'use strict';

/**
 * Middleware controller to load the user, login, and on-behalf-of
 * objects into the `res.userlogin` object.
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
 * userLogin object.
 */
function discoverOnBehalfOfMiddleware(req, res, next) {
  // req.user is populated by passport to contain
  // the login object.
  if (! req.user) {
    // console.log("No user; forbidden.");
    return next(forbidden());
  }
  req.userLogin = null;
  var onBehalfOf = lookup(req.body, 'behalf') || lookup(req.query, 'behalf');

  findUserAndBehalf(req.user, onBehalfOf)
    .then(function(userLogin) {
      req.userLogin = userLogin;
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
  const Login = require('../../models').Login;
  req.user = null;
  var username = lookup(req.body, 'username') || lookup(req.query, 'username');
  // really, shouldn't be checking the query for the password.
  var password = lookup(req.body, 'password') || lookup(req.query, 'password');
  if (!! username) {
    log("getting login for " + username);
    Login.findOne({ _id: username }, function(err, login) {
      if (err) {
        return next(err);
      }
      req.login = login;
      if (!! login) {
        login.compareAuthentication(password, function(err, isMatch) {
          if (err) {
            return next(err);
          }
          if (! isMatch) {
            return next(forbidden());
          }
          req.user = login;
          next();
        });
      } else {
        next();
      }
    });
  } else {
    log("no login given");
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
