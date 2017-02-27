'use strict';

const bodyParser = require('body-parser');
const logger = require('morgan');
const compression = require('compression');
const cors = require('cors');
const csrf = require('csurf');
const settings = require('./settings');

exports.setup = function(app, passport) {
  // Compression middleware (should be placed before express.static)
  app.use(compression({
      threshold: 512
  }));

  app.use(cors());

  app.use(logger('dev'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());


  // use passport session
  app.use(passport.initialize());
  app.use(passport.session());

  if (settings.envName !== 'test') {
    // csrf requires sessions and cookies, which we're not
    // in any position to use.
    // app.use(csrf());

    // app.use(function (req, res, next) {
    //   res.locals.csrf_token = req.csrfToken();
    //   next();
    // });
  }

  app.set('port', settings.port);
};
