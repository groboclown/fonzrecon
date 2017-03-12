'use strict';


const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/acknowledgement');

const ACKNOWLEDGEMENT_VIEW = access.authorize(permissions.ACKNOWLEDGEMENT_VIEW, authAffectedUsersNone);
const ACKNOWLEDGEMENT_CREATE = access.authorize(permissions.ACKNOWLEDGEMENT_CREATE, authAffectedUsersNone);

// We can create a thumbs up on public acknowledgements, not just the
// ones the user was part of.  Indeed, giving a thumbs up to the
// acknowledgements that the user was part of is not allowed.
const THUMBSUP_CREATE = access.authorize(permissions.THUMBSUP_CREATE, authAffectedUsersNone);


router.get('/', ACKNOWLEDGEMENT_VIEW, controller.getAll);
router.get('/:id', ACKNOWLEDGEMENT_VIEW, controller.getOne);

router.post('/', ACKNOWLEDGEMENT_CREATE, controller.create);
router.post('/:id/thumbsup', THUMBSUP_CREATE, controller.createThumbsUp);

// ================================================================
// Authentication functions

function authAffectedAckId(req) {
  if (req.params.id) {
    return controller.getUsersInAcknowledgement(req);
  }
  return [];
}

function authAffectedUsersNone(req) {
  return [];
}

module.exports = router;
