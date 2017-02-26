'use strict';

/*
 * Associates a user login object with the request (req.login and req.user),
 * and the on-behalf-of login and on-behalf-of user (req.behalfLogin and
 * req.behalfUser).  This does not cause unauthetication errors if the user
 * is not found or in the request.  That is handled by the with_permission
 * module.
 */

const passport = require('passport');
const models = require('../../models');
const Login = models.Login;
const User = models.User;

console.log("Models object: " + models);
for (var xxxx in models) {
  console.log(" - " + xxxx);
}
console.log("User object: " + User);
console.log("Login object: " + Login);

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
  if (!! username) {
    console.log("getting login for " + username);
    Login.findOne({ username: username }, function(err, login) {
      if (err) {
        return next(err);
      }
      req.login = login;
      if (!! login) {
        User.findOne({ username: username }, function(err, user) {
          if (err) {
            return next(err);
          }
          req.user = user;
          next();
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


module.exports = function() {
  // For now, just a really simple middleware that
  // extracts the username on faith.  Eventually, this
  // will invoke several middleware functions to construct
  // the user request object (from passport).

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
