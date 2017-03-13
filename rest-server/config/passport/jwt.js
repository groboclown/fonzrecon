'use strict';

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Account = require('../../models').Account;
const settings = require('../settings');

function getPayloadId(payload) {
  if (!!payload.id) {
    return payload.id;
  }
  if (!!payload._id) {
    return payload._id;
  }
  // jscs:disable
  if (!!payload.doc_id) {
    // jscs:disable
    return payload.doc_id;
  }
  if (!!payload.document && !!payload.document._id) {
    return payload.document._id;
  }
  return null;
}

const jwtOptions = {
  // Passport should use authorization headers from JWT
  jwtFromRequest: ExtractJwt.fromAuthHeader(),

  // Passport secret
  secretOrKey: settings.secret
};



module.exports = new JwtStrategy(jwtOptions, function(payload, done) {
  // TODO augment as appropriate
  const criteria = {
    username: getPayloadId(payload)
  }
  Account.findOne(criteria, (err, account) => {
    if (err) {
      return done(err);
    }
    if (account) {
      done(null, account);
    } else {
      done(null, false);
    }
  });
});
