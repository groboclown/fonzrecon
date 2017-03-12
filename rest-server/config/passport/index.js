'use strict';

exports.setup = function(passport) {
  // Serialization of the session is not supported.

  passport.use('token', require('./account-token'));
  passport.use('local', require('./local'));
};
