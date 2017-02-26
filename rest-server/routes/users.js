'use strict';

const express = require('express');
const router = express.Router();
const access = require('../lib/access');
const permissions = access.permissions;

const USER_BRIEF_VIEW = access.withPermission(permissions.USER_BRIEF_VIEW, auth_affected_users_none);

const userApi = require('../lib/model').User;

// Get all users
// brief view should either be all or nothing; we don't collect
// affected users into the list.
router.get('/', USER_BRIEF_VIEW, function(req, res) {
  res.status(200).json({ Users: [] })
});



function userBriefView(user) {
  if (! user) {
    return null;
  }
  return {
    'username': user.username,
    'names': user.names,
    'organization': user.organization
  }
}

function userDetail(user) {

}

// ================================================================
// Authentication functions

function auth_affected_users_id(req) {

}

function auth_affected_users_none(req) {
  return [];
}

module.exports = router;
