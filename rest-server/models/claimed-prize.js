'use strict';

// What the user spent points on.


const mongoose = require('mongoose');
const Schema = mongoose.Schema;



// =====================================
// Schema Definition


const ClaimedPrizeSchema = new Schema({
  claimedByUser: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  prize: {
    type: Schema.ObjectId,
    ref: 'PrizeChoice',
    required: true
  },
  pendingValidation: {
    type: Boolean,
    required: true,
    default: true
  },
  validatedByUser: {
    type: Schema.ObjectId,
    ref: 'User',
    required: false
  },
  validatedTime: {
    type: Date,
    required: false
  },
  claimAllowed: {
    type: Boolean,
    required: false
  },
  claimRefusalReason: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});


ClaimedPrizeSchema.methods.auhorizeClaim = function(validatedByUser) {
  if (!validatedByUser) {
    throw new TypeError('validatedByUsername must be a user');
  }
  if (this.validatedByUser) {
    throw new Error('Claim already validated');
  }
  this.pendingValidation = false;
  this.validatedByUser = validatedByUser;
  this.validatedTime = new Date();
  this.claimAllowed = true;
  this.claimRefusalReason = null;
  return this.save();
};


ClaimedPrizeSchema.methods.refuseClaim = function(refusedByUser, reason) {
  if (!refusedByUser) {
    throw new TypeError('refusedByUser must be a user');
  }
  if (typeof(reason) !== 'string') {
    throw new TypeError('refusal reason must be a string');
  }
  if (this.validatedByUser) {
    throw new Error('Claim already validated');
  }
  this.pendingValidation = false;
  this.validatedByUser = refusedByUser;
  this.validatedTime = new Date();
  this.claimAllowed = false;
  this.claimRefusalReason = reason;
  return this.save();
};


ClaimedPrizeSchema.statics.findBrief = function(condition) {
  return this.find(condition)
    .populate('prize')
    .populate('claimedByUser', 'username names organization');
};


ClaimedPrizeSchema.statics.findBriefForUser = function(userObj) {
  return this.findBrief({ claimedByUser: userObj._id });
};


ClaimedPrizeSchema.statics.findOneBrief = function(condition) {
  return this.findOne(condition)
  .populate('prize')
  .populate('claimedByUser', 'username names organization');
};


ClaimedPrizeSchema.statics.findOneBriefById = function(id) {
  var objId = new mongoose.Types.ObjectId(id);
  return this.findOneBrief({ _id: objId });
};


module.exports = mongoose.model('ClaimedPrize', ClaimedPrizeSchema);
