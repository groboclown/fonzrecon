'use strict';

const User = require('../models').User;
const paging = require('./util').paging.extract;

// Get all users
// brief view should either be all or nothing; we don't collect
// affected users into the list.
exports.getAllBrief = function(req, res, next) {
  var pagination = paging(req, { page: 1, limit: 100 });
  var userLike = req.query.like || req.body.like || '.*';
  User
    .listBrief(userLike)
    .paginate(pagination)
    .then(function(users) {
      users.type = 'User';
      res.status(200).json(users);
    })
    .catch(function(err) {
      next(err);
    });
};

exports.getOneBrief = function(req, res, next) {
  console.log('Finding brief user ' + req.params.id);
  User
    .findOneBrief({ username: req.params.id })
    .exec()
    .then(function(user) {
      if (!user) {
        // 404
        var err = new Error('Resource not found');
        err.status = 404;
        return next(err);
      }
      res.status(200).json({ User: user });
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
        // 404
        var err = new Error('Resource not found');
        err.status = 404;
        return next(err);
      }
      res.status(200).json({ User: user });
    })
    .catch(function(err) {
      next(err);
    });
};
