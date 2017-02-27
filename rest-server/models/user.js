'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
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
    // Positive integer type
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    min: 0
  },

  // Password reset notices
  receivedPointsSpent: {
    // Positive integer type
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    min: 0
  },
  organization: String,
}, {
  timestamps: true
});
UserSchema.plugin(mongoosePaginate);

UserSchema.statics.findOneByName = function(name, cb) {
  return this.findOne({ names: name })
    .lean();
};

module.exports = mongoose.model('User', UserSchema);
