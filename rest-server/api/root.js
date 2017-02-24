'use strict';

const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
  res.status(404);
  res.send({ErrorMessage: ''});
});

module.exports = router;
