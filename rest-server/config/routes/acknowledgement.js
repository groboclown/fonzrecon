'use strict';


const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/acknowledgement');

const ACKNOWLEDGEMENT_BRIEF_VIEW_PUBLIC = access.authorize(permissions.ACKNOWLEDGEMENT_BRIEF_VIEW_PUBLIC, auth_affected_users_none);
const ACKNOWLEDGEMENT_BRIEF_VIEW_PRIVATE = access.authorize(permissions.ACKNOWLEDGEMENT_BRIEF_VIEW_PRIVATE, auth_affected_ack_id);
const ACKNOWLEDGEMENT_DETAILS_VIEW = access.authorize(permissions.ACKNOWLEDGEMENT_DETAILS_VIEW, auth_affected_ack_id);
const ACKNOWLEDGEMENT_CREATE = access.authorize(permissions.ACKNOWLEDGEMENT_CREATE, auth_affected_users_none);


router.get('/', ACKNOWLEDGEMENT_BRIEF_VIEW_PUBLIC, controller.getAllBrief);
router.get('/:id', ACKNOWLEDGEMENT_BRIEF_VIEW_PUBLIC, controller.getOneBrief);
router.get('/:id/details', ACKNOWLEDGEMENT_DETAILS_VIEW, controller.getOneDetails);

router.post('/', ACKNOWLEDGEMENT_CREATE, controller.create);

// ================================================================
// Authentication functions

function auth_affected_ack_id(req) {
  if (req.params.id) {
    return controller.getUsersInAcknowledgement(req);
  } else {
    return [];
  }
}

function auth_affected_users_none(req) {
  return [];
}

module.exports = router;
