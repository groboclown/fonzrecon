'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const roles = require('../config/access/roles');
const accountLib = require('../lib/account');
const uuid = require('uuid');
const DEFAULT_TOKEN_EXPIRATION_HOURS = 30 * 24;

// =====================================
// Schema Definition


const BrowserTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  expires: {
    type: Date,
    required: true
  },

  // See express-fingerprint
  fingerprint: {
    useragent: {
      browser: {
        family: String,
        version: String
      },
      device: {
        family: String,
        version: String
      },
      os: {
        family: String,
        major: String,
        minor: String
      }
    },
    acceptHeaders: {
      accept: String,
      encoding: String,
      language: String
    },
    geoip: {
      country: String,
      region: String,
      city: String
    }
  }
}, {
  timestamps: true
});


BrowserTokenSchema.methods.isFingerprintMatch = function(fingerprint) {
  var b = this;
  return fingerprint.useragent.browser.family === b.fingerprint.useragent.browser.family
      && fingerprint.useragent.browser.version === b.fingerprint.useragent.browser.version
      && fingerprint.useragent.device.family === b.fingerprint.useragent.device.family
      && fingerprint.useragent.device.version === b.fingerprint.useragent.device.version
      && fingerprint.useragent.os.family === b.fingerprint.useragent.os.family
      && fingerprint.useragent.os.major === b.fingerprint.useragent.os.major
      && fingerprint.useragent.os.minor === b.fingerprint.useragent.os.minor
      && fingerprint.acceptHeaders.accept === b.fingerprint.acceptHeaders.accept
      && fingerprint.acceptHeaders.encoding === b.fingerprint.acceptHeaders.encoding
      && fingerprint.acceptHeaders.language === b.fingerprint.acceptHeaders.language
      && fingerprint.geoip.country === b.fingerprint.geoip.country
      && fingerprint.geoip.region === b.fingerprint.geoip.region
      && fingerprint.geoip.city === b.fingerprint.geoip.city;
}


BrowserTokenSchema.methods.isActive = function() {
  var now = new Date();
  return now < this.expires;
};


BrowserTokenSchema.methods.isExpired = function() {
  var now = new Date();
  return now >= this.expires;
}


// Keeps track of one kind of authentication
// method, such as a local login, or twitter,
// etc.
const AuthenticationMethodSchema = new Schema({
  // The kind of authentication.
  source: {
    type: String,
    enum: accountLib.sourceNames,
    required: true
  },

  // Primary Identifier used by the method.  The
  // meaning is specific to the authentication method.
  id: {
    type: String,
    required: true
  },

  // Additional account information.  This is
  // schema-specific in regards to the order and
  // meaning.  It can be a user token, hashed password,
  // and so on.
  userInfo: [String],

  // Token assigned to the user's "browser".
  browsers: [BrowserTokenSchema],

  // Password reset notices
  resetAuthenticationToken: {
    type: String
  },
  resetAuthenticationExpires: {
    type: Date
  },
}, {
  timestamps: true
});



AuthenticationMethodSchema.methods.getAuthenticationFunctions = function() {
  return accountLib.sources[this.source];
};


AuthenticationMethodSchema.pre('save', function(next) {
  const am = this;
  if  (am.isModified('userInfo')) {
    return am.getAuthenticationFunctions().onUserInfoSaved(am.userInfo)
      .then(function() {
        next();
      })
      .catch(function(err) {
        next(err);
      });
  }
  return next();
});

// Populate the AuthenticationMethodSchema methods with the
// supported authentication method names.
// This should eventually be auto-constructed.
/*
function genAccountLibMethod(name) {
  return function() {
    return this.getAuthenticationFunctions()[name]
      .apply(this, this.userInfo, Array.prototype.slice.call(arguments, 1));
  };
}
for (var k = 0; k < accountLib.sourceMethodNames.length; k++) {
  AuthenticationMethodSchema.methods[accountLib.sourceMethodNames[k]] =
    genAccountLibMethod(accountLib.sourceMethodNames[k]);
}
*/
AuthenticationMethodSchema.methods.onLogin = function(reqAuthData) {
  return this.getAuthenticationFunctions().onLogin(this.userInfo, reqAuthData);
};



AuthenticationMethodSchema.methods.findBrowsersForFingerprint = function(fingerprint, allowExpires) {
  var auth = this;
  return new Promise(function(resolve, reject) {
    var ret = {
      browserIndexes: [],
      browsers: []
    };
    var amindex;
    var bindex;
    var b;
    for (bindex = 0; bindex < auth.browsers.length; bindex++) {
      // Check if matching fingerprint.
      b = auth.browsers[bindex];
      if ((allowExpires || b.isActive()) && b.isFingerprintMatch(fingerprint)) {
        ret.browserIndexes.push(bindex);
        ret.browsers.push(b);
      }
    }
    return resolve(ret);
  });
};


/**
 * Creates the BrowserTokenSchema object and adds it to the AuthenticationMethod.
 * Does not save the AuthenticationMethod.  The returned object is the
 * pure JSon version of the browser token object.
 */
AuthenticationMethodSchema.statics.generateBrowserEntry = function(fingerprint, expirationHours) {
  if (! expirationHours) {
    expirationHours = DEFAULT_TOKEN_EXPIRATION_HOURS;
  }

  // uuid SHOULD be unique, but let's be really, really sure.
  var schm = this;
  var genid = uuid();
  return this.findOne({ 'authentications.browsers.token': genid })
    .then(function(acct) {
      if (! accnt) {
        var expires = new Date();
        expires.setTime(date.getTime() + (expirationHours * 3600000));
        var browser = {
          token: genid,
          expires: expires,
          // Ensure correct ordering
          fingerprint: {
            useragent: {
              browser: {
                family: fingerprint.useragent.browser.family,
                version: fingerprint.useragent.browser.version
              },
              device: {
                family: fingerprint.useragent.device.family,
                version: fingerprint.useragent.device.version
              },
              os: {
                family: fingerprint.useragent.os.family,
                major: fingerprint.useragent.os.major,
                minor: fingerprint.useragent.os.minor
              }
            },
            acceptHeaders: {
              accept: fingerprint.acceptHeaders.accept,
              encoding: fingerprint.acceptHeaders.encoding,
              language: fingerprint.acceptHeaders.language
            },
            geoip: {
              country: fingerprint.geoip.country,
              region: fingerprint.geoip.region,
              city: fingerprint.geoip.city
            }
          }
        };
        this.browsers.push(browser);
        return browser;
      } else {
        return schm.generateUniqueBrowserToken(fingerprint);
      }
    });
};




const AccountSchema = new Schema({
  // identifier
  id: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },

  // Authentication types allowed for this account.
  authentications: [AuthenticationMethodSchema],

  // Access Role.  What the user is allowed to do.
  role: {
    type: String,
    enum: roles.names,
    default: roles.USER.name
  },

  // Reference to the linked user account details
  // Some accounts do not have a user account, so this is
  // not required.
  // Note that this is not a 'ref' self-populating object.
  // Probably would make some parts of the code cleaner if
  // this was kept as a populating object, though.
  userRef: {
    type: String
  }
}, {
  timestamps: true
});


AccountSchema.statics.findByBrowser = function(token, fingerprint) {
  return this.findOne({
    'authentications.browsers.token': token,
    'authentications.browsers.expires': {
      $lt: new Date()
    },
    'authentications.browsers.fingerprint.useragent.browser.family': fingerprint.useragent.browser.family,
    'authentications.browsers.fingerprint.useragent.browser.version': fingerprint.useragent.browser.version,
    'authentications.browsers.fingerprint.useragent.device.family': fingerprint.useragent.device.family,
    'authentications.browsers.fingerprint.useragent.device.version': fingerprint.useragent.device.version,
    'authentications.browsers.fingerprint.useragent.os.family': fingerprint.useragent.os.family,
    'authentications.browsers.fingerprint.useragent.os.major': fingerprint.useragent.os.major,
    'authentications.browsers.fingerprint.useragent.os.minor': fingerprint.useragent.os.minor,
    'authentications.browsers.fingerprint.acceptHeaders.accept': fingerprint.acceptHeaders.accept,
    'authentications.browsers.fingerprint.acceptHeaders.encoding': fingerprint.acceptHeaders.encoding,
    'authentications.browsers.fingerprint.acceptHeaders.language': fingerprint.acceptHeaders.language,
    'authentications.browsers.fingerprint.geoip.country': fingerprint.geoip.country,
    'authentications.browsers.fingerprint.geoip.region': fingerprint.geoip.region,
    'authentications.browsers.fingerprint.geoip.city': fingerprint.geoip.city,
  });
};


AccountSchema.statics.findByUserRef = function(username) {
  if (username.username) {
    username = username.username;
  }
  return this.findOne({ userRef: username });
};



/**
 * Returns a promise that contains the AuthenticationMethodSchema object
 * with the given name, or null if not found.
 */
AccountSchema.methods.getAuthenticationNamed = function(authName) {
  var acct = this;
  return new Promise(function(resolve, reject) {
    if (! accountLib.sourceNames.includes(authName)) {
      return reject(new Error('Unknown authorization source ' + authName));
    }
    for (var i = 0; i < acct.authentications.length; i++) {
      if (acct.authentications[i].source === authName) {
        return resolve(acct.authentications[i]);
      }
    }
    return resolve(null);
  });
};


module.exports = mongoose.model('Account', AccountSchema);
