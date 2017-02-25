'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Login = require('../model/login');
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
    return res.status(422).send({ error: 'You must enter a valid email address.' });
  }
  if (! validateUsername(username)) {
    return res.status(422).send({ error: 'You must enter a valid username.' });
  }
  if (! validateAuth(auth)) {
    return res.status(422).send({ error: 'You must enter a valid password.' })
  }
  Login.findOne({ username: username }, function(err, existingUser1) {
    if (err) {
      return next(err);
    }
    if (existingUser1) {
      return res.status(422).send({ error: 'That username is already in use.' });
    }
    Login.findOne({ email: email }, function(err, existingUser2) {
      if (err) {
        return next(err);
      }
      if (existingUser2) {
        return res.status(422).send({ error: 'That email is already in use.' });
      }
      let login = new Login({
        email: email,
        username: username,
        authentication: auth
      });
      login.save(function(err, login) {
        if (err) {
          return next(err);
        }

        let userInfo = setUserInfo(login);
        res.status(201).json({
          token: 'JWT ' + generateToken(userInfo);
          user: userInfo
        });
      });
    });
  });
};


// ===================================================
// Role Check Middleware

exports.roleAuthorization = function(permission) {
  if (! permissions[permission]) {
    throw new Error('unknown permission ' + permission);
  }
  return function(req, res, next) {
    const login = req.user;
    const bequest = req.bequest;

    Login.findById(login._id, function(err, foundLogin) {
      if (err) {
        res.status(422).json({ err: 'Authentication required' });
        return next(err);
      }
      let role = roles[foundLogin.role];
      if (! role) {
        console.error('Login ' + foundLogin.username + ' with invalid role ' +
          foundLogin.role)
        res.status(500).json({ err: 'Invalid role' });
        return next(err);
      }
      if (!! bequest) {
        Login.findById(bequest._id, )
      } else {

      }
    });
  };
}



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
