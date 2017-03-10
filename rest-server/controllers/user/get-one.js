'use strict';

const User = require('../../models').User;
const util = require('../util');
const paging = util.paging.extract;
const jsonConvert = util.jsonConvert;
const errors = util.errors;

module.exports = function(req, res, next) {
  User
   .findOne({ username: req.params.id })
   .lean()
   .exec()
   .then(function(user) {
      if (!user) {
        return next(errors.resourceNotFound());
      }
      user.type = 'User';
      res.status(200).json({ User: jsonConvert.user(user) });
    })
    .catch(function(err) {
      next(err);
    });
};
