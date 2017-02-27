'use strict';

const express = require('express');
const router = express.Router();
const access = require('../controllers/access');
const permissions = require('../config/access/permissions');
const controller = require('../controllers/user');
const paging = require('./util').paging.extract;

const USER_BRIEF_VIEW = access.authorize(permissions.USER_BRIEF_VIEW, auth_affected_users_none);
const USER_DETAILS_VIEW = access.authorize(permissions.USER_DETAILS_VIEW, auth_affected_users_id);


// Get all users
// brief view should either be all or nothing; we don't collect
// affected users into the list.
router.get('/', USER_BRIEF_VIEW, function(req, res, next) {
  var pagination = paging(req, { page: 1, limit: 100 });
  var userLike = req.query.like || req.body.like || '.*';
  controller.listBrief(userLike, pagination)
    .then(function(users) {
      users.type = 'User';
      res.status(200).json(users);
    })
    .catch(function(err) {
      next(err);
    });
});

router.get('/:id', USER_BRIEF_VIEW, function(req, res, next) {
  controller.findByIdBrief(req.id)
    .then(function(user) {
      if (!user) {
        // 404
        var err = new Error('Resource not found');
        err.status = 404;
        return next(err);
      }
      res.status(200).json({ User: user });
    })
    .catch(function(err) {
      next(err);
    });
});

router.get('/details/:id', USER_DETAILS_VIEW, function(req, res, next) {
  controller.findByIdDetailsReadOnly(req.id)
    .then(function(user) {
      if (!user) {
        // 404
        var err = new Error('Resource not found');
        err.status = 404;
        return next(err);
      }
      res.status(200).json({ User: user });
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
