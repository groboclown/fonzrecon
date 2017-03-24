'use strict';

module.exports = {
  getAllBrief: require('./get-all'),
  getOneBrief: require('./get-one-brief'),
  getOneDetails: require('./get-one'),
  getSelf: require('./get-self'),
  create: require('./create-user').create,
  import: require('./create-user').import,
  update: require('./update').update,
  delete: require('./update').delete,
  setRole: require('./update').setRole,
  resetAllPointsToAward: require('./update').resetAllPointsToAward,
  resetOnePointsToAward: require('./update').resetOnePointsToAward
};
