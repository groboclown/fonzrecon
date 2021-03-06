'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validate = require('../lib/validate');
const contact = require('../config/contact');

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
  },
  valueType: {
    type: String,
    enum: ['string', 'int', 'email', 'url',
      'string?', 'int?', 'email?', 'url?',
      'string[]', 'int[]', 'email[]', 'url[]',
      'dictionary'],
    default: 'string'
  }
}, {
  timestamps: true
});



SettingSchema.statics._forKey = function(key) {
  return this.findOne({ key: key });
};

SettingSchema.statics._setKey = function(key, description, valueType, value) {
  return this._forKey(key)
    .then((val) => {
      if (val) {
        val.value = value;
        return val.save();
      }
      return new module.exports({
          key: key,
          description: description,
          valueType: valueType,
          value: value
        }).save();
    });
};


// =========================================================================
// Well defined keys


const ALL_SETTINGS = {
  AdminActionNotificationEmails: {
    description: 'Who to send emails to when an administration action occurs (list of emails)',
    defaultValue: [],
    valueType: 'url[]',
    validator: [ validate.isArrayOf, validate.isEmailAddress, 1 ],
    templateAccess: 'private',
    publicAccess: false
  },
  SiteUrl: {
    description: 'Root url of the site',
    defaultValue: 'http://localhost',
    valueType: 'url',
    validator: validate.isURL,
    templateAccess: 'public',
    publicAccess: true
  },
  EmailTheme: {
    description: 'Directory under templates/email to use for formatted emails',
    defaultValue: 'light',
    valueType: 'string',
    validator: [ validate.isString, 1 ],
    templateAccess: 'public',
    publicAccess: false
  },
  SiteFromEmail: {
    description: 'The `from` line in the emails sent from the site',
    defaultValue: 'no-reply@site.fonzrecon',
    valueType: 'email',
    validator: validate.isEmailAddress,
    templateAccess: 'public',
    publicAccess: false
  },
  SitePublicAdminEmail: {
    description: 'The help user, published in emails and on the site',
    defaultValue: 'admin@site.fonzrecon',
    valueType: 'email',
    validator: validate.isEmailAddress,
    templateAccess: 'public',
    publicAccess: true
  },
  SiteName: {
    description: 'How the site self identifies',
    defaultValue: 'FonzRecon For You',
    valueType: 'string',
    validator: [ validate.isString, 1 ],
    templateAccess: 'public',
    publicAccess: true
  },
  SiteBannerImage: {
    description: 'URI for the site`s banner image',
    defaultValue: null,
    valueType: 'url?',
    validator: [ validate.isNullOrUri ],
    templateAccess: 'public',
    publicAccess: true
  },
  SiteSmallImage: {
    description: 'URI for the site`s standard image; about 128x128',
    defaultValue: null,
    valueType: 'url?',
    validator: [ validate.isNullOrUri ],
    templateAccess: 'public',
    publicAccess: true
  },
  SiteIconImage: {
    description: 'URI for the site`s icon (should be ~64x64)',
    defaultValue: null,
    valueType: 'url?',
    validator: [ validate.isNullOrUri ],
    templateAccess: 'public',
    publicAccess: true
  },
  EmailProvider: {
    description: 'How to send emails, one of ' + contact.emailProviders,
    defaultValue: contact.emailProviders[0],
    valueType: 'string',
    validator: [ validate.isInSet, contact.emailProviders ],
    templateAccess: 'private',
    publicAccess: false
  },
  EmailProviderConnection: {
    description: 'How to connect to the email provider',
    defaultValue: null,
    valueType: 'dictionary',
    validator: validate.yes,
    templateAccess: 'private',
    publicAccess: false
  }
};
const PUBLIC_TEMPLATE_SETTING_KEYS = [];
const PRIVATE_TEMPLATE_SETTING_KEYS = [];
const PUBLIC_SITE_SETTING_KEYS = [];
const ALL_SETTING_KEYS = [];

function simplePromiseFactory() {
  return function(value) { return Promise.resolve(value); };
}
for (let k in ALL_SETTINGS) {
  if (ALL_SETTINGS.hasOwnProperty(k)) {
    ALL_SETTINGS[k].key = k;
    ALL_SETTING_KEYS.push(k);
    if (!ALL_SETTINGS[k].validator) {
      ALL_SETTINGS[k].validatorPromiseFactory = simplePromiseFactory();
    } else if (validate.isArray(ALL_SETTINGS[k].validator)) {
      ALL_SETTINGS[k].validatorPromiseFactory = validate.asValidatePromiseFactory(
        ALL_SETTINGS[k].validator[0], k, ALL_SETTINGS[k].validator.slice(1));
    } else {
      ALL_SETTINGS[k].validatorPromiseFactory = validate.asValidatePromiseFactory(
        ALL_SETTINGS[k].validator, k, []);
    }

    if (ALL_SETTINGS[k].templateAccess === 'public') {
      PUBLIC_TEMPLATE_SETTING_KEYS.push(k);
    } else if (ALL_SETTINGS[k].templateAccess === 'private') {
      PRIVATE_TEMPLATE_SETTING_KEYS.push(k);
    }
    if (ALL_SETTINGS[k].publicAccess) {
      PUBLIC_SITE_SETTING_KEYS.push(k);
    }
  }
}


SettingSchema.statics._settingGetterValue = function(keyDef) {
  return this._forKey(keyDef.key)
    .then((val) => {
      if (!val) {
        return keyDef.defaultValue;
      }
      return val.value;
    });
};
SettingSchema.statics._settingSetter = function(keyDef, value) {
  return keyDef.validatorPromiseFactory(value)
    .then((scrubbed) => {
      return this._setKey(keyDef.key, keyDef.description, keyDef.vlaueType, scrubbed);
    });
};
function createSettingGetterSetter(keyDef) {
  SettingSchema.statics['get' + keyDef.key] = function() {
    return this._settingGetterValue(keyDef);
  };
  SettingSchema.statics['set' + keyDef.key] = function(value) {
    return this._settingSetter(keyDef, value);
  };
}
for (let k in ALL_SETTINGS) {
  if (ALL_SETTINGS.hasOwnProperty(k)) {
    createSettingGetterSetter(ALL_SETTINGS[k]);
  }
}




// =========================================================================


SettingSchema.statics.findFor = function(keys) {
  var Self = this;
  return this.find({ key: { $in: keys } })
    .then((settings) => {
      let found = {};

      for (let i = 0; i < settings.length; i++) {
        found[settings[i].key] = true;
      }

      for (let i = 0; i < keys.length; i++) {
        if (!found[keys[i]] && ALL_SETTINGS[keys[i]]) {
          settings.push(new Self({
            key: keys[i],
            description: ALL_SETTINGS[keys[i]].description,
            valueType: ALL_SETTINGS[keys[i]].valueType,
            value: ALL_SETTINGS[keys[i]].defaultValue
          }));
        }
      }

      return settings;
    });
};


SettingSchema.statics.findAll = function() {
  return this.findFor(ALL_SETTING_KEYS);
};


SettingSchema.statics.getMappedSettingObjects = function(keys) {
  return this.findFor(keys)
    .then((settings) => {
      let ret = {};

      for (let i = 0; i < settings.length; i++) {
        ret[settings[i].key] = settings[i];
      }

      return ret;
    });
};


SettingSchema.statics.setSettings = function(keyValueMap) {
  var self = this;
  var keys = [];
  var validationPromises = [];
  for (let k in keyValueMap) {
    if (keyValueMap.hasOwnProperty(k)) {
      if (!!ALL_SETTINGS[k]) {
        keys.push(k);
        validationPromises.push(
          ALL_SETTINGS[k].validatorPromiseFactory(keyValueMap[k]));
      } else {
        validationPromises.push(
          Promise.reject(validate.error(keyValueMap[k], k, 'not a setting')));
      }
    }
  }
  return validate.allValidationPromises(validationPromises)
    .then(() => {
      return self.getMappedSettingObjects(keys);
    })
    .then((settings) => {
      var savePromises = [];
      for (let i = 0; i < keys.length; i++) {
        settings[keys[i]].value = keyValueMap[keys[i]];
        savePromises.push(settings[keys[i]].save());
      }
      return Promise.all(savePromises);
    });
};


/**
 * Loads all the values
 */
SettingSchema.statics.getSettingValues = function(keys) {
  return this.findFor(keys)
    .then((settings) => {
      let ret = {};

      for (let i = 0; i < settings.length; i++) {
        ret[settings[i].key] = settings[i].value;
      }

      return ret;
    });
};




/**
 * Retrieve a single object with all the settings used by email.
 */
SettingSchema.statics.getTemplateSettings = function() {
  // Shallow clone of the dictionaries above.
  return Promise
    .all([
      this.getSettingValues(PUBLIC_TEMPLATE_SETTING_KEYS),
      this.getSettingValues(PRIVATE_TEMPLATE_SETTING_KEYS)
    ])
    .then((args) => {
      return { public: args[0], private: args[1] };
    });
};


/**
 * Retrieve all the settings that an end user would care about.
 */
SettingSchema.statics.getPublicSiteSettings = function() {
  return this.getSettingValues(PUBLIC_SITE_SETTING_KEYS);
};



module.exports = mongoose.model('Setting', SettingSchema);
module.exports.ALL_SETTINGS = [];
module.exports.ALL_SETTINGS_MAP = {};
for (let i = 0; i < ALL_SETTING_KEYS.length; i++) {
  let k = ALL_SETTING_KEYS[i];

  module.exports.ALL_SETTINGS_MAP[k] = {
    key: ALL_SETTINGS[k].key,
    description: ALL_SETTINGS[k].description
  };
  module.exports.ALL_SETTINGS.push(module.exports.ALL_SETTINGS_MAP[k]);
}
