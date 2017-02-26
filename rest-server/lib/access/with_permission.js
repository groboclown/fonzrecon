'use strict';

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

const permissions = require('./permissions');
const roles = require('./roles');

module.exports = function(permission, affected_user_list_func) {
  if (! permissions[permission.key]) {
    // Programming bug; will be thrown at program startup.
    throw new Error('Unknown permission ' + permission.key);
  }

  return function(req, res, next) {
    // Look at the user object in the request, and the on-behalf-of
    // user.
    var user = req.login
    var username = null;
    var role_permission_func = null;
    if (!! user) {
      username = user.username || null;
      if (! user.role || ! roles[user.role]) {
        console.error(`Login user ${username} has invalid role id ${user.role}`);
        var err = new Error('Invalid login role for ' + username);
        err.status = 500;
        next(err);
      }
      var role = roles[user.role];
      if (! role.permissions[permission.key]) {
        // Permission not set, so not available to perform (default permission).
        console.log(`No permission (${permission.key}) defined in role ${role.name}`)
        var err = new Error('Forbidden');
        err.status = 401;
        return next(err);
      }
      role_permission_func = role.permissions[permission.key];
      var behalf = req.behalfLogin
      var behalf_username = null;
      if (!! behalf && behalf.username) {
        behalf_username = behalf.username;
      }
      var affeted_users = affected_user_list_func(req);
      if (!! affeted_users && role_permission_func(username, behalf_username, affeted_users)) {
        return next();
      } else {
        var err = new Error('Forbidden');
        err.status = 401;
        next(err);
      }
    } else {
      var err = new Error('Forbidden');
      err.status = 401;
      next(err);
    }
  }
};
