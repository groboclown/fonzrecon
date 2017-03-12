'use strict';

const LocalStrategy = require('passport-local');
const accessController = require('../../controllers/access');

// Sets up the authentication strategies - how
// passport maps the request input parameters to an authentication
// object, which will be put into the "req.user" parameter.

const BAD_LOGIN_TEXT = 'Authentication required.';
const localOptions = {
  usernameField: 'username'
};

module.exports = new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, (username, password, done) => {
  accessController.userForUsernamePassword(username, password)
    .then((res) => {
      done(null, res);
    })
    .catch((err) => {
      done(err);
    });
});
