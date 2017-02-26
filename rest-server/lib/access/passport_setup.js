'use strict';

const passport = require('passport');
const config = require('../../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const Login = require('../model/login');
const getPayloadId = require('./payload_id').getPayloadId;

const BAD_LOGIN_TEXT = 'Authentication required.'

// Sets up the authentication strategies - how
// passport maps the request input parameters to an authentication
// object, which will be put into the "req.user" parameter.

const localOptions = {
  usernameField: 'username'
};
const localLogin = new LocalStrategy(localOptions, function(username, password, done) {
  Login.findOne({ username: username }, function(err, login) {
    if (err) {
      return done(err);
    }
    if (! login) {
      return done(null, false, { error: BAD_LOGIN_TEXT });
    }
    login.compareAuthentication(password)
      .then(isMatch => {
        if (! isMatch) {
          return done(null, false, { error: BAD_LOGIN_TEXT });
        }
        return done(null, login)
      })
      .catch(err => {
        done(err);
      });
  });
});

const jwtOptions = {
  // Passport should use authorization headers from JWT
  jwtFromRequest: ExtractJwt.fromAuthHeader(),

  // Passport secret
  secretOrKey: config.secret
};
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  Login.findById(getPayloadId(payload), function(err, login) {
    if (err) {
      return done(err);
    }
    if (login) {
      done(null, login);
    } else {
      done(null, false);
    }
  });
});


module.exports = function(app) {
  passport.use(jwtLogin);
  passport.use(localLogin);
};
