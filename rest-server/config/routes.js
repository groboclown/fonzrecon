'use strict';

const settings = require('./settings');
const access = require('../controllers/access');

exports.setup = function(app, passport) {
  const pauth = passport.authenticate.bind(passport);

  // Require authorization for all '/api' URIs.
  app.all('/api/*', access.findLogin());

  // Route Definitions
  app.use('/', require('../routes'))

  // Generic error handler
  app.use(function(err, req, res, next) {
    // treat as 404
    if (err.message
        && (~err.message.indexOf('not found')
        || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }

    console.error(err.stack);

    if (err.stack.includes('ValidationError')) {
      res.status(422).render('422', { error: err.stack });
      return;
    }

    // Only send stacktrace back if not in production mode.
    var payload = { message: err.message };
    if (settings.envName !== 'production') {
      payload.stack = err.stack;
    }
    if  (req.accepts('json')) {
      return res.status(500).json(payload);
    }
    res.status(500).render('500', payload);
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
