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
const validate = require('../../lib/validate');
const roles = require('../../config/access/roles');
const notify = require('../../lib/notify');

const DEFAULT_LOCALE = 'en';


exports.create = function(req, res, next) {
  const fromUser = accessLib.getRequestUser(req);
  if (!fromUser) {
    return next(errors.notAuthorized());
  }

  const reqUser = req.body.user;

  // The user's role can only be USER when invoked from
  // this method.
  reqUser.role = roles.USER.name;

  return createOneUser(reqUser)
    .then((args) => {
      var user = args[0];
      var resetValues = args[1];

      // NOTE: this should NOT send back the reset values; those
      // should only be accessed through the email.
      res.status(201).json({});
    })
    .catch((err) => {
      next(err);
    });
};



exports.import = function(req, res, next) {
  const fromUser = accessLib.getRequestUser(req);
  if (!fromUser) {
    return next(errors.notAuthorized());
  }

  if (!validate.isArray(req.body.users)) {
    return next(validate.error(null, 'users', 'user body not defined'));
  }

  return Promise
    .all(req.body.users.map(createOneUser).map(validate.promiseReflect))
    .then((results) => {
      let ret = [];
      for (let i = 0; i < results; i++) {
        if (results[i].status === 'rejected') {
          ret.push({
            username: results[i].error.username,
            status: 'rejected',
            details: results[i].e
          });
        } else {
          ret.push({
            username: results[i][0].username,
            // Do not send the validation code.
            status: 'created'
          });
        }
      }

      res.status(201).json(ret);
    })
    .catch((err) => {
      next(err);
    });
};



function createOneUser(reqUser, dontSendEmail) {
  // Because of the way this is done, it must be a manual check.
  let errors = [];
  if (!reqUser) {
    return Promise.resolve(null);
  }
  if (!validate.isAlphanumericName(reqUser.username)
      || reqUser.username.length < 3
      || reqUser.username.length > 100) {
    errors.push(validate.errDetail(reqUser.username, 'username',
      'username must be a string of no less than 3 characters, no more than 100 characters, and contain only numbers and lowercase letters'));
  }

  if (!validate.isEmailAddress(reqUser.email) || reqUser.email.length > 120) {
    errors.push(validate.errDetail(reqUser.email, 'email',
      'email must be a valid email address no longer than 120 characters'));
  }

  if (!validate.isArrayOf(reqUser.names, (v) => {
        return validate.isString(v, 3, 60);
      }, 1, 10)) {
    errors.push(validate.errDetail(reqUser.names, 'names',
      'alternate names must contain at least one entry, no more than 10 entries, and each entry must be a string with length between 3 and 60 characters.'));
  }

  if (reqUser.pointsToAward === null || reqUser.pointsToAward === undefined) {
    reqUser.pointsToAward = 0;
  }
  if (!validate.isInt(reqUser.pointsToAward) || reqUser.pointsToAward < 0) {
    errors.push(validate.errDetail(reqUser.pointsToAward, 'pointsToAward',
      'points to award must be a non-negative integer'));
  }

  if (!validate.isString(reqUser.organization, 2, 100)) {
    errors.push(validate.errDetail(reqUser.organization, 'organization',
      'must be a string with length between 2 and 100 characters'));
  }

  if (reqUser.locale === null || reqUser.locale === undefined) {
    // TODO add a default locale
    reqUser.locale = DEFAULT_LOCALE;
  }
  if (!validate.isString(reqUser.locale, 2, 10)) {
    errors.push(validate.errDetail(reqUser.locale, 'locale',
      'locale must be a string between 2 and 10 characters long'));
  }

  if (!validate.isInSet(reqUser.role, roles.userRoles)) {
    errors.push(validate.errDetails(reqUser.role, 'role',
      'user role must be one of ' + JSON.stringify(roles.userRoles)));
  }

  if (errors.length > 0) {
    let err = validate.errors(errors);
    err.username = reqUser.username;
    return Promise.reject(err);
  }

  let userMatchCondition = [
    { username: reqUser.username }
  ];
  for (let i = 0; i < reqUser.names.length; i++) {
    userMatchCondition.push({ names: reqUser.names[i] });
  }

  // Find if there's an existing user account with the username
  // or any of the names in the lists.
  var accountPromise = User
    // Because we're creating a user, use the raw find without active checks.
    // User names must be unique!
    .find({ $or: userMatchCondition })
    .exec()
    .then((matchingUsers) => {
      if (matchingUsers.length > 0) {
        let names = ([reqUser.username, reqUser.email]).concat(reqUser.names);
        throw validate.error(names,
          'username, email, or names',
          'One of these values is already in use'
        );
      }

      // Find if there's an account with the username or email.
      // This must match ANY account, whether it's disabled or not.
      return Account
        // Do not limit account search by active, because, like username,
        // it must be unique.
        .find({
          $or: [ { id: reqUser.username }, { accountEmail: reqUser.email }]
        })
        .lean()
        .exec();
    })
    .then((matchingAccounts) => {
      if (matchingAccounts.length > 0) {
        let names = ([reqUser.username, reqUser.email]).concat(reqUser.names);
        throw validate.error(names,
          'username, email, or names',
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
        active: true
      }).save();
    });
  var userPromise = accountPromise
    .then((account) => {
      return new User({
        username: reqUser.username,
        names: reqUser.names,
        contacts: [{
          type: 'email',
          server: null,
          address: reqUser.email
        }],
        pointsToAward: reqUser.pointsToAward,
        receivedPointsToSpend: 0,
        image: false,
        organization: reqUser.organization,
        active: true
      }).save();
    });

  var resetValuesPromise = Promise
    .all([accountPromise, userPromise])
    .then((args) => {
      let account = args[0];
      return account.resetAuthentication();
    });
  var emailPromise = Promise
    .all([userPromise, resetValuesPromise])
    .then((args) => {
      var user = args[0];
      var resetValues = args[1];

      if (dontSendEmail) {
        return null;
      }
      return notify.send('new-user', user, {
        username: user.username,
        user: user,
        name: user.bestName(),
        reset: {
          resetAuthenticationToken: resetValues.resetAuthenticationToken,
          resetAuthenticationExpires: resetValues.resetAuthenticationExpires
        }
      });
    });
  return Promise
    .all([userPromise, resetValuesPromise, emailPromise])
    // Shouldn't do a then right here, but...
    .then((args) => {
      return [args[0], args[1]];
    });
}

// Make available for other scripts to use.
exports.createOneUser = createOneUser;
