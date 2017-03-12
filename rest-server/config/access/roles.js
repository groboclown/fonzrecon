'use strict';

const permissions = require('./permissions');

// Permission access
function ALLOW_SELF(selfUser, onBehalfOf, affectedUsers) {
  return affectedUsers.includes(selfUser);
}
function ALLOW_ON_BEHALF_OF(selfUser, onBehalfOf, affectedUsers) {
  return affectedUsers.includes(onBehalfOf);
}
function ALLOW_ANY(selfUser, onBehalfOf, affectedUsers) {
  return true;
}
function ALLOW_NONE(selfUser, onBehalfOf, affectedUsers) {
  return false;
}



module.exports = {
  names: ['BOT', 'USER', 'ADMIN'],

  // Can view basic user info, can award on users' behalf, can view
  // basic public award info.  Even if the user is an admin, the user
  // cannot get admin views.
  BOT: {
    name: 'BOT',

    // Roles that can use the "behalf" parameter.  It will be ignored
    // for all other users.  This allows for simplified logic in the
    // controllers, so that they just check for the "on behalf of"
    // then "user" to see who the requestor is.
    canRunOnBehalfOf: true,

    permissions: {
      USER_BRIEF_VIEW: ALLOW_ANY,
      USER_DETAILS_VIEW: ALLOW_ON_BEHALF_OF,
      ACKNOWLEDGEMENT_VIEW: ALLOW_ANY,
      ACKNOWLEDGEMENT_PRIVATE_VIEW: ALLOW_NONE,
      PRIZE_VIEW: ALLOW_ANY,
      CLAIM_VIEW: ALLOW_ANY,
      CLAIM_CREATE: ALLOW_NONE,

      // No account management.
      // But a bot can create a user if it doesn't already exist.
      ACCOUNT_CREATE: ALLOW_ANY,

      // This is a bit weird: the API will use the "behalf-of"
      // user first (user will be null).  So, because any user can
      // create an acknowledgement, but acknowledgments will only
      // be created based on the currently logged-in user, the
      // bot should always be allowed to create.
      ACKNOWLEDGEMENT_CREATE: ALLOW_ANY,
      THUMBSUP_CREATE: ALLOW_ANY
    }
  },

  // Can alter limited details about self, can view other users' basic
  // info, can give and receive points, can view detailed info on awards
  // given to self or awarded by self, can view .
  USER: {
    name: 'USER',
    canRunOnBehalfOf: false,
    permissions: {
      USER_BRIEF_VIEW: ALLOW_ANY,
      USER_DETAILS_VIEW: ALLOW_SELF,
      USER_DETAILS_EDIT: ALLOW_SELF,
      ACCOUNT_VIEW: ALLOW_SELF,
      ACCOUNT_EDIT: ALLOW_SELF,
      ACCOUNT_CREATE: ALLOW_NONE,
      ACCOUNT_VALIDATE: ALLOW_SELF,
      ACKNOWLEDGEMENT_VIEW: ALLOW_ANY,
      ACKNOWLEDGEMENT_PRIVATE_VIEW: ALLOW_NONE,
      PRIZE_VIEW: ALLOW_ANY,

      // This, too is a bit weird.  The API will create an ack
      // only for the requesting user.  Because the requesting user
      // is a user, they will be allowed to create it for themselves.
      ACKNOWLEDGEMENT_CREATE: ALLOW_ANY,
      THUMBSUP_CREATE: ALLOW_ANY,
      CLAIM_VIEW: ALLOW_ANY,
      CLAIM_CREATE: ALLOW_ANY
    }
  },

  // Admin access + User rights.
  // To restrict the user to not receive or give awards,
  // then don't assign the admin account a user.
  ADMIN: {
    name: 'ADMIN',
    canRunOnBehalfOf: false,
    permissions: {
      USER_BRIEF_VIEW: ALLOW_ANY,
      USER_DETAILS_VIEW: ALLOW_ANY,
      USER_DETAILS_EDIT: ALLOW_ANY,
      ACCOUNT_VIEW: ALLOW_ANY,
      ACCOUNT_EDIT: ALLOW_SELF,
      ACCOUNT_CREATE: ALLOW_ANY,
      ACCOUNT_VALIDATE: ALLOW_SELF,
      ACKNOWLEDGEMENT_VIEW: ALLOW_ANY,
      ACKNOWLEDGEMENT_PRIVATE_VIEW: ALLOW_ANY,
      PRIZE_VIEW: ALLOW_ANY,
      PRIZE_CREATE: ALLOW_ANY,

      // Again, acks will only be created for the requesting user.
      ACKNOWLEDGEMENT_CREATE: ALLOW_ANY,
      THUMBSUP_CREATE: ALLOW_ANY,
      CLAIM_VIEW: ALLOW_ANY,
      CLAIM_CREATE: ALLOW_NONE, // Admins can't claim prizes
      SITE_SETTINGS: ALLOW_ANY
    }
  }
};
