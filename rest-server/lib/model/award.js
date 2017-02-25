'use strict';

const DB = require('./_db')

// For now, use a hard-coded list
const AWARD_LIST = {
  1: {

  },
  2: {

  }
};

function findByAwardId(awardId) {
  return new Promise(function(resolve, reject) {
    if (! AWARD_LIST[awardId]) {
      reject(new Error(awardId));
    } else {
      resolve(AWARD_LIST[awardId]);
    }
  });
}

module.exports = {
  findByAwardId: findByAwardId
}
