'use strict';

const app = require('../app');
const log = require('./log');
const http = require('http');
const https = require('https');
const settings = require('./settings');

const port = settings.port;

exports.createServer = function(app) {
  /**
   * Create HTTP server.
   */
  var server;
  var ssl = settings.ssl;
  if (! ssl) {
    console.log(`HTTP Listening on port ${port}`);
    server = http.createServer(app);
  } else {
    console.log(`HTTPS Listening on port ${port}`);
    server = https.createServer({
      key: fs.readFileSync(ssl.key),
      cert: fs.readFileSync(ssl.cert),
    }, app);
  }
  server.on('error', onError);
  server.on('listening', onListening);

  /**
   * Event listener for HTTP server "error" event.
   */
  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string' ? ('Pipe ' + port) : ('Port ' + port);

    // Handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES': {
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      }
      case 'EADDRINUSE': {
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      }
      default: {
        throw error;
      }
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */
  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? ('pipe ' + addr) : ('port ' + addr.port);
    log('Listening on ' + bind);
  }

  return server;
};
