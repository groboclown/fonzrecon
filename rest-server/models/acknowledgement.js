'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// =====================================
// Schema Definition

const ThumbsUpSchema = new Schema({
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
ThumbsUpSchema.set('toJSON', { virtuals: true });
ThumbsUpSchema.set('toObject', { virtuals: true });

const AcknowledgementSchema = new Schema({
  givenByUsername: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },

  awardedToUsernames: [{
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

  public: Boolean,

  tags: [String],

  thumbsUp: [ThumbsUpSchema]
}, {
  timestamps: true
});
AcknowledgementSchema.set('toJSON', { virtuals: true });
AcknowledgementSchema.set('toObject', { virtuals: true });

function toLinkedSimpleUser(user) {
  if (typeof(user) === 'string') {
    return {
      username: user,
      url: '/api/v1/users/' + user
    };
  } else {
    return {
      username: user.username,
      url: '/api/v1/users/' + user.username,
      names: user.names,
      organization: user.organization
    };
  }
}

ThumbsUpSchema.virtual('givenBy')
  .get(function() {
    return toLinkedSimpleUser(this.givenByUsername);
  });

AcknowledgementSchema.virtual('givenBy')
  .get(function() {
    return toLinkedSimpleUser(this.givenByUsername);
  });
AcknowledgementSchema.virtual('awardedTo')
  .get(function() {
    var ret = [];
    for (var i = 0; i < this.awardedToUsernames.length; i++) {
      ret.push(toLinkedSimpleUser(this.awardedToUsernames[i]));
    }
    return ret;
  });

AcknowledgementSchema.methods.pointsGivenBy = function(username) {
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

AcknowledgementSchema.methods.pointsGivenTo = function(username) {
  // In case we're passed a User object instead.
  if (username.username) {
    username = username.username;
  }
  for (var i = 0; i < this.awardedTo.length; i++) {
    if (this.awardedTo[i] === username) {
      var sum = this.pointsToEachUser;
      for (var j = 0; j < this.thumbsUp.length; j++) {
        sum += this.thumbsUp[j].pointsToEachUser;
      }
      return sum;
    }
  }
  return 0;
};

AcknowledgementSchema.statics.findBriefPublic = function(conditions) {
  conditions.public = true;
  return this.find(conditions)
    .select('givenByUsername awardedToUsernames thumbsUp createdAt updatedAt givenBy awardedTo comment tags')
    .sort('-createdAt')
    .populate('givenByUsername', 'username names organization')
    .populate('awardedToUsernames', 'username names organization')
    .populate('thumbsUp', 'givenByUsername.username givenByUsername.names givenByUsername.organization createdAt')
    .lean();
};

AcknowledgementSchema.statics.findOneBrief = function(conditions) {
  return this.findOne(conditions)
  .select('givenByUsername awardedToUsernames thumbsUp createdAt updatedAt givenBy awardedTo comment tags public')
  .populate('givenByUsername', 'username names organization')
  .populate('awardedToUsernames', 'username names organization')
  .populate('thumbsUp', 'givenByUsername.username givenByUsername.names givenByUsername.organization createdAt')
  .lean();
};

AcknowledgementSchema.statics.findOneDetails = function(conditions) {
  return this.findOne(conditions)
    .populate('givenByUsername', 'username names organization')
    .populate('awardedToUsernames', 'username names organization')
    .populate('thumbsUp', 'givenByUsername.username givenByUsername.names givenByUsername.organization createdAt')
    .lean();
}

module.exports = mongoose.model('Acknowledgement', AcknowledgementSchema);
