'use strict';

const permissions = require('./permissions');

// Permission access
function ALLOW_SELF(self_user, on_behalf_of, affected_users) {
  return affected_users.includes(self_user);
}
function ALLOW_ON_BEHALF_OF(self_user, on_behalf_of, affected_users) {
  return affected_users.includes(on_behalf_of);
}
function ALLOW_ANY(self_user, on_behalf_of, affected_users) {
  return true;
}
function ALLOW_NONE(self_user, on_behalf_of, affected_users) {
  return false;
}



module.exports = {
  names: ['BOT', 'USER', 'ADMIN'],

  // Can view basic user info, can award on users' behalf, can view
  // basic public award info
  BOT: {
    name: 'BOT',
    permissions: {
      USER_BRIEF_VIEW: ALLOW_ANY,
      USER_DETAILS_VIEW: ALLOW_ON_BEHALF_OF,
      ACKNOWLEDGEMENT_BRIEF_VIEW_PUBLIC: ALLOW_ANY,
      ACKNOWLEDGEMENT_BRIEF_VIEW_PRIVATE: ALLOW_ON_BEHALF_OF,
      ACKNOWLEDGEMENT_DETAILS_VIEW: ALLOW_ON_BEHALF_OF,

      // This is a bit weird: the API will use the "behalf-of"
      // user first (user will be null).  So, because any user can
      // create an acknowledgement, but acknowledgments will only
      // be created based on the currently logged-in user, the
      // bot should always be allowed to create.
      ACKNOWLEDGEMENT_CREATE: ALLOW_ANY,
    }
  },

  // Can alter limited details about self, can view other users' basic
  // info, can give and receive points, can view detailed info on awards
  // given to self or awarded by self, can view .
  USER: {
    name: 'USER',
    permissions: {
      USER_BRIEF_VIEW: ALLOW_ANY,
      USER_DETAILS_VIEW: ALLOW_SELF,
      USER_DETAILS_EDIT: ALLOW_SELF,
      LOGIN_VIEW: ALLOW_SELF,
      LOGIN_EDIT: ALLOW_SELF,
      ACKNOWLEDGEMENT_DETAILS_VIEW: ALLOW_SELF,
      ACKNOWLEDGEMENT_BRIEF_VIEW_PRIVATE: ALLOW_ANY,
      ACKNOWLEDGEMENT_BRIEF_VIEW_PRIVATE: ALLOW_SELF,

      // This, too is a bit weird.  The API will create an ack
      // only for the requesting user.  Because the requesting user
      // is a user, they will be allowed to create it for themselves.
      ACKNOWLEDGEMENT_CREATE: ALLOW_ANY,
    }
  },

  // Admin access + User rights.
  // To restrict the user to not receive or give awards,
  // then don't assign the admin login a user.
  ADMIN: {
    name: 'ADMIN',
    permissions: {
      USER_BRIEF_VIEW: ALLOW_ANY,
      USER_DETAILS_VIEW: ALLOW_ANY,
      USER_DETAILS_EDIT: ALLOW_ANY,
      LOGIN_VIEW: ALLOW_ANY,
      LOGIN_EDIT: ALLOW_ANY,
      ACKNOWLEDGEMENT_DETAILS_VIEW: ALLOW_ANY,
      ACKNOWLEDGEMENT_BRIEF_VIEW_PRIVATE: ALLOW_ANY,
      ACKNOWLEDGEMENT_BRIEF_VIEW_PRIVATE: ALLOW_ANY,

      // Again, acks will only be created for the requesting user.
      ACKNOWLEDGEMENT_CREATE: ALLOW_ANY,
    }
  },
};
