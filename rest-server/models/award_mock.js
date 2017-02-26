'use strict';

const MockODM = require('./mock_api');

// For now, use a hard-coded list
const AWARD_LIST = [
  {

  },
  {

  }
];

function findByAwardId(awardId) {
  return new Promise(function(resolve, reject) {
    if (! AWARD_LIST[awardId]) {
      reject(new Error(awardId));
    } else {
      resolve(AWARD_LIST[awardId]);
    }
  });
}

const AwardDb = new MockODM(AWARD_LIST);

module.exports = AwardDb;
