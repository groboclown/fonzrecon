'use strict';


const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/prize');

const PRIZE_VIEW = access.authorize(permissions.PRIZE_VIEW, authAffectedUsersNone);
const PRIZE_CREATE = access.authorize(permissions.PRIZE_CREATE, authAffectedUsersNone);
const PRIZE_UPDATE = access.authorize(permissions.PRIZE_UPDATE, authAffectedUsersNone);

router.get('/', PRIZE_VIEW, controller.getAll);
router.get('/:id', PRIZE_VIEW, controller.getOne);

router.post('/', PRIZE_CREATE, controller.create);
router.put('/:id/expire', PRIZE_UPDATE, controller.expire);
router.put('/:id', PRIZE_UPDATE, controller.update);


// ================================================================
// Authentication functions

function authAffectedUsersNone(req) {
  return [];
}

module.exports = router;
