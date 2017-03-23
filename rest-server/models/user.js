'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const contactTypes = require('../config/contact').providers;

// =====================================
// Schema Definition

const ContactSchema = new Schema({
  type: {
    type: String,
    enum: contactTypes,
    required: true
  },
  server: String,
  address: {
    type: String,
    required: true
  }
});


const UserSchema = new Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    index: true
  },

  // Ways that the user is identified
  names: {
    type: [String],
    required: true
  },

  // Ways to contact the user.
  contacts: [ContactSchema],

  // Points the user can spend.
  pointsToAward: {
    // Non-negative integer type
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    min: 0
  },

  // Remaining number of points to spend
  receivedPointsToSpend: {
    // Non-negative integer type
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    min: 0,
    required: true,
    default: 0
  },

  // Does the user have an image uploaded?
  image: {
    type: Boolean,
    default: false
  },

  locale: String,

  organization: String,

  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});


UserSchema.methods.bestName = function() {
  for (let i = 0; i < this.names.length; i++) {
    if (this.names[i] !== this.username) {
      return this.names[i];
    }
  }
  return this.username;
};


// Must use a "function" here to bind the `this`.
function preSave(next) {
  /* jshint ignore:start */
  if (!this.names.includes(this.username)) {
    this.names.push(this.username);
  }
  /* jshint ignore:end */
  return next();
}
UserSchema.pre('save', preSave);


UserSchema.statics.findActive = function(condition) {
  condition = condition || {};
  condition.active = true;
  return this.find(condition);
};


UserSchema.statics.findOneActive = function(condition) {
  condition = condition || {};
  condition.active = true;
  return this.findOne(condition);
};


UserSchema.statics.findOneByName = function(name) {
  return this
    .findOne({ names: name, active: true });
};


UserSchema.statics.findOneByUsername = function(username) {
  return this
    .findOne({ username: username, active: true });
};


const BRIEF_SELECTION = 'username names organization active';


UserSchema.statics.findOneBrief = function(condition, includeInactive) {
  if (!includeInactive) {
    condition.active = true;
  }
  return this
    .findOne(condition)
    .lean()
    .select(BRIEF_SELECTION);
};


UserSchema.statics.listBrief = function(userLike, includeInactive) {
  var condition = {
    $or: [
      { username: { $regex: new RegExp(userLike, 'i') } },
      { names: { $regex: new RegExp(userLike, 'i') } }
    ]
  };
  if (!includeInactive) {
    condition.active = true;
  }
  return this
    .find(condition)
    .lean()
    .select(BRIEF_SELECTION);
};


module.exports = mongoose.model('User', UserSchema);
