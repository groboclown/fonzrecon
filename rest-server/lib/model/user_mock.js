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
    'receivedPointsSpent': 30
  },
  {
    'username': 'admin1',
    'names': ['Admin One'],
    'contact': [],
    'pointsToAward': 0,
    'receivedPointsSpent': 0
  }
];

const UserDb = new MockODM(USER_LIST);


UserDb.findOneByName = function(name, cb) {
  this.find({}, function(err, users) {
    if (err) {
      return cb(err);
    }
    for (var i = 0; i < users.length; i++) {
      if (users[i].names.includes(name)) {
        return cb(null, users[i]);
      }
    }
    return cb(null, null);
  });
};


module.exports = UserDb;
