'use strict';

// Shared API code for creating users.

const models = require('../models');
const Account = models.Account;
const User = models.User;
const roles = require('../config/access/roles');
const notify = require('./notify');
const validate = require('./validate');


const DEFAULT_LOCALE = 'en';


exports.createUser = function(reqUser) {
  if (reqUser) {
    reqUser.role = roles.USER.name;
  }
  return exports.createUserAccount(reqUser, false);
};



exports.createAdmin = function(reqUser) {
  if (reqUser) {
    reqUser.role = roles.ADMIN.name;
  }
  return exports.createUserAccount(reqUser, false);
};



// Bots need a password and basic account information.
exports.createBot = function(data) {
  if (!data) {
    return Promise.resolve(null);
  }

  let errors = validateAccountInput(data);
  if (!validate.isString(data.password, 6, 100)) {
    errors.push(validate.errDetail('<password>', 'password',
      'password must be a string with length between 6 and 100 characters'));
  }

  if (errors.length > 0) {
    let err = validate.errors(errors);
    err.username = data.username;
    return Promise.reject(err);
  }

  return assertUniqueAccount(data)
    .then(() => {
      // Create the account.  This might fail due to a duplicate
      // username, which is fine.
      return new Account({
          id: data.username,

          // Bots start with a password.
          authentications: [
            {
              source: 'local',
              id: data.email,
              userInfo: [data.password],
              browser: []
            }
          ],
          role: roles.BOT.name,
          accountEmail: data.email,
          resetAuthenticationToken: null,
          resetAuthenticationExpires: null,

          // Cannot act as a user, meaning no one
          // can assign it stuff or send it stuff,
          // so it has no user.
          userRef: null
        })
        .save();
    });
};



/**
 * Creates an account and user record.
 *
 * @return {Promise} array of [user, resetValues, account]
 */
exports.createUserAccount = function(reqUser, dontSendEmail) {
  // Because of the way this is done, it must be a manual check.
  if (!reqUser) {
    return Promise.reject(validate.error(null, 'user', 'null user'));
  }

  let errors = validateAccountInput(reqUser);

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
  if (!/[a-z][a-z](-[a-z][a-z])*/i.test(reqUser.locale)) {
    errors.push(validate.errDetail(reqUser.locale, 'locale',
      'locale be in the form `AB` or `AB-CD` or `AB-CD-EF` (case insensitive)'));
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

  // Find if there's an existing user account with the username
  // or any of the names in the lists.
  var accountPromise = assertUniqueUser(reqUser)
    .then(() => {
      // Create the account.  This might fail due to a duplicate
      // username, which is fine.
      return new Account({
        id: reqUser.username,
        // Do not give any authentications, because it's not able to
        // be logged into yet.  The user needs to validate it first.
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
    .all([userPromise, resetValuesPromise, accountPromise, emailPromise])
    // Shouldn't do a then right here, but this makes a correct return value.
    .then((args) => {
      return [args[0], args[1], args[2]];
    });
};



function validateAccountInput(reqAccount, errors) {
  errors = errors || [];
  if (!validate.isAlphanumericName(reqAccount.username)
      || reqAccount.username.length < 3
      || reqAccount.username.length > 100) {
    errors.push(validate.errDetail(reqAccount.username, 'username',
      'username must be a string of no less than 3 characters, no more than 100 characters, and contain only numbers and lowercase letters'));
  }

  if (!validate.isEmailAddress(reqAccount.email) || reqAccount.email.length > 120) {
    errors.push(validate.errDetail(reqAccount.email, 'email',
      'email must be a valid email address no longer than 120 characters'));
  }

  return errors;
}



function assertUniqueAccount(reqAccount) {
  var matchingNames = [reqAccount.username, reqAccount.email];
  if (reqAccount.names && Array.isArray(reqAccount.names)) {
    matchingNames = matchingNames.concat(reqAccount.names);
  }

  return Account
    // Find if there's an account with the username or email.
    // This must match ANY account, whether it's disabled or not.
    .find({
      $or: [ { id: reqAccount.username }, { accountEmail: reqAccount.email }]
    })
    .lean()
    .exec()
    .then((matchingAccounts) => {
      if (matchingAccounts.length > 0) {
        throw validate.error(matchingNames,
          'username, email, or names',
          'One of these values is already in use'
        );
      }
    });
}



function assertUniqueUser(reqUser) {
  return assertUniqueAccount(reqUser)
    .then(() => {
      let userMatchCondition = [
        { username: reqUser.username }
      ];
      for (let i = 0; i < reqUser.names.length; i++) {
        userMatchCondition.push({ names: reqUser.names[i] });
      }

      // Find if there's an existing user account with the username
      // or any of the names in the lists.
      return User
        // Because we're creating a user, use the raw find without active checks.
        // User names must be unique!
        .find({ $or: userMatchCondition })
        .exec();
    })
    .then((matchingUsers) => {
      if (matchingUsers.length > 0) {
        let names = ([reqUser.username, reqUser.email]).concat(reqUser.names);
        throw validate.error(names,
          'username, email, or names',
          'One of these values is already in use'
        );
      }
    });
}
