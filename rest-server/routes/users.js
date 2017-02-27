'use strict';

const express = require('express');
const router = express.Router();
const access = require('../controllers/access');
const permissions = require('../config/access/permissions');
const controller = require('../controllers/user');
const paging = require('./util').paging.extract;

const USER_BRIEF_VIEW = access.authorize(permissions.USER_BRIEF_VIEW, auth_affected_users_none);


// Get all users
// brief view should either be all or nothing; we don't collect
// affected users into the list.
router.get('/', USER_BRIEF_VIEW, function(req, res, next) {
  var pagination = paging(req, { page: 1, limit: 100 });
  var userLike = req.query.like || req.body.like || null;
  controller.listBrief(userLike, pagination)
    .then(function(users) {
      res.status(200).json({ Users: users });
    })
    .catch(function(err) {
      next(err);
    });
});



// ================================================================
// Authentication functions

function auth_affected_users_id(req) {
  if (req.id) {
    return [ req.id ];
  } else {
    return [];
  }
}

function auth_affected_users_none(req) {
  return [];
}

module.exports = router;
