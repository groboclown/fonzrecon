'use strict';

const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/user');

const USER_BRIEF_VIEW = access.authorize(permissions.USER_BRIEF_VIEW, authAffectedUsersNone);
const USER_DETAILS_VIEW = access.authorize(permissions.USER_DETAILS_VIEW, authAffectedUsersId);
const USER_DETAILS_EDIT = access.authorize(permissions.USER_DETAILS_EDIT, authAffectedUsersId);
const ACCOUNT_CREATE = access.authorize(permissions.ACCOUNT_CREATE, authAffectedUsersNone);
const ACCOUNT_EDIT = access.authorize(permissions.ACCOUNT_EDIT, authAffectedUsersId);
const ACCOUNT_IMPORT = access.authorize(permissions.ACCOUNT_IMPORT, authAffectedUsersNone);
const ACCOUNT_DELETE = access.authorize(permissions.ACCOUNT_DELETE, authAffectedUsersId);
const ADMIN_ROLE_SET = access.authorize(permissions.ADMIN_ROLE_SET, authAffectedUsersId);
const CHANGE_USER_POINTS_TO_AWARD = access.authorize(permissions.CHANGE_USER_POINTS_TO_AWARD, authAffectedUsersNone);

// These must be before the ":id" routes.
// By putting a non-user character in the route ('-'), it means it can't
// collide with the user id.
router.put('/reset-points-to-award', CHANGE_USER_POINTS_TO_AWARD, controller.resetAllPointsToAward);
router.post('/batch-import', ACCOUNT_IMPORT, controller.import);
router.get('/about-me', USER_BRIEF_VIEW, controller.getSelf);


router.get('/', USER_BRIEF_VIEW, controller.getAllBrief);
router.get('/:id', USER_BRIEF_VIEW, controller.getOneBrief);
router.get('/:id/details', USER_DETAILS_VIEW, controller.getOneDetails);

router.post('/', ACCOUNT_CREATE, controller.create);
router.put('/:id', USER_DETAILS_EDIT, controller.update);
router.delete('/:id', ACCOUNT_DELETE, controller.delete);

// Not a proper rest API style call, but it allows for easy permission
// checking.
router.put('/:id/role', ADMIN_ROLE_SET, controller.setRole);
router.put('/:id/reset-points-to-award', CHANGE_USER_POINTS_TO_AWARD, controller.resetOnePointsToAward);

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
