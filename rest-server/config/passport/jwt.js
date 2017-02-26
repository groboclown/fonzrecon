'use strict';

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Login = require('../../models').Login;
const settings = require('../settings');

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

const jwtOptions = {
  // Passport should use authorization headers from JWT
  jwtFromRequest: ExtractJwt.fromAuthHeader(),

  // Passport secret
  secretOrKey: settings.secret,
};



module.exports = new JwtStrategy(jwtOptions, function(payload, done) {
  // TODO augment as appropriate
  const criteria = {
    username: getPayloadId(payload),
  }
  Login.findOne(criteria, function(err, login) {
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
