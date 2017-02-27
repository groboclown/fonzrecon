'use strict';

const Acknowledge = require('../models').Acknowledge;
const User = require('../models').User;
const paging = require('./util').paging.extract;


exports.getAllBrief = function(req, res, next) {
  // TODO allow for query parameters.

  var pagination = paging(req, { page: 1, limit: 100 });
  return Acknowledge
    .findBriefPublic({})
    .paginate(pagination)
    .then(function (results) {
      results.type = 'Acknowledge';
      res.status(200).json(results);
    })
    .catch(function (err) {
      next(err);
    });
};

exports.getOneBrief = function(req, res, next) {
  // TODO
};

exports.getOneDetails = function(req, res, next) {
  return Acknowledge
    .findOneDetails({ _id: req.params.id })
    .then(function (ack) {
      res.status(200).json({ Acknowledge: ack });
    })
    .catch(function (err) {
      next(err);
    })
}


exports.getUsersInAcknowledge = function(req) {
  const ackId = req.params.id;

  return Acknowledge
    .findOneBrief({ _id: ackId })
    .then(function(ack) {
      var ret = [ ack.givenByUsername.username ];
      for (var i = 0; i < ack.awardedTo.length; i++) {
        ret.push(ack.awardedTo[i].username);
      }
      return ret;
    });
}
