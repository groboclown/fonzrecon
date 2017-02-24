'use strict';

const express = require('express');
const routes = require('./api/routes');

var app = express();

for (var key in routes) {
  if (routes.hasOwnProperty(key)) {
    app.use(key, routes[key]);
  }
}

// Generic error handlers
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Development error handler
// - Will print stacktrace.
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log('[' + req.method + ' ' + req.originalUrl + '] ' +
      err + '\n' + err.stack);
    res.send({ErrorMessage: err.message, ErrorStack: err.stack});
  });
} else {
  // Production error handler
  // - No stacktraces leaked to user
  app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.send({ErrorMessage: err.message});
  });
}


module.exports = app;
