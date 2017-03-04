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
  },
  comment: String
});

const AcknowledgementSchema = new Schema({
  // FIXME this is now a user ref, so the name should be 'givenByUser'
  givenByUsername: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },

  // FIXME this is now a user ref, so the name should be 'awardedToUsers'
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

  // FIXME this is a list, so the name should be plural (thumbsUps)
  thumbsUp: [ThumbsUpSchema]
}, {
  timestamps: true
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

/**
 * Returns all acknowledgements.
 */
AcknowledgementSchema.statics.findBrief = function(conditions) {
  return this.find(conditions)
    .select('givenByUsername awardedToUsernames thumbsUp createdAt updatedAt givenBy awardedTo comment tags')
    .sort('-createdAt')
    .populate('givenByUsername', 'username names organization')
    .populate('awardedToUsernames', 'username names organization')
    .populate('thumbsUp', 'givenByUsername.username givenByUsername.names givenByUsername.organization createdAt')
    .lean();
};

function conditionForVisibleToUser(username) {
  // We don't need to check the ThumbsUp, because if you can't see
  // the Ack, then you can't create a ThumbsUp.  Therefore, if you
  // thumbed up an ack, then you can see it without a thumbs up.
  return {
    $or: [
      {
        public: true
      },
      {
        'givenByUsername.username': username
      },
      {
        'awardedToUsernames.username': username
      }
    ]
  };
}

/**
 * Return a brief list of acknowledgements that are viewable by the
 * user, which means that they are public, or the user is in the list
 * of awardedTo users, or the user is in the
 */
AcknowledgementSchema.statics.findBriefForUser = function(username) {
  return this.findBrief(conditionForVisibleToUser(username));
};

AcknowledgementSchema.statics.findOneBrief = function(conditions) {
  return this.findOne(conditions)
  .select('givenByUsername awardedToUsernames thumbsUp createdAt updatedAt givenBy awardedTo comment tags public')
  .populate('givenByUsername', 'username names organization')
  .populate('awardedToUsernames', 'username names organization')
  .populate('thumbsUp', 'givenByUsername.username givenByUsername.names givenByUsername.organization createdAt')
  .lean();
};

AcknowledgementSchema.statics.findOneBriefForUser = function(ackId, username) {
  return this.findOneBrief({
    $and: [
      conditionForVisibleToUser(username),
      {
        _id: ackId
      }
    ]
  });
};


AcknowledgementSchema.statics.findOneDetails = function(conditions) {
  return this.findOne(conditions)
    .populate('givenByUsername', 'username names organization')
    .populate('awardedToUsernames', 'username names organization')
    .populate('thumbsUp', 'givenByUsername.username givenByUsername.names givenByUsername.organization createdAt')
    .lean();
};


/**
 * Load the full object for updating.  User needs view access here;
 * this should ONLY be used for adding thumbs ups.
 */
AcknowledgementSchema.statics.findOneForAddingThumbsUp = function(ackId, username) {
  return this.findOne({
      $and: [
        conditionForVisibleToUser(username),
        {
          _id: ackId
        }
      ]
    })
    .populate('givenByUsername')
    .populate('awardedToUsernames')
    .populate('thumbsUp')
};


AcknowledgementSchema.statics.findOneDetailsForUser = function(ackId, username) {
  return this.findOneDetails(
    {
      $or: [
        // Note: public is not part of this condition.
        {
          'givenByUsername.username': username
        },
        {
          'awardedToUsernames.username': username
        }
      ],
      _id: ackId
    });
};


module.exports = mongoose.model('Acknowledgement', AcknowledgementSchema);
