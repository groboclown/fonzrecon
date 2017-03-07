'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const roles = require('../config/access/roles');
const accountLib = require('../lib/account');
const uuid = require('uuid');
const TOKEN_EXPIRATION_DAYS = 30;

// =====================================
// Schema Definition


const BrowserToken = new Schema({
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
  browsers: [BrowserToken],

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
  console.log('Setting authentication method ' + accountLib.sourceMethodNames[k]);
  AuthenticationMethodSchema.methods[accountLib.sourceMethodNames[k]] =
    genAccountLibMethod(accountLib.sourceMethodNames[k]);
}
*/
AuthenticationMethodSchema.methods.onLogin = function(reqAuthData) {
  return this.getAuthenticationFunctions().onLogin(this.userInfo, reqAuthData);
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


AccountSchema.statics.generateUniqueBrowserToken = function(fingerprint) {
  // uuid SHOULD be unique, but let's be really, really sure.
  var schm = this;
  var genid = uuid();
  return this.findOne({ 'authentications.browsers.token': genid })
    .then(function(acct) {
      if (! accnt) {
        var expires = new Date();
        expires.setTime( date.getTime() + TOKEN_EXPIRATION_DAYS * 86400000 );
        return {
          token: genid,
          expires: expires,
          fingerprint: fingerprint
        };
      } else {
        return schm.generateUniqueBrowserToken(fingerprint);
      }
    });
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
      // console.log("Checking authentication `" + acct.authentications[i].source + "'");
      if (acct.authentications[i].source === authName) {
        return resolve(acct.authentications[i]);
      }
    }
    return resolve(null);
  });
};



module.exports = mongoose.model('Account', AccountSchema);
