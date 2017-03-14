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
  }
}, {
  timestamps: true
});


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
