'use strict';

const LocalStrategy = require('passport-local');
const Login = require('../../models').Login;

// Sets up the authentication strategies - how
// passport maps the request input parameters to an authentication
// object, which will be put into the "req.user" parameter.

const BAD_LOGIN_TEXT = 'Authentication required.';
const localOptions = {
  usernameField: 'username'
};

module.exports = new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
}, function(username, password, done) {
  Login.findOne({ username: username }, function(err, login) {
    if (err) {
      return done(err);
    }
    if (! login) {
      // TODO perform the encrypt function to wait the same
      // amount of time as a found user call.
      return done(null, false, { error: BAD_LOGIN_TEXT });
    }
    login.compareAuthentication(password, function(err, isMatch) {
      if (err) {
        return done(err);
      }
      if (! isMatch) {
        return done(null, false, { error: BAD_LOGIN_TEXT });
      }
      return done(null, login)
    });
  });
});
