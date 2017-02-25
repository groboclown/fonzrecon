'use strict';

const passport = require('passport');
const config = require('../../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const Login = require('../model/login');

const BAD_LOGIN_TEXT = 'Your login details could not be verified.  Please try again.';

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

function getPayloadId(payload) {
  if (!! payload.id) {
    return payload.id;
  }
  if (!! payload._id) {
    return payload._id;
  }
  if (!! payload.doc_id) {
    return payload.doc_id;
  }
  if (!! payload.document && !! payload.document._id) {
    return payload.document._id;
  }
  return null;
}

exports.setup = function() {
  passport.use(jwtLogin);
  passport.use(localLogin);
  return function(req, res, next) {
    // Restrict to CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Access-Control-Allow-Credentials');
    if (req.method === 'OPTIONS') {
      res.status(200).end();
    } else {
      next();
    }
  };
};

exports.roles = require('./roles');
exports.permissions = require('./permissions');
exports.authenticate = function() {
  return function() {
    return passport.authenticate('local', { session: false });
  }
};
