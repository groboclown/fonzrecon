'use strict';

// Helpers for setting up an initial database.
// This sets up only an admin user, which can be used
// to create the other accounts and settings through the
// REST api calls.

const testSetup = require('./test-setup');
const User = testSetup.models.User;
const Account = testSetup.models.Account;
const Setting = testSetup.models.Setting;
const roles = require('../../config/access/roles');

module.exports = function() {
  // Create an initial admin user to get us going.
  return Account
    .findOne({ id: 'initialadmin' })
    .then((admin) => {
      if (admin) {
        return admin;
      }
      return new Account({
          id: 'initialadmin',
          authentications: [
            {
              source: 'local',
              id: 'initialadmin@fonzrecon.github',
              userInfo: ['sekret'],
              browser: []
            }
          ],
          accountEmail: 'initialadmin@fonzrecon.github',
          role: roles.ADMIN.name,
          userRef: 'initialadmin',
          resetAuthenticationToken: null,
          resetAuthenticationExpires: null
        })
        .save();
    })
    .then((account) => {
      return User
        .findOne({ username: 'initialadmin' })
        .then((user) => {
          if (user) {
            return user;
          }
          return new User({
            username: 'initialadmin',
            names: ['Admin, Initial', 'Initial Admin'],
            contacts: [
              {
                type: 'email',
                server: null,
                address: 'initialadmin@fonzrecon.github'
              }
            ],
            pointsToAward: 0,
            receivedPointsToSpend: 0,
            image: false,
            organization: 'Sysop'
          })
          .save();
        })
    });
};
