'use strict';

/**
 * REST API handlers around the account login.
 *
 *
 * TODO the actual REST API around the registration must be done
 * in the route.  This particular file should handle the generation of
 * the tickets.  Much of this needs to be rewritten.
 */

const access = require('./access');
const errors = require('./util').errors;
const models = require('../models');
const Account = models.Account;

// ==============================================
// Request handlers

exports.login = function(passport) {
  return function(req, res, next) {
    // If the user already has a browser token associated with this,
    // then remove it before attempting login.
    let username = req.body.username || req.query.username;
    let cleanupPromise;
    if (username) {
      cleanupPromise = access.token.removeToken(username, 'local', req);
    } else {
      cleanupPromise = new Promise(function(resolve, reject) { resolve() });
    }

    cleanupPromise
      .then(function() {
        return new Promise(function(resolve, reject) {
          passport.authenticate('local', function(err, user, info) {
            if (err) {
              return reject(err);
            }
            if (! user) {
              let err = new Error('Incorrect login');
              err.status = 401;
              return reject(err);
            }
            req.user = user;
            // Generate the request token for the user.
            resolve(access.token.generateToken(true, 'local', req));
          })(req, res, next);
        });
      })
      .then(function(browserToken) {
        res.status(200).json({
          token: browserToken.token,
          expires: browserToken.expires
        });
      })
      .catch(function(err) {
        next(err);
      });
   };
};


exports.logout = function(req, res, next) {
  // Unlike the other APIs, this one needs to be authorized.
  if (! req.user) {
    // Not logged in
    let err = new Error('Not logged in');
    err.status = 400;
    return next(err);
  }

  access.token
    .removeToken(req.user.userRef, 'local', req)
    .then(function() {
      res.status(200).json({});
    })
    .catch(function(err) {
      next(err);
    });
};



// =============================================
// Helper functions

function setUserInfo(req) {
  return {
    _id: req._id,
    username: req.username,
    email: req.email,
    role: req.role
  };
}

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return (!! email) && re.test(email);
}

function validateUsername(username) {
  const re = /^[a-z][a-z0-9_]{3,}$/
  return (!! username) && re.test(username);
}

function validateAuth(auth) {
  return (!! auth) && auth.length >= 6;
}
