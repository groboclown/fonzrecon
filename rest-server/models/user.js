'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// =====================================
// Schema Definition

const ContactSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  server: String,
  address: {
    type: String,
    required: true
  }
});


const UserSchema = new Schema({
  // identifier
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
  contact: [ContactSchema],

  // Access Role.  What the user is allowed to do.
  pointsToAward: {
    // Non-negative integer type
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    min: 0
  },

  receivedPointsToSpend: {
    // Remaining number of points to spend
  },

  // Password reset notices
  receivedPointsSpent: {
    // Non-negative integer type
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    min: 0
  },
  organization: String,
}, {
  timestamps: true
});

UserSchema.statics.findOneByName = function(name) {
  return this
    .findOne({ names: name })
    .lean();
};

const BRIEF_SELECTION = 'username names organization';

UserSchema.statics.findOneBrief = function(name) {
  return this
    .findOne({ names: name })
    .lean()
    .select(BRIEF_SELECTION);
}

UserSchema.statics.listBrief = function(userLike) {
  return this
    .find({ username: { $regex: new RegExp(userLike, 'i') } })
    .lean()
    .select(BRIEF_SELECTION);
};


module.exports = mongoose.model('User', UserSchema);
