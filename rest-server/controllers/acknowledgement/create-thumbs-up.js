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
const notify = require('../../lib/notify');



exports.createThumbsUp = function(req, res, next) {
  // This user object is a "lean" object, so we must
  // retrieve it again.
  const fromUser = accessLib.getRequestUser(req);
  if (!fromUser) {
    return next(errors.notAuthorized());
  }
  const username = fromUser.username;

  req.checkBody({
    points: {
      isInt: {
        options: {
          gt: 0
        },
        errorMessage: 'must be present and positive.'
      }
    },
    comment: {
      isLength: {
        options: {
          lt: 4000
        },
        errorMessage: 'must be less than 4000 characters long'
      }
    }
  });

  // Find the *visible* ack...
  var ackPromise = req.getValidationResult()
    .then((results) => {
      if (!results.isEmpty()) {
        throw errors.validationProblems(results.array());
      }
      return Acknowledgement
        // Admins follow the same rules as users in the case of creating.
        .findOneForAddingThumbsUp(req.params.id, fromUser)
        .exec();
    })
    .then((ack) => {
      var i;

      // If the user requesting the thumbs up is in the acknowledgement,
      // or has already given a thumbs up, then don't allow this.
      if (ack.givenByUser.username === username) {
        throw errors.extraValidationProblem('user', username,
          'user already added to the aaay');
      }
      // TODO allow for a user who was awarded to add to the thumbs up
      // if there are other people in the list.  But it should also
      // not award the points to the user who gave the thumbs up.
      for (i = 0; i < ack.awardedToUsers.length; i++) {
        if (ack.awardedToUsers[i].username === username) {
          throw errors.extraValidationProblem('user', username,
            'user already added to the aaay');
        }
      }

      for (i = 0; i < ack.thumbsUps.length; i++) {
        if (ack.thumbsUps[i].givenByUser.username === username) {
          throw errors.extraValidationProblem('user', username,
            'user already added to the aaay');
        }
      }

      return ack;
    });

  var updateUserPromise = ackPromise
    .then((ack) => {
      if (!ack) {
        throw errors.resourceNotFound();
      }

      // Check if the user has enough points to give out.
      var totalGivenPoints = req.body.points * ack.awardedToUsers.length;
      if (fromUser.pointsToAward < totalGivenPoints) {
        throw errors.validationProblems([{
          param: 'points',
          msg: 'insufficient points',
          value: req.body.points
        }]);
      }

      // Rather than just saving the object with the deducted points,
      // the user is updated when it has the minimum number of points.
      // This way, we allow for some level of mid-air collision, but
      // still force the business rule to be valid.
      return User.update(
          {
            username: fromUser.username,
            // Must have at least totalGivenPoints available to give.
            pointsToAward: { $gte: totalGivenPoints }
          },

          // Deduct the given points
          { $inc: { pointsToAward: -totalGivenPoints } },

          // We want the update to only update one document,
          // and have the safest update commit possible.
          // "j: true" write concern would be nice, but that will
          // produce an error if the DB does not have journaling
          // turned on.  However, "majority" uses the safest means,
          // so it will confirm when the journal is updated if the
          // db has journalling.
          { multi: false, writeConcern: { w: 'majority' } }
        ).exec();
    })
    .then((numUpdated) => {
      if (numUpdated > 1) {
        throw new Error('Inconsistent DB state: multiple users with same name');
      }
      if (numUpdated < 1) {
        // Alternatively, the user may not exist, but this is by far the
        // more common alternative.  And if the user, for some reason, was
        // suddenly removed at this point, then this error is okay, too,
        // because a non-existent user doesn't have any points ;)
        throw errors.validationProblems([{
          param: 'points',
          msg: 'insufficient points',
          value: req.body.points
        }]);
      }
      // Nothing to return.
      return null;
    });

  var saveThumbsUpPromise = Promise
    .all([ackPromise, updateUserPromise])
    .then((args) => {
      var ack = args[0];
      ack.thumbsUps.push({
        givenByUser: fromUser,
        pointsToEachUser: req.body.points
      });
      return ack.save();
      // Note: failure means fromUser is SOL
    });
  var savedToUsersPromise = Promise
    .all([saveThumbsUpPromise, updateUserPromise])
    .then((args) => {
      // For each user, add in the received points.
      var promises = args[0].awardedToUsers.map((toUser) => {
        return User.update({ username: toUser.username },
          { $inc: { receivedPointsToSpend: req.body.points } },
          { multi: false, writeConcern: { w: 'majority' } }
        );
      });
      return Promise.all(promises);
    });
  return Promise
    .all([saveThumbsUpPromise, savedToUsersPromise])
    .then((args) => {
      // Send status, then perform the sending of values.
      res.sendStatus(201);

      notify.send('thumbs-up', args[1], {
        aaay: args[0],
        givenByUsername: fromUser.username,
        givenByName: fromUser.bestName(),
        points: req.body.points
      });
    })
    .catch((err) => {
      next(err);
    });
};
