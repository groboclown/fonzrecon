'use strict';

exports.setupApp = function(app) {
  require('./passport_setup')(app);
  app.use(function(req, res, next) {
    // Restrict to CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Access-Control-Allow-Credentials');
    if (req.method === 'OPTIONS') {
      res.status(200).end();
    } else {
      next();
    }
  });
};

/**
 * User roles, and what permissions they have.
 */
exports.roles = require('./roles');

/**
 * Permissions that different URLs have.
 */
exports.permissions = require('./permissions');

/**
 * Middleware.
 * For marking parts of URL tree as requiring authentication.
 */
exports.authenticate = require('./authenticate');

/**
 * Middleware:
 * Restrict a request to be with a user with specific access.
 */
exports.withPermission = require('./with_permission');
