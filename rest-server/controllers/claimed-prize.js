'use strict';

const models = require('../models');
const ClaimedPrize = models.ClaimedPrize;
const PrizeChoice = models.PrizeChoice;
const User = models.User;
const util = require('./util');
const paging = util.paging.extract;
const jsonConvert = util.jsonConvert;
const errors = util.errors;
const accessLib = require('../lib/access');
const roles = require('../config/access/roles');
const notify = require('../lib/notify');



exports.getAll = function(req, res, next) {
  const pagination = paging(req);

  var conditionPromise;
  if (req.query.user) {
    conditionPromise = User
      .find({ names: req.query.user })
      .lean()
      .exec()
      .then((users) => {
        if (!users || users.length < 0) {
          // No results.
          return false;
        }
        return {
          redeemedByUser: { $in: users }
        };
      });
  } else {
    conditionPromise = Promise.resolve({});
  }

  conditionPromise
    .then((condition) => {
      if (!condition) {
        return util.emptyResults(pagination);
      }
      return ClaimedPrize
        .findBrief(condition)
        .lean()
        .paginate(pagination);
    })
    .then((results) => {
      results.type = 'ClaimedPrize';
      res.status(200).json(jsonConvert.pagedResults(
        results, jsonConvert.claimedPrize));
    })
    .catch((err) => {
      next(err);
    });
};



exports.getOne = function(req, res, next) {
  return ClaimedPrize
    .findOneBriefById(req.params.id)
    .lean()
    .exec()
    .then((claimed) => {
      if (!claimed) {
        throw errors.resourceNotFound();
      }
      return res.status(200).json(jsonConvert.claimedPrize(claimed));
    })
    .catch((err) => {
      next(err);
    });
};


exports.create = function(req, res, next) {
  const fromUser = accessLib.getRequestUser(req);
  if (!fromUser) {
    return next(errors.notAuthorized());
  }

  const prizeChoiceId = req.body.prizeChoiceId;
  if (typeof(prizeChoiceId) !== 'string') {
    return next(errors.validationProblems([{
      param: 'prizeChoiceId',
      msg: 'prizeChoiceId must be a string',
      value: prizeChoiceId
    }]));
  }

  // Find the prize, and ensure the user has enough points to
  // redeem to get it.
  var prizePromise = PrizeChoice
    .findOneById(prizeChoiceId)
    .lean()
    .exec();

  var userUpdatePromise = prizePromise
    .then((prizeChoice) => {
      if (!prizeChoice) {
        throw errors.extraValidationProblem(
          'prizeChoiceId', prizeChoiceId, 'no prize by that ID'
        );
      }

      // Quick check on the user state, for early exit.
      if (fromUser.receivedPointsToSpend < prizeChoice.purchasePoints) {
        throw errors.extraValidationProblem(
          'purchasePoints', prizeChoice.purchasePoints,
          'insufficient points to spend to receive the prize');
      }

      return User.update(
          {
            username: fromUser.username,
            // Must have at least purchasePoints available to give.
            receivedPointsToSpend: { $gte: prizeChoice.purchasePoints }
          },

          // Deduct the given points
          { $inc: { receivedPointsToSpend: -prizeChoice.purchasePoints } },
            // We want the update to only update one document,
            // and have the safest update commit possible.
            // "j: true" write concern would be nice, but that will
            // produce an error if the DB does not have journaling
            // turned on.  However, "majority" uses the safest means,
            // so it will confirm when the journal is updated if the
            // db has journalling.
          { multi: false, writeConcern: { w: 'majority' } }
        )
        .exec();
    });

  Promise
    .all([prizePromise, userUpdatePromise])
    .then((args) => {
      var prize = args[0];

      return new ClaimedPrize({
        claimedByUser: fromUser,
        prize: prize
      })
      .save();
    })
    .then((claimedPrize) => {
      console.log(`send request to fulfil prize: ${claimedPrize}`);
      res.status(201).json(jsonConvert.claimedPrize(claimedPrize._id));

      // Note that we don't want the notify error to be sent to the
      // user.
      notify.send('prize-pending', fromUser, {
        username: fromUser.username,
        claimedPrizeId: claimedPrize._id,
        prize: claimedPrize.prize
      });

      // Tell the admins that this prize is pending the claim.
      notify.sendAdminNotification('prize-pending-admin', {
        username: fromUser.username,
        names: fromUser.names,
        claimedPrizeId: claimedPrize._id,
        prize: claimedPrize.prize
      });
    })
    .catch((err) => {
      next(err);
    });
};
