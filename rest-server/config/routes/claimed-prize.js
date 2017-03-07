'use strict';


const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/claimed-prize');

const CLAIM_VIEW = access.authorize(permissions.CLAIM_VIEW, auth_affected_users_none);
const CLAIM_CREATE = access.authorize(permissions.CLAIM_CREATE, auth_affected_users_none);

router.get('/', CLAIM_VIEW, controller.getAll);
router.get('/:id', CLAIM_VIEW, controller.getOne);
router.post('/', CLAIM_CREATE, controller.create);

// ================================================================
// Authentication functions

function auth_affected_users_none(req) {
  return [];
}

module.exports = router;
