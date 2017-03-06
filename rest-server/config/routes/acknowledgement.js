'use strict';


const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/acknowledgement');

const ACKNOWLEDGEMENT_VIEW = access.authorize(permissions.ACKNOWLEDGEMENT_VIEW, auth_affected_users_none);
const ACKNOWLEDGEMENT_CREATE = access.authorize(permissions.ACKNOWLEDGEMENT_CREATE, auth_affected_users_none);
const THUMBSUP_CREATE = access.authorize(permissions.THUMBSUP_CREATE, auth_affected_ack_id);


router.get('/', ACKNOWLEDGEMENT_VIEW, controller.getAll);
router.get('/:id', ACKNOWLEDGEMENT_VIEW, controller.getOne);

router.post('/', ACKNOWLEDGEMENT_CREATE, controller.create);
router.post('/:id/thumbsup', THUMBSUP_CREATE, controller.createThumbsUp);

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
