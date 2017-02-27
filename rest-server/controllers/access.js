'use strict';

// User access restriction middleware.

const config = require('../config');
const permissions = require('../config/access/permissions');
const roles = require('../config/access/roles');
const models = require('../models');
const Login = models.Login;
const User = models.User;

exports.findLogin = function() {
  // For now, just a really simple middleware that
  // extracts the username on faith.  Eventually, this
  // will invoke several middleware functions to construct
  // the user request object (from passport).

  function discoverOnBehalfOfMiddleware(req, res, next) {
    req.behalfLogin = null;
    req.behalfUser = null;
    var onBehalfOf = lookup(req.body, 'behalf') || lookup(req.query, 'behalf');
    if (!! onBehalfOf) {
      // Find the user, not the login.
      User.findOneByName(onBehalfOf, function(err, user) {
        if (err) {
          return next(err);
        }
        if (!! user) {
          Login.findOne({ username: user.username }, function(err, login) {
            if (err) {
              return next(err);
            }
            req.behalfLogin = login;
            req.behalfUser = user;
            return next();
          });
        } else {
          return next();
        }
      });
    } else {
      console.log("no on behalf of found");
      return next();
    }
  }

  // TODO this needs to be replaced with passport
  function discoverUserMiddleware(req, res, next) {
    req.login = null;
    req.user = null;
    var username = lookup(req.body, 'username') || lookup(req.query, 'username');
    // really, shouldn't be checking the query for the password.
    var password = lookup(req.body, 'password') || lookup(req.query, 'password');
    if (!! username) {
      console.log("getting login for " + username);
      Login.findOne({ username: username }, function(err, login) {
        if (err) {
          return next(err);
        }
        req.login = login;
        if (!! login) {
          login.compareAuthentication(password, function(err, isMatch) {
            if (err) {
              return next(err);
            }
            if (! isMatch) {
              var err = new Error('Forbidden');
              err.status = 401;
              return next(err);
            }
            User.findOne({ username: username }, function(err, user) {
              if (err) {
                return next(err);
              }
              req.user = user;
              next();
            });
          });
        } else {
          next();
        }
      });
    } else {
      console.log("no login given");
      next();
    }
  }

  function lookup(obj, field) {
    if (!obj) { return null; }
    var chain = field.split(']').join('').split('[');
    for (var i = 0, len = chain.length; i < len; i++) {
      var prop = obj[chain[i]];
      if (typeof(prop) === 'undefined') { return null; }
      if (typeof(prop) !== 'object') { return prop; }
      obj = prop;
    }
    return null;
  }


  // Find the 'on-behalf-of' user ID, for the situation where a bot
  // needs to make a request on behalf of another user.

  return function(req, res, next) {
    function simulatedNext(err) {
      if (err) {
        console.log("sumulated next - passing on error");
        return next(err);
      }
      console.log("calling discover on behalf of middleware");
      return discoverOnBehalfOfMiddleware(req, res, next);
    }

    // TODO call passport middleware instead
    console.log("calling discover user middleware");
    return discoverUserMiddleware(req, res, simulatedNext);
  }



  // This must be added before any routing that depends
  // upon `access`.
};


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
exports.withPermission = function(permission, affected_user_list_func) {
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
