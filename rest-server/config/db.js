'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require('../lib/db').initialize();

const env = require('./env');

// Initialize models.
require('../models');

function connect () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  return mongoose.connect(env.db, options).connection;
}


exports.setup = function() {
  connect()
    .on('error', console.log)
    .on('disconnected', connect)
//    .once('open', listen);
};
