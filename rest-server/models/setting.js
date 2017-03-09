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
  if (val.value === true || val.value === false) {
    console.log(`Using stored value ${val.value} for ${val}`);
    return val.value;
  }
  console.log(`using default value ${defaultVal} for ${val}`);
  return defaultVal;
}

// Well defined keys

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


module.exports = mongoose.model('Setting', SettingSchema);
