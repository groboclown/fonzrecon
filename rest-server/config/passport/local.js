'use strict';

const LocalStrategy = require('passport-local');
const accessController = require('../../controllers/access');
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
  accessController.userForUsernamePassword(username, password)
    .then(function(res) {
      done(null, res);
    })
    .catch(function(err) {
      if (err.isDone) {
        done(null, false, err.message);
      } else {
        done(err);
      }
    });
});
