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
const User = models.User;

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
      cleanupPromise = Promise.resolve(null);
    }

    cleanupPromise
      .then(() => {
        return new Promise(function(resolve, reject) {
          passport.authenticate('local', (err, user, info) => {
            if (err) {
              return reject(err);
            }
            if (!user) {
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
      .then((browserToken) => {
        res.status(200).json({
          token: browserToken.token,
          expires: browserToken.expires
        });
      })
      .catch((err) => {
        next(err);
      });
  };
};


exports.logout = function(req, res, next) {
  // Unlike the other APIs, this one needs to be authorized.
  if (!req.user) {
    // Not logged in
    let err = new Error('Not logged in');
    err.status = 400;
    return next(err);
  }

  access.token
    .removeToken(req.user.userRef, 'local', req)
    .then(() => {
      res.status(200).json({});
    })
    .catch((err) => {
      next(err);
    });
};


/**
 * Validate a user's password change, and perform the password change.
 * The user must provide the username and password.
 */
exports.validate = function(req, res, next) {
  // If the requested account does not have an existing local account,
  // it should be created here.

  req.checkBody({
    resetAuthenticationToken: {
      isLength: {
        options: [{ min: 4, max: 100 }]
      },
      notEmpty: true
    },
    username: {
      isLength: {
        options: [{ min: 3, max: 100 }],
        errorMessage: 'must be more than 3 characters, and less than 100'
      },
      isAlphanumeric: {
        errorMessage: 'must be only alphanumeric characters'
      },
      notEmpty: true
    },
    password: {
      isLength: {
        options: [{ min: 6, max: 100 }],
        errorMessage: 'must be more than 3 characters, and less than 100'
      },
      notEmpty: true
    }
  });

  var accountPromise = req.getValidationResult()
    .then((results) => {
      if (!results.isEmpty()) {
        throw errors.validationProblems(results.array());
      }

      return Account
        .findByUserResetAuthenticationToken(
          req.body.username, req.body.resetAuthenticationToken)
    })
    .then((account) => {
      if (!account) {
        throw errors.extraValidationProblem(
          'username and resetAuthenticationToken', [], 'username does not have active token');
      }
    });
  var userPromise = accountPromise
    .then((account) => {
      return User.findOne({ username: account.userRef });
    });
  var savedAccountPromise = accountPromise
    .then((account) => {
      // Update the account entry
      account.resetAuthenticationToken = null;
      account.resetAuthenticationExpires = null;
      let auth = account.getAuthenticationNamed('local');
      if (auth) {
        auth.userInfo = [req.body.password];
      } else {
        account.authentications.push({
          source: 'local',
          id: account.accountEmail,
          userInfo: [req.body.password],
          browser: []
        });
      }
      return account.save();
    });
  Promise
    .all([accountPromise, userPromise, savedAccountPromise])
    .then((args) => {
      // Do not automatically log the user in.
      // For that, use the existing API call.
      res.status(200).json({});

      var toUser = args[1] || args[0];

      // Tell the user about the password change.
      email.send('password-changed', toUser, {
        username: account.userRef
      });

    })
    .catch((err) => {
      next(err);
    });
};


exports.requestPasswordChange = function(req, res, next) {
  var condition = {};
  if (req.body.username && typeof(req.body.username) === 'string') {
    condition.userRef = req.body.username;
  }
  if (req.body.email && typeof(req.body.email) === 'string') {
    condition.email = req.body.email;
  }

  var accountPromise = Account.findOne(condition);
  var accountResetPromise = accountPromise
    .then((account) => {
      if (!account) {
        throw errors.resourceNotFound();
      }
      return account.resetAuthentication();
    });
  var userAccountPromise = accountResetPromise
    .then(() => {
      return User.findOne({ username: req.body.username });
    });
  Promise
    .all([accountPromise, userAccount, accountResetPromise])
    .then((args) => {
      var toUser = args[1] || args[0];
      var resetValues = args[2];

      res.status(200).json(resetValues);

      email.send('reset-password', toUser, {
        username: req.body.username,
        resetAuthenticationToken: resetValues.resetAuthenticationToken,
        resetAuthenticationExpires: resetValues.resetAuthenticationExpires
      });

    })
    .catch((err) => {
      next(err);
    });
};
