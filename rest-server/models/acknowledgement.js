'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// =====================================
// Schema Definition


const ThumbsUpSchema = new Schema({
  givenByUser: {
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
}, {
  timestamps: true
});


const AcknowledgementSchema = new Schema({
  givenByUser: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },

  awardedToUsers: [{
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

  public: {
    type: Boolean,
    default: true
  },

  tags: [String],

  thumbsUps: [ThumbsUpSchema]
}, {
  timestamps: true
});


AcknowledgementSchema.methods.pointsGivenBy = function(username) {
  // In case we're passed a User object instead.
  if (username.username) {
    username = username.username;
  }
  var sum = 0;
  if (this.givenByUser.username === username) {
    sum += this.pointsToEachUser * this.awardedTo.length;
  }
  for (var i = 0; i < this.thumbsUps.length; i++) {
    if (this.thumbsUps[i].givenByUser.username === username) {
      sum += this.thumbsUps[i].pointsToEachUser * this.awardedTo.length;
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
      for (var j = 0; j < this.thumbsUps.length; j++) {
        sum += this.thumbsUps[j].pointsToEachUser;
      }
      return sum;
    }
  }
  return 0;
};


const SORT_BY = [
  'createdAt', '-createdAt',
  'updatedAt', '-updatedAt'
];


/**
 * Returns all acknowledgements.
 */
AcknowledgementSchema.statics.findBrief = function(conditions, sort) {
  if (!sort || !SORT_BY.includes(sort)) {
    sort = '-createdAt';
  }

  return this.find(conditions)
    .select('givenByUser awardedToUsers thumbsUps createdAt updatedAt givenBy awardedTo comment tags public')
    .sort(sort)
    .populate('givenByUser', 'username names organization')
    .populate('awardedToUsers', 'username names organization')
    .populate('thumbsUps', 'givenByUser.username givenByUser.names givenByUser.organization createdAt')
    .lean();
};


function conditionForVisibleToUser(userObj) {
  // We don't need to check the ThumbsUp, because if you can't see
  // the Ack, then you can't create a ThumbsUp.  Therefore, if you
  // thumbed up an ack, then you can see it without a thumbs up.
  var objId = new mongoose.Types.ObjectId(userObj._id);
  return {
    $or: [
      {
        public: true
      },
      {
        givenByUser: objId
      },
      {
        awardedToUsers: objId
      }
    ]
  };
}


AcknowledgementSchema.statics.findOneDetails = function(id) {
  var objId = new mongoose.Types.ObjectId(id);
  return this.findOne({ _id: objId })
    .populate('givenByUser', 'username names organization imageUri')
    .populate('awardedToUsers', 'username names organization imageUri')
    .populate('thumbsUps', 'givenByUser createdAt comment pointsToEachUser')
    .populate('thumbsUps.givenByUser', 'username names organization')
    .lean();
};


AcknowledgementSchema.statics.findOneDetailsForUser = function(userObj, id) {
  return this.findOneDetails(id)
    .and(conditionForVisibleToUser(userObj));
};


AcknowledgementSchema.statics.findDetails = function(conditions) {
  return this.find(conditions)
    .populate('givenByUser', 'username names organization imageUri')
    .populate('awardedToUsers', 'username names organization imageUri')
    .populate('thumbsUps', 'givenByUser createdAt comment pointsToEachUser')
    .populate('thumbsUps.givenByUser', 'username names organization imageUri')
    .lean();
};


AcknowledgementSchema.statics.findDetailsForUser = function(userObj, conditions) {
  return this.findDetails(conditions)
    .and(conditionForVisibleToUser(userObj));
};


/**
 * Load the full object for updating.  User needs view access here;
 * this should ONLY be used for adding thumbs ups.
 */
AcknowledgementSchema.statics.findOneForAddingThumbsUp = function(ackId, userObj) {
  return this.findOne({ _id: ackId })
    .and(conditionForVisibleToUser(userObj))
    .populate('givenByUser')
    .populate('awardedToUsers')
    .populate('thumbsUps')
    .populate('thumbsUps.givenByUser');
};


module.exports = mongoose.model('Acknowledgement', AcknowledgementSchema);
