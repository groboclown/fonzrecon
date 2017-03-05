'use strict';

const Acknowledgement = require('../models').Acknowledgement;
const User = require('../models').User;
const paging = require('./util').paging.extract;
const jsonConvert = require('./util').jsonConvert;
const accessLib = require('../lib/access');



exports.getAllBrief = function(req, res, next) {
  const username = accessLib.getRequestUsername(req);
  if (! username) {
    return next(notAuthorized());
  }

  var pagination = paging(req);

  var condition = {};
  var usernameQuery = [ username ];
  var usernameIds = {};
  var usernameConditions = [];
  var reqUser = req.body.name || req.query.name;
  if (reqUser) {
    usernameConditions.push(reqUser);
    usernameQuery.push(reqUser);
  }
  var reqComment = req.body.comment || req.query.comment;
  if (reqComment) {
    condition.comment = new RegExp('.*' +
      reqComment.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') +
      '.*');
  }

  // Acks store references to the user object, so we
  // must first fetch the user object and use that in the query.
  return User
    .find({ names: { $in: usernameQuery } })
    .then(function(users) {
      var i, j;
      for (i = 0; i < users.length; i++) {
        for (j = 0; j < users[i].names.length; j++) {
          usernameIds[users[i].names[j]] = users[i];
        }
      }
      if (! usernameIds[username]) {
        // User does not actually exist... strange.
        throw notAuthorized();
      }
      if (usernameConditions.length > 0) {
        var queryUsers = [];
        for (i = 0; i < usernameConditions.length; i++) {
          if (usernameIds[usernameConditions[i]]) {
            queryUsers.push(usernameIds[usernameConditions[i]]);
          } else {
            // User does not exist, so there's no results.
            return { results: [], options: {}, current: 1, last: 1, prev: null, next: null, pages: [], count: 0 };
          }
        }
        condition.$or = [
          { givenByUser: { $in: queryUsers } },
          { awardedToUsers: { $in: queryUsers } },
          // Not including thumbs ups intentionally.
        ];
      }

      return Acknowledgement
        .findBriefForUser(usernameIds[username], condition)
        .paginate(pagination);
    })
    .then(function (results) {
      results.type = 'AaayBrief';
      res.status(200).json(jsonConvert.pagedResults(results, jsonConvert.briefAcknowledgement));
    })
    .catch(function (err) {
      next(err);
    });
};



exports.getOneBrief = function(req, res, next) {
  const user = accessLib.getRequestUser(req);
  if (! user) {
    return next(notAuthorized());
  }

  return Acknowledgement
    .findOneBriefForUser(req.params.id, user)
    .then(function (ack) {
      if (! ack) {
        throw resourceNotFound();
      }
      res.status(200).json({ AaayBrief: jsonConvert.briefAcknowledgement(ack) });
    })
    .catch(function (err) {
      next(err);
    });
};



exports.getOneDetails = function(req, res, next) {
  const user = accessLib.getRequestUser(req);
  if (! user) {
    return next(notAuthorized());
  }

  return Acknowledgement
    .findOneDetailsForUser(req.params.id, user)
    .then(function (ack) {
      if (! ack) {
        throw resourceNotFound();
      }
      ack.type = 'Aaay';
      res.status(200).json({ Aaay: jsonConvert.detailedAcknowledgement(ack) });
    })
    .catch(function (err) {
      next(err);
    })
}



exports.create = function(req, res, next) {
  const username = accessLib.getRequestUsername(req);
  if (! username) {
    return next(notAuthorized());
  }

  req.checkBody({
    to: {
      // list of "names" for the user, not usernames!
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

  // We need to get the full user object that's writable.
  var fromUserPromise = User
    .findOne({ username: username })
    .exec()
    .then(function (user) {
      if (! user) {
        var err = new Error('Internal error: cannot find requesting user.');
        err.status = 500;
        throw err;
      }
      return user;
    });
  var toUsersPromise = req.getValidationResult()
    .then(function (results) {
      if (! results.isEmpty()) {
        var err = new Error('ValidationError');
        err.details = results.array();
        err.status = 400;
        throw err;
      }

      // Ensure the list of acknowledged users exist.
      // We need to keep this list for future population
      // and
      return User
        .find()
        // request is for the name, not username.
        .where('names').in(req.body.to)
        .exec();
    });
  var saveUserPromise = Promise
    .all([fromUserPromise, toUsersPromise])
    .then(function (args) {
      var fromUser = args[0];
      var toUsers = args[1];
      if (toUsers.length !== req.body.to.length) {
        // Did not find all the users
        throw extraValidationProblem('to', req.body.to,
          'At least one of the given users does not exist, or there was a duplicate name.');
      }
      for (var nindex = 0; nindex < fromUser.names.length; nindex++) {
        for (var tindex = 0; tindex < toUsers.length; tindex++) {
          if (toUsers[tindex].names.includes(fromUser.names[nindex])) {
            throw extraValidationProblem('to', req.body.to,
              'Cannot send award to yourself');
          }
        }
      }
      // Check if the user has enough points to give out.
      var totalGivenPoints = req.body.points * toUsers.length;
      if (fromUser.pointsToAward < totalGivenPoints) {
        var err = new Error('ValidationError');
        err.details = [{
          param: 'points',
          msg: 'insufficient points',
          value: req.body.points,
          quantity: toUsers.length,
          total: totalGivenPoints
        }];
        err.status = 400;
        throw err;
      }

      // Rather than just saving the object with the deducted points,
      // the user is updated when it has the minimum number of points.
      // This way, we allow for some level of mid-air collision, but
      // still force the business rule to be valid.
      return User.update({
          username: fromUser.username,
          // Must have at least totalGivenPoints available to give.
          pointsToAward: { $gte: totalGivenPoints }
        },

        // Deduct the given points
        { $inc: { pointsToAward: -totalGivenPoints } }, {
          // We want the update to only update one document,
          // and have the safest update commit possible.
          // "j: true" write concern would be nice, but that will
          // produce an error if the DB does not have journaling
          // turned on.  However, "majority" uses the safest means,
          // so it will confirm when the journal is updated if the
          // db has journalling.
          multi: false,
          writeConcern: {
            w: "majority"
          }
        });
    })
    .then(function(numUpdated) {
      if (numUpdated > 1) {
        throw new Error('Inconsistent DB state: multiple users with same name');
      }
      if (numUpdated < 1) {
        // Alternatively, the user may not exist, but this is by far the
        // more common alternative.  And if the user, for some reason, was
        // suddenly removed at this point, then this error is okay, too,
        // because a non-existent user doesn't have any points ;)
        var err = new Error('ValidationError');
        err.details = [{
          param: 'points',
          msg: 'insufficient points',
          value: req.body.points,
          quantity: toUsers.length,
          total: totalGivenPoints
        }];
        err.status = 400;
        throw err;
      }
      // Nothing to return.
      return null;
    });
  var saveAckPromise = Promise
    // We need the to-users, but we also need to run after the save user.
    .all([toUsersPromise, fromUserPromise, saveUserPromise])
    .then(function (args) {
      var toUsers = args[0];
      var fromUser = args[1];
      var pub = req.body.public;
      if (typeof(req.body.public) === 'undefined') {
        pub = true;
      } else if (typeof(req.body.public) === 'string') {
        pub = req.body.public !== 'false';
      } else {
        pub = !! req.body.public;
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

    // FIXME if the save fails, then the user is SOL - the points
    // are just lost.  Really, we should roll back the lost points.
  var updatedUsersPromise = Promise
    .all([toUsersPromise, saveAckPromise])
    .then(function(args) {
      // For each user, add in the received points.
      var promises = args[0].map(function(toUser) {
        return User.update({ username: toUser.username },
          { $inc: { receivedPointsToSpend: req.body.points } },
          { multi: false, writeConcern: { w: "majority" } }
        );
      });
      return Promise.all(promises);
    });

  return Promise
    .all([updatedUsersPromise, saveAckPromise])
    .then(function(args) {
      var toUsers = args[0];
      var ack = args[1];

      // Send status, then perform the sending of values.
      // Note that this is sending the very specific ID form.
      res.status(201).json(jsonConvert.briefAcknowledgement(ack._id));

      // TODO send notification to each of the users.
      console.log('Should send notification to ' + toUsers)
    })
    .catch(function (err) {
      next(err);
    });
};



exports.createThumbsUp = function(req, res, next) {
  // This user object is a "lean" object, so we must
  // retrieve it again.
  const reqUser = accessLib.getRequestUser(req);
  if (! reqUser) {
    return next(notAuthorized());
  }
  const username = reqUser.username;

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
  var ackPromise = Acknowledgement
    .findOneForAddingThumbsUp(req.params.id, reqUser)
    .exec()
    .then(function(ack) {
      var i;

      // If the user requesting the thumbs up is in the acknowledgement,
      // or has already given a thumbs up, then don't allow this.
      if (ack.givenByUser.username === username) {
        throw extraValidationProblem('user', username,
          'user already added to the aaay');
      }
      // TODO allow for a user who was awarded to add to the thumbs up
      // if there are other people in the list.  But it should also
      // not award the points to the user who gave the thumbs up.
      for (i = 0; i < ack.awardedToUsers.length; i++) {
        if (ack.awardedToUsers[i].username === username) {
          throw extraValidationProblem('user', username,
            'user already added to the aaay');
        }
      }

      for (i = 0; i < ack.thumbsUps.length; i++) {
        if (ack.thumbsUps[i].givenByUser.username === username) {
          throw extraValidationProblem('user', username,
            'user already added to the aaay');
        }
      }

      return ack;
    });

  // We need to load the full, savable user in the request, so that
  // the points can be deducted, if the points are available.
  var fromUserPromise = req.getValidationResult()
    .then(function (results) {
      if (! results.isEmpty()) {
        var err = new Error();
        err.message = 'ValidationError',
        err.details = results.array();
        err.status = 400;
        throw err;
      }
      return User
        .findOne({ username: username })
    });

  var updateUserPromise = Promise
    .all([ackPromise, fromUserPromise])
    .then(function(args) {
      var ack = args[0];
      var fromUser = args[1];
      if (! fromUser) {
        throw new Error('Internal error: cannot find requesting user.');
      }
      if (! ack) {
        throw resourceNotFound();
      }

      // Check if the user has enough points to give out.
      var totalGivenPoints = req.body.points * ack.awardedToUsers.length;
      if (fromUser.pointsToAward < totalGivenPoints) {
        var err = new Error('ValidationError');
        err.details = [{
          param: 'points',
          msg: 'insufficient points',
          value: req.body.points,
          quantity: toUsers.length,
          total: totalGivenPoints
        }];
        err.status = 400;
        throw err;
      }

      // Rather than just saving the object with the deducted points,
      // the user is updated when it has the minimum number of points.
      // This way, we allow for some level of mid-air collision, but
      // still force the business rule to be valid.
      return User.update({
          username: fromUser.username,
          // Must have at least totalGivenPoints available to give.
          pointsToAward: { $gte: totalGivenPoints }
        },

        // Deduct the given points
        { $inc: { pointsToAward: -totalGivenPoints } }, {
          // We want the update to only update one document,
          // and have the safest update commit possible.
          // "j: true" write concern would be nice, but that will
          // produce an error if the DB does not have journaling
          // turned on.  However, "majority" uses the safest means,
          // so it will confirm when the journal is updated if the
          // db has journalling.
          multi: false,
          writeConcern: {
            w: "majority"
          }
        }).exec();
    })
    .then(function(numUpdated) {
      if (numUpdated > 1) {
        throw new Error('Inconsistent DB state: multiple users with same name');
      }
      if (numUpdated < 1) {
        // Alternatively, the user may not exist, but this is by far the
        // more common alternative.  And if the user, for some reason, was
        // suddenly removed at this point, then this error is okay, too,
        // because a non-existent user doesn't have any points ;)
        var err = new Error('ValidationError');
        err.details = [{
          param: 'points',
          msg: 'insufficient points',
          value: req.body.points,
          quantity: toUsers.length,
          total: totalGivenPoints
        }];
        err.status = 400;
        throw err;
      }
      // Nothing to return.
      return null;
    });
  var saveThumbsUpPromise = Promise
    .all([ackPromise, fromUserPromise, updateUserPromise])
    .then(function(args) {
      var ack = args[0];
      var fromUser = args[1];
      ack.thumbsUps.push({
        givenByUser: fromUser,
        pointsToEachUser: req.body.points
      });
      return ack.save();
    });
    // note: failure means fromUser is SOL
  return Promise
    .all([saveThumbsUpPromise, updateUserPromise])
    .then(function(args) {
      // For each user, add in the received points.
      var promises = args[0].awardedToUsers.map(function(toUser) {
        return User.update({ username: toUser.username },
          { $inc: { receivedPointsToSpend: req.body.points } },
          { multi: false, writeConcern: { w: "majority" } }
        );
      });
      return Promise.all(promises);
    })
    .then(function(toUsers) {
      // Send status, then perform the sending of values.
      res.sendStatus(201);

      // TODO send notification to each of the users.
      console.log('Should send notification to ' + toUsers)
    })
    .catch(function (err) {
      next(err);
    });
};



exports.getUsersInAcknowledgement = function(req) {
  const ackId = req.params.id;

  return Acknowledgement
    .findOneBrief({ _id: ackId })
    .then(function(ack) {
      if (! ack) {
        return [];
      }
      var ret = [ ack.givenByUser.username ];
      for (var i = 0; i < ack.awardedToUsers.length; i++) {
        ret.push(ack.awardedToUsers[i].username);
      }
      return ret;
    });
}


function resourceNotFound() {
  var err = new Error('Resource not found');
  err.status = 404;
  return err;
}

function notAuthorized() {
  var err = new Error('Forbidden');
  err.status = 403;
  return err;
}

function extraValidationProblem(param, value, description) {
  var err = new Error('ValidationError');
  err.details = [{
    msg: description,
    param: param,
    value: value
  }];
  err.status = 400;
  return err;
}
