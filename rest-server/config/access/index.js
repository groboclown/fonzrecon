'use strict';

module.exports = {
  setup: function(passport) {
    this.passport = passport;
  },
  passport: null,
  permissions: require('./permissions'),
  roles: require('./roles')
};
