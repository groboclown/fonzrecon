'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const roles = require('../access/roles');


// =====================================
// Schema Definition

const LoginSchema = new Schema({
  // identifier
  username: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },

  // Contact email for authentication
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },

  // Authentication token.  Usually a password.
  authentication: {
    type: String,
    required: true
  },

  // Access Role.  What the user is allowed to do.
  role: {
    type: String,
    enum: roles.names,
    default: roles.USER.name
  },

  // Password reset notices
  resetAuthenticationToken: {
    type: String
  },
  resetAuthenticationExpires: {
    type: Date
  },

  // Reference to the linked user account details
  // Some accounts do not have a user account, so this is
  // not required.
  userRef: {
    type: String
  }
}, {
  timestamps: true
});


LoginSchema.pre('save', function(next) {
  const user = this;
  const SALT_FACTOR = 10;

  if  (! user.isModified('authentication')) {
    return next();
  }

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.authentication, salt, null, function(err, hash) {
      if (err) {
        return next(err);
      }
      user.authentication = hash;
      next();
    });
  });
})

LoginSchema.methods.compareAuthentication = function(candidateAuthentication) {
  bcrypt.compare(candidateAuthentication, this.authentication, function(err, isMatch) {
    return new Promize(function(resolve, reject) {
      if (err) {
        reject(err);
      } else {
        resolve(isMatch);
      }
    });
  });
};

module.exports = mongoose.model('Login', LoginSchema);
