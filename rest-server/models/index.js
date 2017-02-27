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
  Login: require('./login'),
  // Login: require('./login_mock'),
  User: require('./user'),
  // User: require('./user_mock'),
  // Award: require('./award'),
  Award: require('./award_mock'),
};
