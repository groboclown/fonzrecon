'use strict';

const User = require('../../models').User;
const util = require('../util');
const paging = util.paging.extract;
const jsonConvert = util.jsonConvert;
const errors = util.errors;

// Get all users
// brief view should either be all or nothing; we don't collect
// affected users into the list.
module.exports = function(req, res, next) {
  var pagination = paging(req);
  var userLike = req.query.like || req.body.like || '.*';
  var includeInactive = false;
  if (req.query.all === 'true') {
    includeInactive = true;
  }
  return User
    .listBrief(userLike, includeInactive)
    .paginate(pagination)
    .then((users) => {
      users.type = 'UserBrief';
      res.status(200).json(jsonConvert.pagedResults(users, jsonConvert.briefUser));
    })
    .catch((err) => {
      next(err);
    });
};
