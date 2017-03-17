'use strict';

const validator = require('express-validator');
const models = require('../../models');
const Account = models.Account;
const User = models.User;


/**
 * Simulate the construction of all the express header stuff.
 * Returns a promise that runs the controller.  On any valid exit
 * of the controller (either a send or next), the `then` will be invoked
 * with an object argument:
 *
 * ```javascript
 * {
 *    next: false,
 *    status: 200,
 *    jsonBody: {}
 *    body: "text"
 *    error: new Error(),
 *    errorMessage: "text",
 *    errorDetails: {}
 * }
 * ```
 *
 * @parameters {Object} reqData a set of the request information.
 * @parameters {String} reqData.username (optional) username making the request
 * @parameters {User} reqData.user (optional) user making the request
 * @parameters {Account} reqData.account (optional)
 * @parameters {String} reqData.behalf
 * @parameters {User} reqData.behalfUser (optional) user making the request
 * @parameters {Account} reqData.behalfAccount (optional)
 * @parameters {Object} body json parsed body
 * @parameters {function} controller the controller function to run
 */
exports.run = function(controller, reqData) {
  let accountPromise;
  if (reqData.account || !reqData.username) {
    accountPromise = Promise.resolve(reqData.account || null);
  } else {
    accountPromise = Account.findOne({ userRef: reqData.username });
  }
  let userPromise;
  if (reqData.user || !reqData.username) {
    userPromise = Promise.resolve(reqData.user || null);
  } else {
    userPromise = User.findOne({ username: reqData.username });
  }
  let behalfAccountPromise;
  if (reqData.behalfAccount || !reqData.behalf) {
    behalfAccountPromise = Promise.resolve(reqData.behalfAccount || null);
  } else {
    behalfAccountPromise = Account.findOne({ userRef: reqData.behalf });
  }
  let behalfUserPromise;
  if (reqData.behalfUser || !reqData.behalf) {
    behalfUserPromise = Promise.resolve(reqData.behalfUser || null);
  } else {
    behalfUserPromise = User.findOne({ username: reqData.behalf });
  }
  return Promise
    .all([accountPromise, userPromise, behalfAccountPromise, behalfUserPromise])
    .then((args) => {
      return createRequest(args[0], args[1], args[2], args[3], reqData);
    })
    .then((req) => {
      return new Promise((resolve, reject) => {
        let next = function(err, val) {
          if (err) {
            resolve({
              next: true,
              error: err,
              status: err.status || 500,
              errorMessage: err.message,
              errorDetails: err.details
            });
          }
          resolve({ next: true, value: val });
        };
        let res = {
            _status: 0,
            _json: null,
            status: function(s) {
              this._status = s;
              return this;
            },
            json: function(s) {
              this._json = s;
              resolve({
                next: false,
                status: this._status,
                json: this._json,
                body: JSON.stringify(this._json)
              });
              return this;
            },
            send: function(s, b) {
              reject(new Error('send must not be called'));
            },
            sendStatus: function() {
              reject(new Error('sendStatus must not be called'));
            }
          };
        controller(req, res, next)
          .then((res) => {
            // Do nothing
          })
          .catch((err) => {
            if (err.status) {
              // Error with intent
              resolve({
                next: false,
                error: err,
                status: err.status,
                errorMessage: err.message,
                errorDetails: err.details
              });
            } else {
              // Unexpected error
              reject(err);
            }
          });
      })
    });
};



function createRequest(account, user, behalfAccount, behalfUser, reqData) {
  // Create the req object.
  var req = {
    user: account,
    userAccount: {
      account: account || null,
      user: user || null,
      behalfAccount: behalfAccount || null,
      behalf: behalfUser || null
    },
    body: reqData.body
  };

  // Simulate express setup stuff that the controllers need.
  var v = validator({
    customValidators: {
      isArrayOfString: function(param, minCount) {
        if (!Array.isArray(param)) {
          return false;
        }
        if (param.length < minCount) {
          return false;
        }
        for (var i = 0; i < param.length; i++) {
          if (typeof(param[i]) !== 'string') {
            return false;
          }
        }
        return true;
      }
    }
  });

  return new Promise((resolve, reject) => {
    return v(req, {}, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(req);
      }
    });
  });


  return ret;
}
