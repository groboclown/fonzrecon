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
const email = require('../../lib/email');


function findUsersReferenced(toUserNames, isBotWithBehalf) {
  return User
    .find()
    // Request is for the name, not username.
    .where('names').in(toUserNames)
    .exec()
    .then((toUsers) => {
      // We don't create users if they were requested but don't exist.
      if (!toUsers || toUsers.length !== toUserNames.length) {
        // Did not find all the users
        throw errors.extraValidationProblem('to', toUserNames,
          'At least one of the given users does not exist, or there was a duplicate name.');
      }
      // We have all the requested users.  Return them immediately.
      return toUsers;
    });
}



exports.create = function(req, res, next) {
  const fromUser = accessLib.getRequestUser(req);
  if (!fromUser) {
    return next(errors.notAuthorized());
  }

  req.checkBody({
    to: {
      // List of "names" for the user, not usernames!
      isArrayOfString: {
        options: 1,
        errorMessage: 'Missing "to" list of users'
      }
    },
    points: {
      isInt: {
        options: {
          gt: 0
        },
        errorMessage: 'must be present and positive.'
      }
    },
    public: {
      optional: true,
      isBoolean: {
        errorMessage: 'must be true or false'
      }
    },
    comment: {
      isLength: {
        options: {
          gt: 4,
          lt: 4000
        },
        errorMessage: 'must be more than 4 characters, and less than 4000'
      }
    },
    tags: {
      isArrayOfString: {
        options: 0,
        errorMessage: 'must a list of strings'
      },
      optional: true
    }
  });

  var toUsersPromise = req.getValidationResult()
    .then((results) => {
      if (!results.isEmpty()) {
        throw errors.validationProblems(results.array());
      }

      // Only set if the user is running on behalf of someone.  Only
      // accounts with the "bot" role can have the canRunOnBehalfOf
      // flag set, which allows for  the behalf user variable to be
      // set.
      var isBotWithBehalf = !!req.userAccount.behalf;
      return findUsersReferenced(req.body.to, isBotWithBehalf);
    });
  var saveUserPromise = toUsersPromise
    .then((toUsers) => {
      if (!toUsers || toUsers.length !== req.body.to.length) {
        // Did not find all the users
        throw errors.extraValidationProblem('to', req.body.to,
          'At least one of the given users does not exist, or there was a duplicate name.');
      }
      for (var tindex = 0; tindex < toUsers.length; tindex++) {
        if (toUsers[tindex]._id === fromUser._id) {
          throw errors.extraValidationProblem('to', req.body.to,
            'Cannot send award to yourself');
        }
      }
      // Check if the user has enough points to give out.
      var totalGivenPoints = req.body.points * toUsers.length;
      if (fromUser.pointsToAward < totalGivenPoints) {
        throw errors.validationProblems([{
          param: 'points',
          msg: 'insufficient points',
          value: req.body.points,
          quantity: toUsers.length,
          total: totalGivenPoints
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
        )
        .exec();
    })
    .then((numUpdated) => {
      // Validation of user update
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
          value: req.body.points,
          quantity: toUsers.length,
          total: totalGivenPoints
        }]);
      }
      // Nothing to return.
      return null;
    });
  var saveAckPromise = Promise
    // We need the to-users, but we also need to run after the save user.
    .all([toUsersPromise, saveUserPromise])
    .then((args) => {
      var toUsers = args[0];
      var pub = req.body.public;
      if (typeof(req.body.public) === 'undefined') {
        pub = true;
      } else if (typeof(req.body.public) === 'string') {
        pub = req.body.public !== 'false';
      } else {
        pub = !!req.body.public;
      }
      return new Acknowledgement({
        givenByUser: fromUser,
        awardedToUsers: toUsers,
        pointsToEachUser: req.body.points,
        comment: req.body.comment,
        public: pub,
        tags: req.body.tags || [],
        thumbsUps: []
      }).save();
    })
    .catch((err) => {
      // FIXME if the save fails, then the user is SOL - the points
      // are just lost.  Really, we should roll back the lost points.
      console.error(`User ${fromUser.username} deducted points but ack did not save right.`);
      console.log(err.message);
      console.log(err.stack);
      throw err;
    });


  var updatedUsersPromise = Promise
    .all([toUsersPromise, saveAckPromise])
    .then((args) => {
      // For each user, add in the received points.
      var promises = args[0].map((toUser) => {
        return User.update({ username: toUser.username },
          { $inc: { receivedPointsToSpend: req.body.points } },
          { multi: false, writeConcern: { w: 'majority' } }
        );
      });
      return Promise.all(promises);
    });

  return Promise
    .all([toUsersPromise, saveAckPromise, updatedUsersPromise])
    .then((args) => {
      var toUsers = args[0];
      var ack = args[1];

      // Send status, then perform the sending of values.
      // Note that this is sending the very specific ID form.
      res.status(201).json(jsonConvert.acknowledgement(ack._id, false));

      email.send('new-aaay', toUsers, {
        aaay: ack
      });
    })
    .catch((err) => {
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
      var ret = [ ack.givenByUser.username ];
      for (var i = 0; i < ack.awardedToUsers.length; i++) {
        ret.push(ack.awardedToUsers[i].username);
      }
      return ret;
    });
}
