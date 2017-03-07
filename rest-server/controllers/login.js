'use strict';

/**
 * REST API handlers around the account login.
 *
 *
 * TODO the actual REST API around the registration must be done
 * in the route.  This particular file should handle the generation of
 * the tickets.  Much of this needs to be rewritten.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Account = require('../model/account');
const config = require('../../config');
const permissions = require('./permissions');
const roles = require('./roles');

// ==============================================
// Request handlers

exports.login = function(req, res, next) {
  let userInfo = setUserInfo(req.user);
  res.status(200).json({
    token: 'JWT ' + generateToken(userInfo),
    user: userInfo
  });
};

exports.register = function(req, res, next) {
  const email = req.body.email;
  const username = req.body.username;
  const auth = req.body.password;

  if (! validateEmail(email)) {
    var err = new Error('You must enter a valid email address.');
    err.status = 422;
    return next(err);
  }
  if (! validateUsername(username)) {
    var err = new Error('You must enter a valid username.');
    err.status = 422;
    return next(err);
  }
  if (! validateAuth(auth)) {
    var err = new Error('You must enter a valid password.');
    err.status = 422;
    return next(err);
  }
  Account.findOne({ username: username }, function(err, existingUser1) {
    if (err) {
      return next(err);
    }
    if (existingUser1) {
      var err = new Error('Username already in use.');
      err.status = 422;
      return next(err);
    }
    Account.findOne({ email: email }, function(err, existingUser2) {
      if (err) {
        return next(err);
      }
      if (existingUser2) {
        var err = new Error('Email is already in use.');
        err.status = 422;
        return next(err);
      }
      let account = new Account({
        email: email,
        username: username,
        authentication: auth
      });
      account.save(function(err, _account) {
        if (err) {
          return next(err);
        }

        let userInfo = setUserInfo(_account);
        res.status(201).json({
          token: 'JWT ' + generateToken(userInfo);
          user: userInfo
        });
      });
    });
  });
};


// =============================================
// Helper functions

function generateToken(userInfo) {
  return jwt.sign(userInfo, config.secret, {
    expiresIn: 10080 // seconds
  })
}

function setUserInfo(req) {
  return {
    _id: req._id,
    username: req.username,
    email: req.email,
    role: req.role
  };
}

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return (!! email) && re.test(email);
}

function validateUsername(username) {
  const re = /^[a-z][a-z0-9_]{3,}$/
  return (!! username) && re.test(username);
}

function validateAuth(auth) {
  return (!! auth) && auth.length >= 6;
}
