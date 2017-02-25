'use strict';

const DB = require('./_db')

// For now, uses hard-coded values
const USER_LIST = {
  'user1': {
    'id': 'user1',
    'names': ['User1', 'User One'],
    'secret': '1234',
    'roles': ['user'],
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
  'bot1': {
    'id': 'bot1',
    'names': [],
    'secret': 'bot!',
    'roles': ['bot'],
    'contact': [],
    'pointsToAward': 0,
    'receivedPointsSpent': 0
  },
  'admin1': {
    'id': 'admin1',
    'names': ['Admin One'],
    'secret': 'sekret',
    'roles': ['user', 'admin'],
    'contact': [],
    'pointsToAward': 0,
    'receivedPointsSpent': 0
  }
};


function find(userId) {
  return new Promise(function(resolve, reject) {
    if (! USER_LIST[userId]) {
      reject(new Error(userId));
    } else {
      resolve(USER_LIST[userId]);
    }
  });
}


function list(pageRequest) {
  var maxRows = listRequest['maxRows'] || 100;
  var startIndex = listRequest['startIndex'] || 0;
  return new Promise(function(resolve, reject) {
    // TODO page
    resolve(USER_LIST);
  });
}

module.exports = {
  find: find,
  list: list
};
