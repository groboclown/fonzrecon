'use strict';

const models = require('../../models');
const User = models.User;
const Account = models.Account;
const util = require('../util');
const paging = util.paging.extract;
const jsonConvert = util.jsonConvert;
const errors = util.errors;
const roles = require('../../access/roles');


module.exports.update = function(req, res, next) {
  const username = req.params.id;

  // FIXME implement

  next();
};



module.exports.setRole = function(req, res, next) {
  const username = req.params.id;

  const newRole = req.body.role;
  if (!roles.userRoles.includes(newRole)) {
    return next(errors.extraValidationProblem('role', newRole, 'invalid role`'));
  }

  Account
    .findByUserRef(username)
    .exec()
    .then((account) => {
      if (!account) {
        throw errors.resourceNotFound();
      }
      account.role = newRole;
      return account.save();
    })
    .then((account) => {
      res.status(200).json({});
    })
    .catch((err) => {
      next(err);
    });
};



module.exports.delete = function(req, res, next) {
  const username = req.params.id;

  Account
    .findByUserRef(username)
    .exec()
    .then((account) => {
      if (!account) {
        throw errors.resourceNotFound();
      }
      account.active = false;
      return account.save();
    })
    .then((account) => {
      return User
        .findOneByName(username)
        .exec();
    })
    .then((user) => {
      // Ignore if the user doesn't exist.
      if (user) {
        user.active = false;
        return user.save();
      }
      return null;
    })
    .then((user) => {
      res.status(200).json({});
    })
    .catch((err) => {
      next(err);
    });
};
