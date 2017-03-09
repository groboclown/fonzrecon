'use strict';

const AccountTokenStrategy = require('./account-token-strategy');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const findAccountByToken = require('../../controllers/access').token.findAccountByToken;

const accountOptions = {
  // Passport should use authorization headers from JWT
  tokenFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeader(),

      // Not preferred, but for some simplification
      ExtractJwt.fromUrlQueryParameter()
    ]),
};



module.exports = new AccountTokenStrategy(accountOptions, findAccountByToken);
