'use strict';

module.exports = {
  findAccount: require('./find-account'),
  userForUsernamePassword: require('./user-for-username-password'),
  authorize: require('./authorize'),

  // Should never be used outside this module.
  // findUserAndBehalf: require('./find-user-and-behalf'),
};
