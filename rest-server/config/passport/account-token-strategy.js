'use strict';

const passport = require('passport-strategy');
const util = require('util');

// Use this to extract the token.
// const ExtractJwt = require('passport-jwt').ExtractJwt;


function AccountTokenStrategy(options, findByReq) {
  this._tokenFromRequest = options.tokenFromRequest;
  if (!this._tokenFromRequest) {
      throw new TypeError('AccountTokenStrategy requires a function to retrieve the authentication token from requests (see option tokenFromRequest)');
  }

  this._findByReq = findByReq;
  if (!this._findByReq) {
    throw new TypeError('AccountTokenStrategy requires the account retrieval function that returns a promise object');
  }
}
util.inherits(AccountTokenStrategy, passport.Strategy);


AccountTokenStrategy.prototype.authenticate = function(req, options) {
  var self = this;

  console.log(`token auth check`);

  if (! req.fingerprint) {
    console.log(`no fingerprint`);
    return self.fail(new Error("No fingerprint"));
  }

  var token = self._tokenFromRequest(req);

  if (!token) {
    console.log(`no token`);
      return self.fail(new Error("No auth token"));
  }

  req.token = token;

  self._findByReq(req)
    .then(function(account) {
      if (! account) {
        // TODO pass in the information about the error.
        console.log('Fail!')
        self.fail();
      } else {
        // TODO pass in the information about the request.
        console.log('pass!');
        self.success(account, null);
      }
    })
    .catch(function(err) {
      console.log(`token error: ${err.message}`);
      console.log(err.stack);
      self.error(err);
    })
};


module.exports = AccountTokenStrategy;
