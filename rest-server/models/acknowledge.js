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

  public: Boolean,

  tags: [String],

  thumbsUp: [ThumbsUp]
}, {
  timestamps: true
});
AcknowledgeSchema.set('toJSON', { virtuals: true });
AcknowledgeSchema.virtual('givenBy')
  .get(function() {
    if (typeof(this.givenByUsername) === 'string') {
      return {
        username: this.givenByUsername,
        url: '/api/v1/users/' + this.givenByUsername
      };
    } else {
      return {
        username: this.givenByUsername.username,
        url: '/api/v1/users/' + this.givenByUsername.username,
        names: this.givenByUsername.names,
        organization: this.givenByUsername.organization
      };
    }
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
      for (var j = 0; j < this.thumbsUp.length; j++) {
        sum += this.thumbsUp[j].pointsToEachUser;
      }
      return sum;
    }
  }
  return 0;
};

AcknowledgeSchema.statics.findBriefPublic = function(conditions) {
  conditions.public = true;
  return this.find(conditions)
    .select('givenBy awardedTo thumbsUp createdAt updatedAt')
    .sort('-createdAt')
    .populate('givenByUsername', 'username names organization')
    .populate('awardedTo', 'username names organization')
    .populate('thumbsUp', 'givenByUsername.username givenByUsername.names givenByUsername.organization createdAt')
    /*
    .populate({
      path: 'awardedTo',
      // populate the users in the array of awardedTo
      populate: {
        path: 'awardedTo',
        select: 'username names organization'
      },
    })
    .populate({
      path: 'thumbsUp',
      select: 'givenByUsername createdAt',
      populate: {
        path: 'thumbsUp.givenByUsername',
        select: 'username names organization'
      }
    })
    */
    .lean();
};

AcknowledgeSchema.statics.findOneBrief = function(conditions) {
  return this.findOne(conditions)
  .select('givenByUsername awardedTo thumbsUp createdAt updatedAt')
  .populate('givenByUsername', 'username names organization')
  .populate({
    path: 'awardedTo',
    // populate the users in the array of awardedTo
    populate: {
      path: 'awardedTo',
      select: 'username names organization'
    },
  })
  .populate({
    path: 'thumbsUp',
    select: 'givenByUsername createdAt',
    populate: {
      path: 'thumbsUp.givenByUsername',
      select: 'username names organization'
    }
  })
  .lean();
};

AcknowledgeSchema.statics.findOneDetails = function(conditions) {
  return this.findOne(conditions)
    .populate('givenByUsername', 'username names organization')
    .populate({
      path: 'awardedTo',
      // populate the users in the array of awardedTo
      populate: {
        path: 'awardedTo',
        select: 'username names organization'
      },
    })
    .populate({
      path: 'thumbsUp',
      populate: {
        path: 'thumbsUp.givenByUsername',
        select: 'username names organization'
      }
    })
    .lean();
}

module.exports = mongoose.model('Acknowledge', AcknowledgeSchema);
