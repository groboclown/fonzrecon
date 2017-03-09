'use strict';

const bodyParser = require('body-parser');
const logger = require('morgan');
const compression = require('compression');
const cors = require('cors');
const csrf = require('csurf');
const validator = require('express-validator');
const cookieParser = require('cookie-parser');
const fingerprint = require('express-fingerprint');
const settings = require('./settings');

exports.setup = function(app, passport) {
  // Compression middleware (should be placed before express.static)
  app.use(compression({
      threshold: 512
  }));

  app.use(cors());
  app.use(fingerprint());

  app.use(logger('dev'));
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(validator({
    customValidators: {
      isArrayOfString: function(param, minCount) {
        if (! Array.isArray(param)) {
          return false;
        }
        if (param.length < minCount) {
          return false;
        }
        for (var i = 0; i < param.length; i++) {
          if (typeof(param[i]) !== 'string') {
            return false;
          }
        }
        return true;
      },
    },
  }));


  // use passport session
  app.use(passport.initialize());

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
