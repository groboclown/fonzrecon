'use strict';

const User = require('../models').User;

exports.listBrief = function(userLike, pagination) {
  return User
    .listBrief(userLike)
    .paginate(pagination);
};

exports.findByIdBrief = function(username) {
  return User
    .findOneBrief({ username: username })
    .exec();
}

exports.findByIdDetailsReadOnly = function(username) {
  return User
    .findOne({ username: username })
    .lean()
    .exec();
};
