'use strict';

const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/setting');

const SITE_SETTINGS = access.authorize(permissions.SITE_SETTINGS, auth_affected_users_none);


router.get('/', SITE_SETTINGS, controller.get);
router.put('/', SITE_SETTINGS, controller.set);

// ================================================================
// Authentication functions

function auth_affected_users_none(req) {
  return [];
}

module.exports = router;
