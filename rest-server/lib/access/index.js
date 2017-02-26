'use strict';

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
exports.findLogin = require('./find_login');

/**
 * Middleware:
 * Restrict a request to be with a user with specific access.
 */
exports.withPermission = require('./with_permission');
