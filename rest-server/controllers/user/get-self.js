'use strict';

const User = require('../../models').User;
const util = require('../util');
const paging = util.paging.extract;
const jsonConvert = util.jsonConvert;
const errors = util.errors;
const roles = require('../../config/access/roles');

module.exports = function(req, res, next) {
  if (!req.userAccount.user || !req.userAccount.account) {
    // Not a valid user + account in request, so nothing to find.
    return next(errors.notAuthorized());
  }

  // Even though this method doesn't need a promise - everything is already
  // loaded from the db - it returns a promise so the integration tests can
  // work well and consistently.
  return new Promise((resolve, reject) => {
    let role = roles[req.userAccount.account.role];
    let ret = {
      User: jsonConvert.user(req.userAccount.user),
      isAdmin: role ? role.hasAdminAccess : false,
      canValidateClaims: role ? role.canValidateClaims : false,
      hasPendingVerification: req.userAccount.account.resetAuthenticationExpires
        ? req.userAccount.account.resetAuthenticationExpires > new Date()
        : false
    };
    res.status(200).json(ret);
    resolve(null);
  })
  .catch((err) => {
    next(err);
  });
};
