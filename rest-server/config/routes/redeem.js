'use strict';


const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/redeem');

const REDEEM_VIEW = access.authorize(permissions.REDEEM_VIEW, auth_affected_users_none);

router.get('/', REDEEM_VIEW, controller.getAll);
router.get('/:id', REDEEM_VIEW, controller.getOne);

// ================================================================
// Authentication functions

function auth_affected_users_none(req) {
  return [];
}

module.exports = router;
