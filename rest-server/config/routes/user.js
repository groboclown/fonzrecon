'use strict';

const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/user');

const USER_BRIEF_VIEW = access.authorize(permissions.USER_BRIEF_VIEW, authAffectedUsersNone);
const USER_DETAILS_VIEW = access.authorize(permissions.USER_DETAILS_VIEW, authAffectedUsersId);
const ACCOUNT_CREATE = access.authorize(permissions.ACCOUNT_CREATE, authAffectedUsersNone);
const ACCOUNT_EDIT = access.authorize(permissions.ACCOUNT_EDIT, authAffectedUsersId);
const ACCOUNT_IMPORT = access.authorize(permissions.ACCOUNT_IMPORT, authAffectedUsersNone);
const ADMIN_ROLE_SET = access.authorize(permissions.ADMIN_ROLE_SET, authAffectedUsersId);


router.get('/', USER_BRIEF_VIEW, controller.getAllBrief);
router.get('/:id', USER_BRIEF_VIEW, controller.getOneBrief);
router.get('/:id/details', USER_DETAILS_VIEW, controller.getOneDetails);

router.post('/', ACCOUNT_CREATE, controller.create);
router.put('/:id', USER_DETAILS_EDIT, controller.update);
router.delete('/:id', ACCOUNT_DELETE, controller.delete);
router.post('/import', ACCOUNT_IMPORT, controller.import);

// Not a proper rest API style call, but it allows for easy permission
// checking.
router.put('/:id/role', ADMIN_ROLE_SET, controller.setRole)

// ================================================================
// Authentication functions

function authAffectedUsersId(req) {
  if (req.params.id) {
    return [ req.params.id ];
  }
  return [];
}

function authAffectedUsersNone(req) {
  return [];
}

module.exports = router;
