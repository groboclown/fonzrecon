'use strict';

const User = require('../../models').User;
const util = require('../util');
const paging = util.paging.extract;
const jsonConvert = util.jsonConvert;
const errors = util.errors;

module.exports = function(req, res, next) {
  User
    .findOneBrief({ username: req.params.id }, true)
    .exec()
    .then((user) => {
      if (!user) {
        return next(errors.resourceNotFound());
      }
      res.status(200).json({ UserBrief: jsonConvert.briefUser(user) });
    })
    .catch((err) => {
      next(err);
    });
};
