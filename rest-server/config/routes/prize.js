'use strict';


const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/prize');

const PRIZE_VIEW = access.authorize(permissions.PRIZE_VIEW, authAffectedUsersNone);

router.get('/', PRIZE_VIEW, controller.getAll);
router.get('/:id', PRIZE_VIEW, controller.getOne);

// ================================================================
// Authentication functions

function authAffectedUsersNone(req) {
  return [];
}

module.exports = router;
