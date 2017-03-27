'use strict';


const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/image');

// This API allows posting images that are referenced in the various elements
// in the database, and for system images.

/* TODO need correct management of individual images, without needing a
DB backing support.
const IMAGE_GET = access.authorize(permissions.IMAGE_GET, authAffectedUsersNone);
const AVATAR_UPDATE = access.authorize(permissions.AVATAR_UPDATE, authAffectedUsersNone);
const IMAGE_CREATE = access.authorize(permissions.IMAGE_CREATE, authAffectedUsersNone);
const IMAGE_UPDATE = access.authorize(permissions.IMAGE_UPDATE, authAffectedUsersNone);
const IMAGE_DELETE = access.authorize(permissions.IMAGE_DELETE, authAffectedUsersNone);

router.get('/', IMAGE_GET, controller.getAll);
router.get('/:id', PRIZE_VIEW, controller.getOne);

router.post('/', PRIZE_CREATE, controller.create);
router.push('/:id', PRIZE_UPDATE, controller.update);
*/

// ================================================================
// Authentication functions

function authAffectedUsersNone(req) {
  return [];
}

module.exports = router;
