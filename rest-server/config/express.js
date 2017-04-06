'use strict';

const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const csrf = require('csurf');
const validator = require('express-validator');
const cookieParser = require('cookie-parser');
const fingerprint = require('express-fingerprint');
const helmet = require('helmet');
const settings = require('./settings');
const env = require('./env');
const fileUpload = require('express-fileupload');

exports.setup = function(app, passport) {

  // Compression middleware (should be placed before express.static)
  app.use(compression({
      threshold: 512
    }));

  app.use(fingerprint());
  app.use(cors());
  app.use(helmet());

  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(fileUpload());

  app.use(validator({
    customValidators: {
      isArrayOfString: function(param, minCount) {
        if (!Array.isArray(param)) {
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
      }
    }
  }));

  // Use passport session
  app.use(passport.initialize());

  env.setupLogger(app);

  app.set('port', settings.port);
};
