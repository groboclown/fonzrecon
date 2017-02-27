'use strict';

module.exports = {
  findLogin: require('./find-login'),
  userForUsernamePassword: require('./user-for-username-password'),
  authorize: require('./authorize'),

  // Should never be used outside this module.
  // findUserAndBehalf: require('./find-user-and-behalf'),
};
