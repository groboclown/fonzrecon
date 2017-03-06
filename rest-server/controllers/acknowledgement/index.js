'use strict';

const query = require('./query');
const createAck = require('./create-ack');
const createThumbsUp = require('./create-thumbs-up');

module.exports = {
  getOne: query.getOne,
  getAll: query.getAll,
  create: createAck.create,
  createThumbsUp: createThumbsUp.createThumbsUp,
};
