'use strict';

const permissions = require('./permissions');

// Permission access
function ALLOW_SELF(self_user, on_behalf_of, affected_users) {
  return affected_users.includes(self_user);
},
function ALLOW_ON_BEHALF_OF(self_user, on_behalf_of, affected_users) {
  return affected_users.includes(on_behalf_of);
},
function ALLOW_ANY(self_user, on_behalf_of, affected_users) {
  return true;
},
function ALLOW_NONE(self_user, on_behalf_of, affected_users) {
  return false;
},



module.exports = {
  names: ['BOT', 'USER', 'ADMIN', 'SYSOP'],

  // Can view basic user info, can award on users' behalf, can view
  // basic public award info
  BOT: {
    name: 'BOT',
    permissions: {
      USER_BRIEF_VIEW: ALLOW_ANY,
      AWARD_BRIEF_VIEW_PUBLIC: ALLOW_ANY,
      AWARD_BRIEF_VIEW_PRIVATE: ALLOW_ON_BEHALF_OF,
      AWARD_CREATE: ALLOW_ON_BEHALF_OF,
    }
  },

  // Can alter limited details about self, can view other users' basic
  // info, can give and receive points, can view detailed info on awards
  // given to self or awarded by self, can view .
  USER: {
    name: 'USER',
    permissions: {

    }
  },

  // Admin access + User rights.
  ADMIN: {
    name: 'ADMIN',
    permissions: {

    }
  },

  // Admin user who cannot use the point stuff.
  SYSOP: {
    name: 'SYSOP',
    permissions: {

    }
  }
};
