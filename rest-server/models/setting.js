'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// =====================================
// Schema Definition


const SettingSchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});



SettingSchema.statics._forKey = function(key) {
  return this.findOne({ key: key });
};

SettingSchema.statics._setKey = function(key, description, value) {
  return this._forKey(key)
    .then(function(val) {
      if (val) {
        val.value = value;
        return val.save();
      } else {
        return new module.exports({
          key: key,
          description: description,
          value: value
        }).save();
      }
    });
};

function verifyIsBoolean(val) {
  if (val !== true && val !== false) {
    throw new Error('ValidationError');
  }
  return val;
}

function toBoolean(val, defaultVal) {
  if (val && (val.value === true || val.value === false)) {
    return val.value;
  }
  return defaultVal;
}

function verifyIsArray(val) {
  if (! val || ! Array.isArray(val)) {
    throw new Error('ValidationError');
  }
  return val;
}

function verifyIsString(val) {
  if (! val || typeof(val) !== 'string') {
    throw new Error('ValidationError');
  }
  return val;
}

// Well defined keys

/*
const CREATE_USER_ON_REFERENCE = 'CreateUserOnReference';
const DEFAULT_CREATE_USER_ON_REFERENCE = false;
SettingSchema.statics.setCreateUserOnReference = function(bol) {
  verifyIsBoolean(bol);
  return this._setKey(
    CREATE_USER_ON_REFERENCE,
    'When true, the user will be created if acknowledged if it does not exist.',
    bol);
}
SettingSchema.statics.getCreateUserOnReference = function() {
  return this._forKey(CREATE_USER_ON_REFERENCE).lean()
    .then(function(val) {
      return toBoolean(val, DEFAULT_CREATE_USER_ON_REFERENCE);
    });
}
*/

const ADMIN_ACTION_NOTIFIACTION_EMAILS = 'AdminActionNotificationEmails';
SettingSchema.statics.setAdminActionNotificationEmails = function(emails) {
  verifyIsArray(emails);
  return this._setKey(
    ADMIN_ACTION_NOTIFIACTION_EMAILS,
    'Who to send emails to when an administration action occurs',
    emails
  );
};
SettingSchema.statics.getAdminActionNotificationEmails = function() {
  return this._forKey(ADMIN_ACTION_NOTIFIACTION_EMAILS).lean()
    .then(function(val) {
      if (!val) {
        return [];
      }
      return val.value;
    });
};

const EMAIL_THEME = 'EmailTheme';
const DEFAULT_EMAIL_THEME = 'light';
SettingSchema.statics.setEmailTheme = function(theme) {
  verifyIsString(theme);
  return this._setKey(
    EMAIL_THEME,
    'directory under templates/email to use for formatted emails',
    theme
  );
};
SettingSchema.statics.getEmailTheme = function() {
  return this._forKey(EMAIL_THEME).lean()
    .then(function(val) {
      if (!val) {
        return DEFAULT_EMAIL_THEME;
      }
      return val.value;
    });
};


const SITE_FROM_EMAIL = 'SiteFromEmail';
const DEFAULT_SITE_FROM_EMAIL = 'no-reply@site.fonzrecon';
SettingSchema.statics.setSiteFromEmail = function(email) {
  verifyIsString(email);
  return this._setKey(
    SITE_FROM_EMAIL,
    'the `from` line in the emails sent from the site',
    email
  );
};
SettingSchema.statics.getSiteFromEmail = function() {
  return this._forKey(SITE_NAME).lean()
    .then(function(val) {
      if (! val) {
        return DEFAULT_SITE_FROM_EMAIL;
      }
      return val.value;
    });
};


const SITE_NAME = 'SiteName';
const DEFAULT_SITE_NAME = 'FonzRecon For You';
SettingSchema.statics.setSiteName = function(name) {
  verifyIsString(name);
  return this._setKey(
    SITE_NAME,
    'how the site self identifies',
    name
  );
};
SettingSchema.statics.getSiteName = function() {
  return this._forKey(SITE_NAME).lean()
    .then(function(val) {
      if (! val) {
        return DEFAULT_SITE_NAME;
      }
      return val.value;
    });
};


const SITE_URL = 'SiteUrl';
const DEFAULT_SITE_URL = 'http://localhost';
SettingSchema.statics.setSiteUrl = function(url) {
  verifyIsString(url);
  return this._setKey(
    SITE_NAME,
    'root url of the site',
    url
  )
};
SettingSchema.statics.getSiteUrl = function() {
  return this._forKey(SITE_URL).lean()
    .then(function(val) {
      if (!val) {
        return DEFAULT_SITE_URL;
      }
      return val.value;
    });
};




/**
 * Fills the object's entries with values.  If the key in the
 * object is a setting, then it will be populated with the
 * db value.  The original object will be altered.
 */
SettingSchema.statics.fillSettings = function(baseObj) {
  // TODO optimize the call by limiting the keys to what's in the
  // base object.
  return this.find().lean()
    .then(function(settings) {
      for (let i = 0; i < settings.length; i++) {
        if (!! baseObj[settings[i].key] && typeof(settings[i]) !== 'undefined') {
          baseObj[settings[i].key] = settings[i].value;
        }
      }
      return baseObj;
    });
};


/**
 * Retrieve a single object with all the settings used by email.
 */
const PUBLIC_EMAIL_SETTINGS_DEFAULTS = {
  EMAIL_THEME: DEFAULT_EMAIL_THEME,
  SITE_FROM_EMAIL: DEFAULT_SITE_FROM_EMAIL,
  SITE_NAME: DEFAULT_SITE_NAME,
  SITE_URL: DEFAULT_SITE_URL,
};
const PRIVATE_EMAIL_SETTINGS_DEFAULTS = {
  ADMIN_ACTION_NOTIFIACTION_EMAILS: null,
};
SettingSchema.statics.getEmailSettings = function() {
  // Shallow clone of the dictionaries above.
  var publicSettings = Object.assign({}, PUBLIC_EMAIL_SETTINGS_DEFAULTS);
  var privateSettings = Object.assign({}, PRIVATE_EMAIL_SETTINGS_DEFAULTS);
  return Promise
    .all([this.fillSettings(publicSettings), this.fillSettings(privateSettings)])
    .then(function(args) {
      return { public: args[0], private: args[1] };
    });
};



module.exports = mongoose.model('Setting', SettingSchema);
