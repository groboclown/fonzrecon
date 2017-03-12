'use strict';

const express = require('express');
const loginController = require('../../controllers/login');
const access = require('../../controllers/access');

module.exports = function(passport) {
  const router = express.Router();

  // Login requests MUST be POST requests.
  router.post('/login', loginController.login(passport));

  // Logout also requires an authenticated session
  // Additionally, these must be POST requests as well, as they
  // alter the user state.
  router.post('/logout', access.findAccount(passport), loginController.logout);

  router.put('/validate', loginController.validate);
  router.put('/password-change', loginController.requestPasswordChange);

  return router;
};
