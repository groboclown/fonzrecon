'use strict';

const models = require('../../models');
const Account = models.Account;
const User = models.User;
const Setting = models.Setting;
const util = require('../util');
const paging = util.paging.extract;
const jsonConvert = util.jsonConvert;
const errors = util.errors;
const accessLib = require('../../lib/access');
const roles = require('../../config/access/roles');
const email = require('../../lib/email');



module.exports = function(req, res, next) {
  const fromUser = accessLib.getRequestUser(req);
  if (! fromUser) {
    return next(errors.notAuthorized());
  }

  req.checkBody({
    'user.username': {
      isLength: {
        options: [{ min: 3, max: 100 }],
        errorMessage: 'must be more than 3 characters, and less than 100'
      },
      isAlphanumeric: {
        errorMessage: 'must be only alphanumeric characters'
      },
      notEmpty: true,
    },
    'user.email': {
      isEmail: {
        errorMessage: 'contact email for validating account',
      },
      notEmpty: true,
    },
    'user.names': {
      // list of "names" for the user, not usernames!
      isArrayOfString: {
        options: 1,
        errorMessage: 'list of alternate names',
      },
      notEmpty: true
    },
    'user.pointsToAward': {
      isInt: {
        options: { gt: -1 },
        errorMessage: 'must be present and non-negative.',
      },
      notEmpty: true,
    },
    'user.organization': {
      isLength: {
        options: [{ min: 1, max: 100 }],
        errorMessage: 'cannot be empty',
      },
      notEmpty: true
    },
    'user.role': {
      isIn: {
        // Weird usage: needs to be a list in a list.
        options: [roles.names]
      },
      notEmpty: true,
    },
    'user.locale': {
      isLength: {
        options: [{min: 2, max: 8 }],
        errorMessage: 'incorrect locale',
      }
    },
  });

  const reqUser = req.body.user;

  var accountPromise = req.getValidationResult()
    // Validate that the input
    .then(function (results) {
      if (! results.isEmpty()) {
        throw errors.validationProblems(results.array());
      }

      let userMatchCondition = [
        { username: reqUser.username },
      ];
      for (let i = 0; i < reqUser.names.length; i++) {
        userMatchCondition.push({ names: reqUser.names[i] });
      }

      return User
        .find({ $or: userMatchCondition })
        .exec();
    })

    // Create the account.
    .then(function(matchingUsers) {
      if (matchingUsers.length > 0) {
        throw errors.extraValidationProblem(
          'username or names',
          [ reqUser.username, reqUser.names ],
          'One of these values is already in use'
        );
      }

      return Account
        .find({
          // Email does not need to be unique.
          //$or: [ { id: req.body.username }, { accountEmail: req.body.email }],
          id: reqUser.username,
        })
        .lean()
        .exec();
    })
    .then(function(matchingAccounts) {
      if (matchingAccounts.length > 0) {
        throw errors.extraValidationProblem(
          'username or names',
          [ reqUser.username, reqUser.names ],
          'One of these values is already in use'
        );
      }

      // Create the account.  This might fail due to a duplicate
      // username, which is fine.
      return new Account({
        id: reqUser.username,
        // Do not give any authentications, because it's not able to
        // be logged into yet.  The user needs to validate it, first.
        authentications: [],
        role: reqUser.role,
        userRef: reqUser.username,
        accountEmail: reqUser.email,
      }).save();
    });
  var userPromise = accountPromise
    .then(function(account) {
      console.log(`creating user account`)
      return new User({
        username: reqUser.username,
        names: reqUser.names,
        contacts: [{
          type: 'email',
          server: null,
          address: reqUser.email,
        }],
        pointsToAward: reqUser.pointsToAward,
        receivedPointsToSpend: 0,
        image: false,
        organization: reqUser.organization,
      }).save();
    });

  var resetValuesPromise = Promise
    .all([accountPromise, userPromise])
    .then(function(args) {
      let account = args[0];
      return account.resetAuthentication();
    });
  return Promise
    .all([userPromise, resetValuesPromise])
    .then(function(args) {
      var user = args[0];
      var resetValues = args[1];

      res.status(201).json(resetValues);

      email.send('new-user', user, {
        username: user.username,
        user: user,
        resetAuthenticationToken: resetValues.resetAuthenticationToken,
        resetAuthenticationExpires: resetValues.resetAuthenticationExpires,
      });
    })
    .catch(function(err) {
      next(err);
    });
};
