'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const roles = require('../config/access/roles');
const accountLib = require('../lib/account');
const crypto = require('crypto');
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
  var self = this;
  return fingerprint.useragent.browser.family === self.fingerprint.useragent.browser.family
      && fingerprint.useragent.browser.version === self.fingerprint.useragent.browser.version
      && fingerprint.useragent.device.family === self.fingerprint.useragent.device.family
      && fingerprint.useragent.device.version === self.fingerprint.useragent.device.version
      && fingerprint.useragent.os.family === self.fingerprint.useragent.os.family
      && fingerprint.useragent.os.major === self.fingerprint.useragent.os.major
      && fingerprint.useragent.os.minor === self.fingerprint.useragent.os.minor
      && fingerprint.acceptHeaders.accept === self.fingerprint.acceptHeaders.accept
      && fingerprint.acceptHeaders.encoding === self.fingerprint.acceptHeaders.encoding
      && fingerprint.acceptHeaders.language === self.fingerprint.acceptHeaders.language
      && fingerprint.geoip.country === self.fingerprint.geoip.country
      && fingerprint.geoip.region === self.fingerprint.geoip.region
      && fingerprint.geoip.city === self.fingerprint.geoip.city;
};


BrowserTokenSchema.methods.isActive = function() {
  var now = new Date();
  return now < this.expires;
};


BrowserTokenSchema.methods.isExpired = function() {
  var now = new Date();
  return now >= this.expires;
};


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
  browsers: [BrowserTokenSchema]
}, {
  timestamps: true
});



AuthenticationMethodSchema.methods.getAuthenticationFunctions = function() {
  return accountLib.sources[this.source];
};


// Must use a "function" here to bind the `this`.
function preSave(next) {
  if (this.isModified('userInfo')) {
    return this.getAuthenticationFunctions().onUserInfoSaved(this.userInfo)
      .then(() => {
        next();
      })
      .catch((err) => {
        next(err);
      });
  }
  return next();
}
AuthenticationMethodSchema.pre('save', preSave);

/*
 Populate the AuthenticationMethodSchema methods with the
 supported authentication method names.
 This should eventually be auto-constructed.

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
  fingerprint = normalizeFingerprint(fingerprint);
  var self = this;
  return new Promise(function(resolve, reject) {
    var ret = {
      browserIndexes: [],
      browsers: []
    };
    var amindex;
    var bindex;
    var b;
    for (bindex = 0; bindex < self.browsers.length; bindex++) {
      // Check if matching fingerprint.
      b = self.browsers[bindex];
      if ((allowExpires || b.isActive()) && b.isFingerprintMatch(fingerprint)) {
        ret.browserIndexes.push(bindex);
        ret.browsers.push(b);
      }
    }
    return resolve(ret);
  });
};


function normalizeFingerprint(fingerprint) {
  if (fingerprint.components) {
    fingerprint = fingerprint.components;
  }

  fingerprint.useragent = fingerprint.useragent || {};
  fingerprint.useragent.browser = fingerprint.useragent.browser || {};
  fingerprint.useragent.browser.family = fingerprint.useragent.browser.family || null;
  fingerprint.useragent.browser.version = fingerprint.useragent.browser.version || null;
  fingerprint.useragent.device = fingerprint.useragent.device || {};
  fingerprint.useragent.device.family = fingerprint.useragent.device.family || null;
  fingerprint.useragent.device.version = fingerprint.useragent.device.version || null;
  fingerprint.useragent.os = fingerprint.useragent.os || {};
  fingerprint.useragent.os.family = fingerprint.useragent.os.family || null;
  fingerprint.useragent.os.major = fingerprint.useragent.os.major || null;
  fingerprint.useragent.os.minor = fingerprint.useragent.os.minor || null;
  fingerprint.acceptHeaders = fingerprint.acceptHeaders || {};
  fingerprint.acceptHeaders.accept = fingerprint.acceptHeaders.accept || null;
  fingerprint.acceptHeaders.encoding = fingerprint.acceptHeaders.encoding || null;
  fingerprint.acceptHeaders.language = fingerprint.acceptHeaders.language || null;
  fingerprint.geoip = fingerprint.geoip || {};
  fingerprint.geoip.country = fingerprint.geoip.country || null;
  fingerprint.geoip.region = fingerprint.geoip.region || null;
  fingerprint.geoip.city = fingerprint.geoip.city || null;
  return fingerprint;
}


/**
 * Creates the BrowserTokenSchema object and adds it to the AuthenticationMethod.
 * Does not save the AuthenticationMethod.  The returned object is the
 * pure JSon version of the browser token object.
 */
AuthenticationMethodSchema.methods.generateBrowserEntry = function(fingerprint, expirationHours) {
  if (!expirationHours) {
    expirationHours = DEFAULT_TOKEN_EXPIRATION_HOURS;
  }
  fingerprint = normalizeFingerprint(fingerprint);

  // Generate a cryptographically secure random string as the token.
  var self = this;
  var expires = new Date();
  expires.setTime(expires.getTime() + (expirationHours * 3600000));
  return new Promise(function(resolve, reject) {
    // "66" means that there isn't the extra "=" at the end of the
    // base64 encoding.
    crypto.randomBytes(66, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      var browser = {
        token: buffer.toString('base64'),
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
      self.browsers.push(browser);
      resolve(browser);
    });
  });
};



const AccountSchema = new Schema({
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
    },

    accountEmail: {
      type: String
    },


    // Password reset notices
    resetAuthenticationToken: {
      type: String
    },
    resetAuthenticationExpires: {
      type: Date
    }
  }, {
    timestamps: true
  });


function fingerprintCondition(fingerprint) {
  fingerprint = normalizeFingerprint(fingerprint);
  return {
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
    'authentications.browsers.fingerprint.geoip.city': fingerprint.geoip.city
  };
}


AccountSchema.statics.findByBrowser = function(token, fingerprint) {
  var condition = fingerprintCondition(fingerprint);
  condition['authentications.browsers.token'] = token;
  condition['authentications.browsers.expires'] = {
    $gt: new Date()
  };
  return this.findOne(condition);
};


AccountSchema.statics.findByUserRef = function(username) {
  if (username.username) {
    username = username.username;
  }
  return this.findOne({ userRef: username });
};


AccountSchema.statics.findByUserResetAuthenticationToken = function(username, resetAuthenticationToken) {
  return this.findOne({
    userRef: username,
    resetAuthenticationToken: resetAuthenticationToken,
    resetAuthenticationExpires: { $lt: new Date() }
  });
};


/**
 * Returns a promise that contains the AuthenticationMethodSchema object
 * with the given name, or null if not found.
 */
AccountSchema.methods.getAuthenticationNamed = function(authName) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (!accountLib.sourceNames.includes(authName)) {
      return reject(new Error('Unknown authorization source ' + authName));
    }
    for (var i = 0; i < self.authentications.length; i++) {
      if (self.authentications[i].source === authName) {
        return resolve(self.authentications[i]);
      }
    }
    return resolve(null);
  });
};


AccountSchema.methods.resetAuthentication = function(expirationHours) {
  if (!expirationHours) {
    expirationHours = DEFAULT_TOKEN_EXPIRATION_HOURS;
  }
  var self = this;
  var expires = new Date();
  expires.setTime(expires.getTime() + (expirationHours * 3600000));

  return new Promise(function(resolve, reject) {
    crypto.randomBytes(64, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      self.resetAuthenticationToken = buffer.toString('base64');
      self.resetAuthenticationExpires = expires;
      return resolve(self.save());
    });
  })
  .then(() => {
    return {
      resetAuthenticationToken: self.resetAuthenticationToken,
      resetAuthenticationExpires: self.resetAuthenticationExpires
    };
  });
};




module.exports = mongoose.model('Account', AccountSchema);
