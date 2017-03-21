'use strict';

module.exports = {
  getAllBrief: require('./get-all'),
  getOneBrief: require('./get-one-brief'),
  getOneDetails: require('./get-one'),
  create: require('./create-user').create,
  import: require('./create-user').import,
  update: require('./update')
};
