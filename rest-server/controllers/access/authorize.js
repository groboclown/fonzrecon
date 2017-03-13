'use strict';

// User access restriction middleware.

const permissions = require('../../config/access/permissions');
const roles = require('../../config/access/roles');

/**
 * Checks that a specific request is against a user (or on-behalf-of user)
 * which has authentication.  The permission must be one of those listed
 * in `./permissions.js`.  The user role is assigned the permission access,
 * which defines what conditions must be met for it to gain that permission
 * right.
 *
 * Each request must define the list of users which are affected by the request.
 * So, if the user is looking for details on a specific user, then that
 * specific user must be in the list.  This list is constructed by the
 * `affect_user_list_func` function, which takes as a single argument the
 * request object.  For requests which are strictly "must be given the
 * permission or not", the user list should return an empty list.  It must
 * return a non-null array which contains strings of the username.
 */
module.exports = function(permission, affectedUserListFunc) {
  if (!permissions[permission.key]) {
    // Program integrety validation; will be thrown at program startup.
    throw new Error('Unknown permission ' + permission.key);
  }
  if (!affectedUserListFunc) {
    throw new Error('no affectedUserListFunc passed in');
  }

  return function(req, res, next) {
    // Look at the user object in the request, and the on-behalf-of
    // user.
    if (!req.userAccount) {
      return next(forbidden());
    }
    var account = req.userAccount.account;
    var rolePermissionFunc = null;
    if (!!account) {
      if (!account.role || !roles[account.role]) {
        console.error(`Account ${account.id} has invalid role id ${account.role}`);
        var err = new Error('Invalid account role for ' + account.id);
        err.status = 500;
        return next(err);
      }
      var role = roles[account.role];
      if (!role.permissions[permission.key]) {
        // Permission not set, so not available to perform (default permission).
        return next(forbidden());
      }
      rolePermissionFunc = role.permissions[permission.key];
      var username = (req.userAccount.user
        ? req.userAccount.user.username
        : null);
      var behalf = req.userAccount.behalf;
      var behalfUsername = null;
      if (!!behalf && behalf.username) {
        behalfUsername = behalf.username;
      }
      var affectedUsers = affectedUserListFunc(req);
      if (!affectedUsers) {
        return next(forbidden());
      }
      if (affectedUsers.then && typeof(affectedUsers.then) === 'function') {
        // Returned a promise.
        return affectedUsers
          .then((affectedUsers) => {
            if (!!affectedUsers && rolePermissionFunc(username, behalfUsername, affectedUsers)) {
              // Authenticated!!!
              next();
            } else {
              next(forbidden());
            }
          })
          .catch((err) => {
            next(err);
          });
      }
      if (rolePermissionFunc(username, behalfUsername, affectedUsers)) {
        // Authenticated!!!
        return next();
      }
      if (rolePermissionFunc(username, behalfUsername, affectedUsers)) {
        // Authenticated!!!
        return next();
      }
      return next(forbidden());
    }
    return next(forbidden());
  }
};



function forbidden() {
  var err = new Error('Forbidden');
  err.status = 403;
  return err;
}
