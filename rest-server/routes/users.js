'use strict';

const express = require('express');
const router = express.Router();
const access = require('../lib/access');
const permissions = access.permissions;

const USER_BRIEF_VIEW = access.withPermission(permissions.USER_BRIEF_VIEW, auth_affected_users_none);

const userApi = require('../lib/model').User;

// Get all users
router.get('/', USER_BRIEF_VIEW, function(req, res) {
  res.status(200).json({ Users: [] })
});




function auth_affected_users_none() {
  return [];
}

module.exports = router;
