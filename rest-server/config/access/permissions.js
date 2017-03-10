'use strict';


module.exports = {
  // Permission levels
  ACCOUNT_EDIT: { key: 'ACCOUNT_EDIT' },
  ACCOUNT_VIEW: { key: 'ACCOUNT_VIEW' },
  ACCOUNT_CREATE: { key: 'ACCOUNT_CREATE' },
  ACCOUNT_VALIDATE: { key: 'ACCOUNT_VALIDATE' },
  USER_DETAILS_EDIT: { key: 'USER_DETAILS_EDIT'},
  USER_BRIEF_VIEW: { key: 'USER_BRIEF_VIEW' },
  USER_DETAILS_VIEW: { key: 'USER_DETAILS_VIEW' },
  ACKNOWLEDGEMENT_VIEW: { key: 'ACKNOWLEDGEMENT_VIEW' },
  ACKNOWLEDGEMENT_CREATE: { key: 'ACKNOWLEDGEMENT_CREATE' },
  THUMBSUP_CREATE: { key: 'THUMBSUP_CREATE' },
  PRIZE_VIEW: { key: 'PRIZE_VIEW' },
  PRIZE_CREATE: { key: 'PRIZE_CREATE' },
  CLAIM_VIEW: { key: 'CLAIM_VIEW' },
  CLAIM_CREATE: { key: 'CLAIM_CREATE' },

  // This one is called the same, but the result (true or false)
  // means whether the user can view private acknowledgements.  This
  // affects the query made.
  ACKNOWLEDGEMENT_PRIVATE_VIEW: { key: 'ACKNOWLEDGEMENT_PRIVATE_VIEW' },
};
