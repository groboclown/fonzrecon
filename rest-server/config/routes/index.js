'use strict';

const settings = require('../settings');
const env = require('../env');
const access = require('../../controllers/access');
const express = require('express');

exports.setup = function(app, passport) {

  // Serve static files that were uploaded
  app.use('/static/uploads', express.static(env.staticFiles));

  // Require authorization for all '/api' URIs.
  app.all('/api/*', access.findAccount(passport));

  // Public Routes

  // Authentication route is setup a bit differently, because
  // of its tight integration with passport.
  app.use('/auth', require('./authentication')(passport));

  // Authenticated Routes
  app.use('/api/v1/users', require('./user'));
  app.use('/api/v1/aaays', require('./acknowledgement'));
  app.use('/api/v1/prizes', require('./prize'));
  app.use('/api/v1/claimed-prizes', require('./claimed-prize'));
  app.use('/api/v1/settings', require('./setting'));
  app.use('/api/v1/images', require('./image'));

  // Generic error handler
  app.use((err, req, res, next) => {
    if (!err) {
      err = new Error('Unknown error');
    }

    // Custom handling of the multipart file upload error messages
    if (err.message && err.message.indexOf('Multipart: ') >= 0) {
      err.status = 400;
      err.details = [ { error: 'File upload failed', details: err.message } ];
    }

    // Treat as 404
    if (err.message
        && (~err.message.indexOf('not found')
        || (~err.message.indexOf('Cast to ObjectId failed')))
        && (!err.details)) {
      return next();
    }

    env.logError(err);

    var status = 500;
    // Only send stacktrace back if not in production mode.
    var payload = { message: err.message };
    if (typeof(err) === 'string') {
      payload.message = err;
    }
    // TODO use env instead of envName
    if (settings.envName === 'production') {
      payload.stack = null;
    } else {
      payload.stack = err.stack;
    }
    if (err.details) {
      payload.details = err.details;
    }

    if (err.status) {
      status = err.status;
    } else if (!!err.stack && err.stack.includes('ValidationError')) {
      status = 422;
    }

    if (req.accepts('json')) {
      return res.status(status).json(payload);
    }
    res.status(status).render('' + status, payload);
  });

  // Assume 404 because no route or middleware responded.
  app.use((req, res, next) => {
    const payload = {
      url: req.originalUrl,
      error: 'Not found'
    };
    if (req.accepts('json')) {
      return res.status(404).json(payload);
    }
    res.status(404).render('404', payload);
  });
};
