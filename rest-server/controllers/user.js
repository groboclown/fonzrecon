'use strict';

const User = require('../models').User;
const paging = require('./util').paging.extract;
const jsonConvert = require('./util').jsonConvert;

// Get all users
// brief view should either be all or nothing; we don't collect
// affected users into the list.
exports.getAllBrief = function(req, res, next) {
  var pagination = paging(req);
  var userLike = req.query.like || req.body.like || '.*';
  User
    .listBrief(userLike)
    .paginate(pagination)
    .then(function(users) {
      users.type = 'UserBrief'
      res.status(200).json(jsonConvert.pagedResults(users, jsonConvert.briefUser));
    })
    .catch(function(err) {
      next(err);
    });
};

exports.getOneBrief = function(req, res, next) {
  User
    .findOneBrief({ username: req.params.id })
    .exec()
    .then(function(user) {
      if (!user) {
        return next(resourceNotFound());
      }
      res.status(200).json({ UserBrief: jsonConvert.briefUser(user) });
    })
    .catch(function(err) {
      next(err);
    });
};

exports.getOneDetails = function(req, res, next) {
  User
   .findOne({ username: req.params.id })
   .lean()
   .exec()
   .then(function(user) {
      if (!user) {
        return next(resourceNotFound());
      }
      user.type = 'User';
      res.status(200).json({ User: jsonConvert.user(user) });
    })
    .catch(function(err) {
      next(err);
    });
};


function resourceNotFound() {
  var err = new Error('Resource not found');
  err.status = 404;
  return err;
}
