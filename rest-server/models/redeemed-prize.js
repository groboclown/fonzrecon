'use strict';

// What the user spent points on.


const mongoose = require('mongoose');
const Schema = mongoose.Schema;



// =====================================
// Schema Definition


const RedeemedPrizeSchema = new Schema({
  redeemedByUser: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  prize: {
    type: Schema.ObjectId,
    ref: 'PrizeChoice',
    required: true
  },
}, {
  timestamps: true
});


RedeemedPrizeSchema.statics.findForUser = function(userObj) {
  return this.find({ redeemedByUser: userObj._id });
};


module.exports = mongoose.model('RedeemedPrize', RedeemedPrizeSchema);
