'use strict';

const settings = require('../settings');
const access = require('../../controllers/access');

exports.setup = function(app, passport) {
  // Require authorization for all '/api' URIs.
  app.all('/api/*', access.findLogin(passport));




  // Public Routes
  app.use('/auth', require('./authentication'));

  // Authenticated Routes
  app.use('/api/v1/users', require('./users'));
  app.use('/api/v1/awards', require('./awards'));




  // Generic error handler
  app.use(function(err, req, res, next) {
    // treat as 404
    if (err.message
        && (~err.message.indexOf('not found')
        || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }

    console.error(err.stack);

    var status = 500;
    // Only send stacktrace back if not in production mode.
    var payload = { message: err.message };
    if (settings.envName !== 'production') {
      payload.stack = err.stack;
    }

    if (err.status) {
      status = err.status;
    } else if (err.stack.includes('ValidationError')) {
      status = 422;
    }

    if (req.accepts('json')) {
      return res.status(status).json(payload);
    }
    res.status(status).render("" + status, payload);
  });

  // Assume 404 because no route or middleware responded.
  app.use(function(req, res, next) {
    const payload = {
      url: req.originalUrl,
      error: 'Not found'
    };
    if  (req.accepts('json')) {
      return res.status(404).json(payload);
    }
    res.status(404).render('404', payload);
  });
};
