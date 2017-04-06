'use strict';


const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/image');

// This API allows posting images that are referenced in the various elements
// in the database, and for system images.

// At the moment, this is an adhoc system, relating 1-to-1 to the APIs that
// contain images.

const PRIZE_CREATE = access.authorize(permissions.PRIZE_CREATE, authAffectedUsersNone);
const USER_DETAILS_EDIT = access.authorize(permissions.USER_DETAILS_EDIT, authAffectedUsersId);
const SITE_SETTINGS = access.authorize(permissions.SITE_SETTINGS, authAffectedUsersNone);

// TODO create rest-api docs for these.
router.post('/prize/:id', PRIZE_CREATE, controller.postPrize);
router.post('/user/:id', USER_DETAILS_EDIT, controller.postUser);
router.post('/setting/:id', SITE_SETTINGS, controller.postSetting);


// ================================================================
// Authentication functions

function authAffectedUsersNone(req) {
  return [];
}

function authAffectedUsersId(req) {
  if (req.params.id) {
    return [ req.params.id ];
  }
  return [];
}

module.exports = router;
