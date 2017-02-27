'use strict';

const User = require('../models').User;

exports.listBrief = function(userLike, pagination) {
  return User
    .find({ username: { $regex: new RegExp(userLike, 'i') } })
    .lean()
    .select('username names organization')
    .paginate(pagination).exec();
};
