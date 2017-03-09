'use strict';

const express = require('express');
const loginController = require('../../controllers/login');
const access = require('../../controllers/access');

module.exports = function(passport) {
  const router = express.Router();

  // login requests MUST be POST requests.
  router.post('/login', loginController.login(passport));

  // Logout also requires an authenticated session
  // Additionally, these must be POST requests as well, as they
  // alter the user state.
  router.post('/logout', access.findAccount(passport), loginController.logout);

  return router;
};
