'use strict';

const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/user');

const USER_BRIEF_VIEW = access.authorize(permissions.USER_BRIEF_VIEW, auth_affected_users_none);
const USER_DETAILS_VIEW = access.authorize(permissions.USER_DETAILS_VIEW, auth_affected_users_id);


router.get('/', USER_BRIEF_VIEW, controller.getAllBrief);
router.get('/:id', USER_BRIEF_VIEW, controller.getOneBrief);
router.get('/:id/details', USER_DETAILS_VIEW, controller.getOneDetails);


// ================================================================
// Authentication functions

function auth_affected_users_id(req) {
  if (req.params.id) {
    return [ req.params.id ];
  } else {
    return [];
  }
}

function auth_affected_users_none(req) {
  return [];
}

module.exports = router;
