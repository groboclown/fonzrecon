'use strict';

const User = require('../models').User;

exports.listBrief = function(userLike, pagination) {
  return User
    .listBrief(userLike)
    .paginate(pagination);
};
