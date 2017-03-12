'use strict';

const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/setting');

const SITE_SETTINGS = access.authorize(permissions.SITE_SETTINGS, authAffectedUsersNone);


router.get('/', SITE_SETTINGS, controller.get);
router.put('/', SITE_SETTINGS, controller.set);

// ================================================================
// Authentication functions

function authAffectedUsersNone(req) {
  return [];
}

module.exports = router;
