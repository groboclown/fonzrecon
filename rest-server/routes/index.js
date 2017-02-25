'use strict';

const express = require('express');
const router = express.Router();

// Public Routes
router.post('/login', require('./login'));

// Authenticated Routes
router.use('/api/v1/users', require('./users'));
router.use('/api/v1/awards', require('./awards'));


module.exports = router;
