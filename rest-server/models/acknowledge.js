'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// =====================================
// Schema Definition

const ThumbsUp = new Schema({
  givenByUsername: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  pointsToEachUser: {
    // Positive integer type
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    min: 1
  }
});

const AcknowledgeSchema = new Schema({
  _id: {
    type: Number,
    unique: true,
    required: true
  },

  givenByUsername: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },

  awardedTo: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],

  pointsToEachUser: {
    // Positive integer type
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    min: 1
  },

  comment: String,

  thumbsUp: [ThumbsUp]
}, {
  timestamps: true
});


AcknowledgeSchema.methods.pointsGivenBy = function(username) {
  // In case we're passed a User object instead.
  if (username.username) {
    username = username.username;
  }
  var sum = 0;
  if (this.givenByUsername.username === username) {
    sum += this.pointsToEachUser * this.awardedTo.length;
  }
  for (var i = 0; i < this.thumbsUp.length; i++) {
    if (this.thumbsUp[i].givenByUsername.username === username) {
      sum += this.thumbsUp[i].pointsToEachUser * this.awardedTo.length;
    }
  }
  return sum;
};

AcknowledgeSchema.methods.pointsGivenTo = function(username) {
  // In case we're passed a User object instead.
  if (username.username) {
    username = username.username;
  }
  for (var i = 0; i < this.awardedTo.length; i++) {
    if (this.awardedTo[i] === username) {
      var sum = this.pointsToEachUser;

    }
  }
  return 0;
};

module.exports = mongoose.model('Acknowledge', AcknowledgeSchema);
