'use strict';

// An alternative method to the one used here is
// to reference the model through mongoose directly,
// like `mongoose.model('User')`.  This requires an
// initialization of the models that can be done
// dynamically, such as with:
// ```
// const fs = require('fs');
// const join = require('path').join;
// const model_dir = join(_dirname, '../models');
// fs.readdirSync(model_dir)
//   .filter(file => ~file.search(/^[^\.].*\.js$/))
//   .forEach(file => require(join(models, file)));
// ```
//
// The approach below allows for mocking out the database, though.

module.exports = {
  Account: require('./account'),
  User: require('./user'),
  Acknowledgement: require('./acknowledgement'),
  ClaimedPrize: require('./claimed-prize'),
  PrizeChoice: require('./prize-choice'),
  Setting: require('./setting')
};
