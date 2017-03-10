'use strict';

const models = require('../../models');
const Account = models.User;
const User = models.User;
const Setting = models.Setting;
const util = require('../util');
const paging = util.paging.extract;
const jsonConvert = util.jsonConvert;
const errors = util.errors;
const accessLib = require('../../lib/access');
const roles = require('../../config/access/roles');



module.exports = function(req, res, next) {
  const fromUser = accessLib.getRequestUser(req);
  if (! fromUser) {
    return next(errors.notAuthorized());
  }

  req.checkBody({
    username: {
      isLength: {
        options: [{ min: 3, max: 100}],
        errorMessage: 'must be more than 3 characters, and less than 100'
      },
      isAlphanumeric: {
        errorMessage: 'must be only alphanumeric characters'
      }
    },
    email: {
      isEmail: {
        errorMessage: 'contact email for validating account',
      },
      notEmpty: true
    },
    names: {
      // list of "names" for the user, not usernames!
      isArrayOfString: {
        options: 1,
        errorMessage: 'list of alternate names',
      }
    },
    pointsToAward: {
      isInt: {
        options: {
          gte: 0
        },
        errorMessage: 'must be present and non-negative.'
      }
    },
    organization: {
      isLength: {
        options: {
          gt: 0,
          lt: 100
        },
        errorMessage: 'cannot be empty'
      }
    },
    role: {
      isIn: {
        options: roles.names
      }
    }
  });

  var accountPromise = req.getValidationResult()
    // Validate that the input
    .then(function (results) {
      if (! results.isEmpty()) {
        throw errors.validationProblems(results.array());
      }

      userMatchCondition = [
        { username: req.body.username },
        { email: req.body.email },
      ];
      for (var i = 0; i < req.body.names.length; i++) {
        userMatchCondition.push({ names: req.body.names[i] });
      }

      return Users
        .find()
        .or(userMatchCondition)
        .lean()
        .exec();
    })

    // Create the account.
    .then(function(matchingUsers) {
      if (matchingUsers.length > 0) {
        throw errors.extraValidationProblem(
          'username or names or email',
          [ req.body.username, req.body.names, req.body.email ],
          'One of these values is already in use'
        );
      }

      // Create the account.  This might fail due to a duplicate
      // username, which is fine.
      return new Account({
        id: req.body.username,
        // Do not give any authentications, because it's not able to
        // be logged into yet.  The user needs to validate it, first.
        authentications: [],
        role: req.body.role,
        userRef: req.body.username,
        accountEmail: req.body.email,
        resetAuthenticationToken: null,
        resetAuthenticationExpires: null,
      }).save();
    });
  var userPromise = accountPromise
    .then(function(account) {
      return new User({
        username: req.body.username,
        names: req.body.names,
        contact: [{
          type: 'email',
          server: 'email',
          address: req.body.email,
        }],
        pointsToAward: req.body.pointsToAward,
        receivedPointsToSpend: 0,
        image: null,
        organization: req.body.organization,
      }).save();
    });

  return Promise
    .all([accountPromise, userPromise])
    .then(function(args) {
      let account = args[0];
      return account.resetAuthentication();
    })
    .then(function(resetValues) {
      res.status(201).json(resetValues);

      // TODO send user email w/ validation values.
    })
    .catch(function(err) {
      next(err);
    });
};
