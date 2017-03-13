'use strict';

// Local account authentication methods.

const bcrypt = require('bcrypt-nodejs');
const SALT_FACTOR = 10;

exports.onUserInfoSaved = function(userInfo) {
  return new Promise((resolve, reject) => {
    if (userInfo.length != 1) {
      reject(new Error('Invalid user info (expected length 1, found ' + userInfo.length + ')'));
    }
    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
      if (err) {
        userInfo[0] = null;
        return reject(err);
      }
      bcrypt.hash(userInfo[0], salt, null, (err, hash) => {
        if (err) {
          return reject(err);
        }
        userInfo[0] = hash;
        return resolve(userInfo);
      });
    });
  });
};


exports.onLogin = function(userInfo, reqAuthData) {
  // Note: reqAuthData is { username, password }

  return new Promise((resolve, reject) => {
    bcrypt.compare(reqAuthData.password, userInfo[0], (err, isMatch) => {
      if (err) {
        reject(err);
      } else {
        resolve(isMatch);
      }
    });
  });
};
