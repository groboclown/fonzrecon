'use strict';

exports.setup = function(passport) {
  // serialization of the session is not supported.

  passport.use(require('./local'));
  passport.use(require('./jwt'));
};
