'use strict';

const Acknowledgement = require('../models').Acknowledgement;
const User = require('../models').User;
const paging = require('./util').paging.extract;
const jsonConvert = require('./util').jsonConvert;
const accessLib = requrie('../lib/access');



exports.getAllBrief = function(req, res, next) {
  const username = accessLib.getRequestUsername(req);
  if (! username) {
    return next(notAuthorized());
  }

  // TODO allow for query parameters.
  var pagination = paging(req);
  return Acknowledgement
    .findBriefForUser(req.userAccount.user.username)
    .paginate(pagination)
    .then(function (results) {
      results.type = 'AaayBrief';
      res.status(200).json(jsonConvert.pagedResults(results, jsonConvert.briefAcknowledgement));
    })
    .catch(function (err) {
      next(err);
    });
};



exports.getOneBrief = function(req, res, next) {
  const username = accessLib.getRequestUsername(req);
  if (! username) {
    return next(notAuthorized());
  }

  return Acknowledgement
    .findOneBriefForUser(req.params.id, username)
    .then(function (ack) {
      if (! ack) {
        return next(resourceNotFound());
      }
      res.status(200).json({ AaayBrief: jsonConvert.briefAcknowledgement(ack) });
    })
    .catch(function (err) {
      next(err);
    });
};



exports.getOneDetails = function(req, res, next) {
  const username = accessLib.getRequestUsername(req);
  if (! username) {
    return next(notAuthorized());
  }

  return Acknowledgement
    .findOneDetailsForUser(req.params.id, username)
    .then(function (ack) {
      if (! ack) {
        return next(resourceNotFound());
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
        var err = new Error();
        err.message = 'ValidationError',
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
        var err = new Error('ValidationError');
        err.details = {
          param: 'to',
          msg: 'At least one of the given users does not exist, or there was a duplicate name.',
          value: req.body.to
        };
        err.status = 400;
        throw err;
      }
      for (var nindex = 0; nindex < fromUser.names.length; nindex++) {
        for (var tindex = 0; tindex < toUsers.length; tindex++) {
          if (toUsers[tindex].names.includes(fromUser.names[nindex])) {
            var err = new Error('ValidationError');
            err.details = {
              param: 'to',
              msg: 'Cannot send award to yourself',
              value: req.body.to
            };
            err.status = 400;
            throw err;
          }
        }
      }
      // Check if the user has enough points to give out.
      var totalGivenPoints = req.body.points * toUsers.length;
      if (fromUser.pointsToAward < totalGivenPoints) {
        var err = new Error('ValidationError');
        err.details = {
          param: 'points',
          msg: 'insufficient points',
          value: req.body.points,
          quantity: toUsers.length,
          total: totalGivenPoints
        };
        err.status = 400;
        throw err;
      }

      // Make sure we deduct the points from the user's personal spending
      // account BEFORE we create the ack.
      fromUser.pointsToAward -= totalGivenPoints;
      console.log('Saving fromUser:');console.log(fromUser.toJSON());

      // FIXME this is susseptible to a overwhelm attack - if
      // a user sends a whole bunch of simultaneous requests at once,
      // there's a chance that multiple of those can run at the same time.
      // This needs to be replaced with a "update" and condition clause.

      return fromUser.save();
    });
  var saveAckPromise = Promise
    // We need the to-users, but we also need to run after the save user.
    .all([toUsersPromise, saveUserPromise])
    .then(function (args) {
      var toUsers = args[0];
      var fromUser = args[1];
      return new Acknowledgement({
        givenByUsername: fromUser,
        awardedToUsernames: toUsers,
        pointsToEachUser: req.body.points,
        comment: req.body.comment,
        public: req.body.public || false,
        tags: req.body.tags || [],
        thumbsUp: []
      }).save();
    })
    .then(function (ack) {
      // Send status, then perform the sending of values.
      res.sendStatus(201);
    });
  return Promise
    .all([toUsersPromise, saveAckPromise])
    .then(function(args) {
      // For each user...
      var promises = args[0].map(function(toUser) {
        toUser.receivedPointsToSpend += req.body.points;
        console.log('Saving toUser:');console.log(toUser.toJSON());
        return toUser.save();
      });
      return Promise.all(promises);
    })
    .then(function(toUsers) {
      // TODO send notification to each of the users.
    })
    .catch(function (err) {
      next(err);
    });
};



exports.createThumbsUp = function(req, res, next) {
  const username = accessLib.getRequestUsername(req);
  if (! username) {
    return next(notAuthorized());
  }

  // Find the *visible* ack...
  var ackPromise = Acknowledgement
    .findOneForAddingThumbsUp(req.params.id, username)
    .then(function (ack) {
      if (! ack) {
        return next(resourceNotFound());
      }
      return ack;
    });
  // We need to load the full, savable user in the request, so that
  // the points can be deducted, if the points are available.
  var userPromise = User
    .findOne({ username: username })
    .then(function(user) {
      if (! user) {
        var err = new Error('Internal error: cannot find requesting user.');
        err.status = 500;
        throw err;
      }
      return user;
    });


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
      var ret = [ ack.givenByUsername.username ];
      for (var i = 0; i < ack.awardedToUsernames.length; i++) {
        ret.push(ack.awardedToUsernames[i].username);
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
