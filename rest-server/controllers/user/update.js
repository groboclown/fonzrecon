'use strict';

const models = require('../../models');
const User = models.User;
const Account = models.Account;
const util = require('../util');
const paging = util.paging.extract;
const jsonConvert = util.jsonConvert;
const errors = util.errors;
const roles = require('../../config/access/roles');
const notify = require('../../lib/notify');


exports.update = function(req, res, next) {
  const username = req.params.id;

  // FIXME implement

  next();
};



exports.setRole = function(req, res, next) {
  const username = req.params.id;

  const newRole = req.body.role;
  if (!roles.userRoles.includes(newRole)) {
    return next(errors.extraValidationProblem('role', newRole, 'invalid role`'));
  }

  return Account
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



exports.delete = function(req, res, next) {
  const username = req.params.id;

  return Account
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



exports.resetAllPointsToAward = function(req, res, next) {
  req.checkBody({
    points: {
      isInt: {
        options: {
          gt: 0
        },
        errorMessage: 'must be present and positive.'
      }
    }
  });

  return req.getValidationResult()
    .then((results) => {
      if (!results.isEmpty()) {
        throw errors.validationProblems(results.array());
      }

      return User.findActive();
    })
    .then((users) => {
      return Promise
        .all(users.map((user) => {
          user.pointsToAward = req.body.points;
          return user.save();
        }));
    })
    .then((users) => {
      return notify.sendAdminNotification('points-to-award-reset', {
        updateCount: users.length
      })
      .then(() => { return users; });
    })
    .then((users) => {
      res.status(200).json({ updateCount: users.length });
    })
    .catch((err) => {
      next(err);
    });
};



exports.resetOnePointsToAward = function(req, res, next) {
  const username = req.params.id;

  req.checkBody({
    points: {
      isInt: {
        options: {
          gt: 0
        },
        errorMessage: 'must be present and positive.'
      }
    }
  });

  return req.getValidationResult()
    .then((results) => {
      if (!results.isEmpty()) {
        throw errors.validationProblems(results.array());
      }

      return User.findOneByUsername(username);
    })
    .then((user) => {
      if (!user) {
        return null;
      }
      user.pointsToAward = req.body.points;
      return user.save();
    })
    .then((user) => {
      return notify.sendAdminNotification('points-to-award-reset', {
        updateCount: user ? 1 : 0
      })
      .then(() => { return user; });
    })
    .then((user) => {
      res.status(200).json({ updateCount: user ? 1 : 0 });
    })
    .catch((err) => {
      next(err);
    });
};
