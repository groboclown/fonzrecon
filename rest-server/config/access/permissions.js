'use strict';


module.exports = {
  // Permission levels
  ACCOUNT_EDIT: { key: 'ACCOUNT_EDIT' },
  ACCOUNT_VIEW: { key: 'ACCOUNT_VIEW' },
  ACCOUNT_CREATE: { key: 'ACCOUNT_CREATE' },
  ACCOUNT_IMPORT: { key: 'ACCOUNT_IMPORT' },
  ACCOUNT_DELETE: { key: 'ACCOUNT_DELETE' },
  ADMIN_ROLE_SET: { key: 'ADMIN_ROLE_SET' },
  CHANGE_USER_POINTS_TO_AWARD: { key: 'CHANGE_USER_POINTS_TO_AWARD' },
  USER_DETAILS_EDIT: { key: 'USER_DETAILS_EDIT'},
  USER_BRIEF_VIEW: { key: 'USER_BRIEF_VIEW' },
  USER_DETAILS_VIEW: { key: 'USER_DETAILS_VIEW' },
  ACKNOWLEDGEMENT_VIEW: { key: 'ACKNOWLEDGEMENT_VIEW' },
  ACKNOWLEDGEMENT_CREATE: { key: 'ACKNOWLEDGEMENT_CREATE' },
  THUMBSUP_CREATE: { key: 'THUMBSUP_CREATE' },
  PRIZE_VIEW: { key: 'PRIZE_VIEW' },
  PRIZE_CREATE: { key: 'PRIZE_CREATE' },
  PRIZE_UPDATE: { key: 'PRIZE_UPDATE' },
  CLAIM_VIEW: { key: 'CLAIM_VIEW' },
  CLAIM_DETAILS_VIEW: { key: 'CLAIM_DETAILS_VIEW' },
  CLAIM_CREATE: { key: 'CLAIM_CREATE' },
  CLAIM_VALIDATE: { key: 'CLAIM_VALIDATE' },
  SITE_SETTINGS: { key: 'SITE_SETTINGS' },

  // This one is called the same, but the result (true or false)
  // means whether the user can view private acknowledgements.  This
  // affects the query made.
  ACKNOWLEDGEMENT_PRIVATE_VIEW: { key: 'ACKNOWLEDGEMENT_PRIVATE_VIEW' }
};
