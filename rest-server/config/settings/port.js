'use strict';

module.exports = function() {
  return normalizePort(
    process.env.PORT ||
    process.env['fonzrecon_config_port'] || '3000');
};



/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // Use a named pipe
    return val;
  }

  if (port >= 0) {
    // Use a port number
    return port;
  }

  return false;
}
