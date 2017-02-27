'use strict';

const MockODM = require('./mock_api');

// For now, uses hard-coded values
const USER_LIST = [
  {
    // primary key, but referenced in the login table
    'username': 'user1',
    'names': ['User1', 'User One'],
    'contact': [
      {
        'type': 'email',
        'server': null,
        'address': 'eat@fonzrecon.email.server'
      }
    ],
    'pointsToAward': 100,
    'receivedPointsSpent': 30,
    'organization': 'Engineering'
  },
  {
    'username': 'admin1',
    'names': ['Admin One'],
    'contact': [],
    'pointsToAward': 0,
    'receivedPointsSpent': 0,
    'organization': 'HR',
  }
];

const UserDb = new MockODM(USER_LIST);


UserDb.findOneByName = function(name) {
  return this.find({})
    .then(function(users) {
      for (var i = 0; i < users.length; i++) {
        if (users[i].names.includes(name)) {
          return users[i];
        }
      }
      return null;
    });
};


module.exports = UserDb;
