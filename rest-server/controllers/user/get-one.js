'use strict';

const models = require('../../models');
const User = models.User;
const Account = models.Account;
const util = require('../util');
const paging = util.paging.extract;
const jsonConvert = util.jsonConvert;
const errors = util.errors;

module.exports = function(req, res, next) {
  const userPromise = User
   .findOneByUsername(req.params.id)
   .lean()
   .exec();
  const accountPromise = Account
    .findByUserRef(req.params.id)
    .lean()
    .exec();
  return Promise
    .all([userPromise, accountPromise])
    .then((args) => {
      const user = args[0];
      const account = args[1];
      if (!user || !account) {
        return next(errors.resourceNotFound());
      }
      res.status(200).json({ User: jsonConvert.user(user, account) });
    })
    .catch((err) => {
      next(err);
    });
};
