'use strict';

const mongoose = require('mongoose');
const settings = require('./settings');

// Initialize models.
require('../models');

function connect () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  return mongoose.connect(settings.db, options).connection;
}


exports.setup = function() {
  /* When proper DB is wired up, use this
  connect()
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen);
  */
};
