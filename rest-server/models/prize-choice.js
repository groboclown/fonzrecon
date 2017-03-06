'use strict';

// Different prizes the user can claim.


const mongoose = require('mongoose');
const Schema = mongoose.Schema;




// =====================================
// Schema Definition


const PriceChoiceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  referenceUrl: {
    type: String,
    required: false
  },
  purchasePoints: {
    // Positive integer type
    // Positive integer type
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    min: 1,
    required: true
  },
  // Allows for making a prize no longer
  // redeemable, while still keep track of what people
  // have redeemed, as well as showing people if it will
  // be removed soon.
  expires: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});


PrizeChoiceSchema.statics.findActive = function(condition) {
  condition = condition || {};
  condition.expires = {
    $gt: new Date()
  };
  return this.find(condition);
};


PriceChoiceSchema.statics.findAtMostPoints = function(points) {
  return this.findActive({ purchasePoints: { $lte: points } });
};


module.exports = mongoose.model('PriceChoice', PriceChoiceSchema);
