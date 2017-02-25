'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const logger = require('morgan');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(require('./lib/passport').setup(passport));

app.all('/*', function(req, res, next) {
  // Restrict to CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

// Require authorization for all '/api' URIs.
app.all('/api/*', [
  require('./lib/passport').authenticate(passport)
]);

// Route Definition
app.use('/', require('./routes'))

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
    res.status(err.status || 500);
    res.send({ErrorMessage: err.message});
  });
}


module.exports = app;
