'use strict';

const models = require('../../models');
const Acknowledgement = models.Acknowledgement;
const User = models.User;
const util = require('../util');
const paging = util.paging.extract;
const jsonConvert = util.jsonConvert;
const errors = util.errors;
const accessLib = require('../../lib/access');
const roles = require('../../config/access/roles');
const extraAccess = require('./extra-access');



exports.getAll = function(req, res, next) {
  const user = accessLib.getRequestUser(req);
  if (!user) {
    return next(errors.notAuthorized());
  }

  const pagination = paging(req);

  // Query parameters...
  var condition = {};
  var reqUsername = req.body.name || req.query.name;
  var reqComment = req.body.comment || req.query.comment;
  if (reqComment) {
    condition.comment = new RegExp('.*' +
      reqComment.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') +
      '.*');
  }

  var queryByUser;
  if (reqUsername) {
    queryByUser = User
      .find({ names: reqUsername })
      .lean()
      .exec()
      .then((users) => {
        if (!users || users.length < 0) {
          // No results.
          return false;
        }
        condition.$or = [
          { givenByUser: { $in: users } },
          { awardedToUsers: { $in: users } }
          // Not including thumbs ups intentionally.
        ];
        return condition;
      });
  } else {
    // Condition isn't augmented with users.
    queryByUser = Promise.resolve(condition);
  }

  queryByUser
    .then((queryCondition) => {
      if (!queryCondition) {
        return util.emptyResults(pagination);
      }
      if (extraAccess.canViewPrivate(req)) {
        return Acknowledgement
          .findDetails(queryCondition)
          .paginate(pagination);
      }
      return Acknowledgement
        .findDetailsForUser(user, queryCondition)
        .paginate(pagination);
    })
    .then((results) => {
      results.type = 'Aaay';
      res.status(200).json(jsonConvert.pagedResults(
        results, convertAcknowledgement(req, user)));
    })
    .catch((err) => {
      next(err);
    });
};



exports.getOne = function(req, res, next) {
  const user = accessLib.getRequestUser(req);
  if (!user) {
    return next(errors.notAuthorized());
  }

  var ackPromise;
  if (extraAccess.canViewPrivate(req)) {
    ackPromise = Acknowledgement
      .findOneDetails(req.params.id)
      .exec();
  } else {
    ackPromise = Acknowledgement
      .findOneDetailsForUser(user, req.params.id)
      .exec();
  }

  return ackPromise
    .then((ack) => {
      if (!ack) {
        throw errors.resourceNotFound();
      }
      res.status(200).json({ Aaay: convertAcknowledgement(req, user)(ack) });
    })
    .catch((err) => {
      console.log(err.message);
      console.log(err.stack);
      next(err);
    });
};



exports.getUsersInAcknowledgement = function(req) {
  const ackId = req.params.id;

  return Acknowledgement
    .findOneBrief({ _id: ackId })
    .then((ack) => {
      if (!ack) {
        return [];
      }
      var rd = {};
      rd[ack.givenByUser.username] = ack.givenByUser.names;
      var ret = [rd];
      for (var i = 0; i < ack.awardedToUsers.length; i++) {
        rd = {};
        rd[ack.awardedToUsers[i].username] = ack.awardedToUsers[i].names;
        ret.push(rd);
      }
      return ret;
    });
}




function convertAcknowledgement(req, reqUser) {
  const canViewAckDetails = extraAccess.getCanViewAckDetailsFunc(req, reqUser);
  return function(ack) {
    return jsonConvert.acknowledgement(ack, canViewAckDetails(ack));
  };
}
