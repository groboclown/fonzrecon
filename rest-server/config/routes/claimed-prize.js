'use strict';


const express = require('express');
const router = express.Router();
const access = require('../../controllers/access');
const permissions = require('../access/permissions');
const controller = require('../../controllers/claimed-prize');
const models = require('../../models');

const CLAIM_VIEW = access.authorize(permissions.CLAIM_VIEW, authAffectedUsersNone);
const CLAIM_DETAILS_VIEW = access.authorize(permissions.CLAIM_DETAILS_VIEW, authAffectedUsersClaimant);
const CLAIM_CREATE = access.authorize(permissions.CLAIM_CREATE, authAffectedUsersNone);
const CLAIM_VALIDATE = access.authorize(permissions.CLAIM_VALIDATE, authAffectedUsersNone);


router.get('/', CLAIM_VIEW, controller.getAll);
router.get('/:id', CLAIM_VIEW, controller.getOne);
router.get('/:id/details', CLAIM_DETAILS_VIEW, controller.getOneDetails);
router.post('/', CLAIM_CREATE, controller.create);
router.put('/:id/validate', CLAIM_VALIDATE, controller.validatePrize);

// ================================================================
// Authentication functions

function authAffectedUsersNone(req) {
  return [];
}

function authAffectedUsersClaimant(req) {
  return models.ClaimedPrize
    .findOne({ _id: req.params.id })
    .then((claimed) => {
      if (!claimed) {
        return [];
      }
      return [claimed.claimedByUser.username];
    });
}

module.exports = router;
