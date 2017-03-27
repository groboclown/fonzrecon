'use strict';

const express = require('express');
const loginController = require('../../controllers/login');
const publicController = require('../../controllers/public');
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

  // Other general public API actions.  They're just crammed in here because
  // it's the place for public stuff.
  router.get('/site-settings', publicController.siteSettings);

  return router;
};
