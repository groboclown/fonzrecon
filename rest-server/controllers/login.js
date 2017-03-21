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
const notify = require('../lib/notify');
const validate = require('../lib/validate');
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
        // TODO if we *really* wanted to be good, we could detect if this
        // was the first login for this specific browser (a new browser
        // record was created).  If so, we could send an email letting the
        // user know that the login from a new location happened.

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

  // TODO to support the login from new location detection, this
  // should instead just null out the token rather than delete the
  // browser reference.
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
          req.body.username, req.body.resetAuthenticationToken);
    })
    .then((account) => {
      if (!account) {
        throw errors.extraValidationProblem(
          'username and resetAuthenticationToken', [], 'username does not have matching active token');
      }
      return account;
    });
  var userPromise = accountPromise
    .then((account) => {
      return User.findOne({ username: account.userRef });
    });
  var authPromise = accountPromise
    .then((account) => {
      // Update the account entry
      account.resetAuthenticationToken = null;
      account.resetAuthenticationExpires = null;
      return account.getAuthenticationNamed('local');
    });
  var savedAccountPromise = Promise
    .all([accountPromise, authPromise])
    .then((args) => {
      let account = args[0];
      let auth = args[1];
      if (auth) {
        auth.userInfo = [req.body.password];
        // Reset any existing tokens.
        auth.browser = [];
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
      notify.send('password-changed', toUser, {
        username: args[0].userRef
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
    condition.accountEmail = req.body.email;
    if (!validate.isEmailAddress(condition.accountEmail)) {
      return next(errors.extraValidationProblem('email', condition.accountEmail,
        'invalid email address format'));
    }
  }

  var accountPromise = Account.findOne(condition);
  var accountResetPromise = accountPromise
    .then((account) => {
      if (!account) {
        // Just report an OK.  Otherwise, this is a method
        // for discovering registered user names.
        return null;
      }
      // This does the save for us.
      return account.resetAuthentication();
    });
  var userAccountPromise = accountResetPromise
    .then(() => {
      return User.findOne({ username: req.body.username });
    });
  Promise
    .all([accountPromise, userAccountPromise, accountResetPromise])
    .then((args) => {
      var toUser = args[1] || args[0];
      var resetValues = args[2];

      // For security reasons, the reset values should only be sent through
      // email.  Otherwise, anyone who has the security token can reset
      // a password, making this security feature moot.

      res.status(200).json({});

      // Only send an email if we have a user to send, and we have
      // reset values to send.
      if (!!toUser && !!resetValues) {
        notify.send('reset-password', toUser, {
          username: req.body.username,
          name: toUser.bestName ? toUser.bestName() : req.body.username,
          reset: {
            resetAuthenticationToken: resetValues.resetAuthenticationToken,
            resetAuthenticationExpires: resetValues.resetAuthenticationExpires
          }
        });
      }
    })
    .catch((err) => {
      next(err);
    });
};
