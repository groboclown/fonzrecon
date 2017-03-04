'use strict';

exports.getRequestUser = function(req) {
  if (! req.userAccount) {
    return false;
  }
  if (req.userAccount.behalf) {
    // If the behalf exists, then the user can run on behalf of another.
    return req.userAccount.behalf;
  }
  if (req.userAccount.user) {
    return req.userAccount.user;
  }
  return false;
};


exports.getRequestUsername = function(req) {
  var user = exports.getRequestUser(req);
  if (! user) {
    return false;
  }
  return user.username;
}
