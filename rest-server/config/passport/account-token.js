'use strict';

const AccountTokenStrategy = require('./account-token-strategy');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const findAccountByToken = require('../../controllers/access').token.findAccountByToken;

const accountOptions = {
  // Passport should use authorization headers from JWT
  tokenFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeader(),

      fromCookie(),

      // Not preferred, but for some simplification
      ExtractJwt.fromUrlQueryParameter()
    ])
};


function fromCookie(cookieName) {
  cookieName = cookieName || 'authorization';
  return (request) => {
    var token = null;
    if (request.cookies && request.cookies[cookieName]) {
      token = request.cookies[cookieName];
    }
    return token;
  };
}


module.exports = new AccountTokenStrategy(accountOptions, findAccountByToken);
