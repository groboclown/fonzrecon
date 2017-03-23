'use strict';

const models = require('../../models');
const Account = models.Account;
const User = models.User;
const util = require('../util');
const errors = util.errors;
const accessLib = require('../../lib/access');
const validate = require('../../lib/validate');
const createUser = require('../../lib/create-user-api').createUser;


exports.create = function(req, res, next) {
  const reqUser = req.body.user;

  return createUser(reqUser)
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
  if (!validate.isArray(req.body.users)) {
    return next(validate.error(null, 'users', 'user body not defined'));
  }

  return Promise
    .all(req.body.users.map(createUser).map(validate.promiseReflect))
    .then((results) => {
      let ret = [];
      let anyRejected = false;
      let anyCreated = false;
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'rejected') {
          ret.push({
            username: results[i].error.username,
            status: 'rejected',
            details: results[i].e
          });
          anyRejected = true;
        } else {
          ret.push({
            username: results[i].v[0].username,
            // Do not send the validation code.
            status: 'created'
          });
          anyCreated = true;
        }
      }

      if (!anyRejected && !anyCreated) {
        // Nothing created and no errors.  Don't send a 201, because
        // the user probably wanted to create at least one user.  This
        // tells the sender to examine in detail the results.
        res.status(200).json([]);
      } else if (!anyRejected && anyCreated) {
        // Only creation
        res.status(201).json(ret);
      } else if (anyRejected && !anyCreated) {
        // Only errors
        res.status(400).json(ret);
      } else {
        // Mixed results
        res.status(200).json(ret);
      }
    })
    .catch((err) => {
      console.log(`DEBUG error ${err}\n${err.stack}`);
      next(err);
    });
};
