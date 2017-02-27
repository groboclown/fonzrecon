'use strict';


const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/acknowledge');

const ACKNOWLEDGE_BRIEF_VIEW_PUBLIC = access.authorize(permissions.ACKNOWLEDGE_BRIEF_VIEW_PUBLIC, auth_affected_users_none);
const ACKNOWLEDGE_BRIEF_VIEW_PRIVATE = access.authorize(permissions.ACKNOWLEDGE_BRIEF_VIEW_PRIVATE, auth_affected_ack_id);
const ACKNOWLEDGE_DETAILS_VIEW = access.authorize(permissions.ACKNOWLEDGE_DETAILS_VIEW, auth_affected_ack_id);


router.get('/', ACKNOWLEDGE_BRIEF_VIEW_PUBLIC, controller.getAllBrief);
router.get('/:id', ACKNOWLEDGE_BRIEF_VIEW_PUBLIC, controller.getOneBrief);
router.get('/:id/details', ACKNOWLEDGE_DETAILS_VIEW, controller.getOneDetails);

// ================================================================
// Authentication functions

function auth_affected_ack_id(req) {
  if (req.params.id) {
    return controller.getUsersInAcknowledge(req);
  } else {
    return [];
  }
}

function auth_affected_users_none(req) {
  return [];
}

module.exports = router;
