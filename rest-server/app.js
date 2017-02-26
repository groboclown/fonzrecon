'use strict';

const express = require('express');
const passport = require('passport');
const config = require('./config');


const access = require('./lib/access');

var app = express();
config.db.setup();
config.passport.setup(passport);
config.express.setup(app, passport);
config.routes.setup(app, passport);

module.exports = app;
