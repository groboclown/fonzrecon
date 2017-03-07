'use strict';


// Helper functions to convert queried objects into a correctly
// consumable format.
// Hopefully, the model can be fixed so that the virtual versions
// do what this is doing, and this file can be deleted.

exports.briefUser = function(user) {
  // Note: this must be manually updated along with the model.
  if (typeof(user) === 'object' && ! user._id && typeof(user.toString) === 'function') {
    user = user.toString();
  }
  if (typeof(user) === 'string') {
    return {
      username: user,
      uri: '/api/v1/users/' + user,
      type: 'UserBriefRef'
    };
  }
  return {
    username: user.username,
    organization: user.organization,
    names: user.names,
    uri: '/api/v1/users/' + user.username,
    imageUri:  (user.image ? `/images/users/${user.username}.png` : null),
    type: 'UserBrief'
  };
};

exports.user = function(_user) {
  var ret = exports.briefUser(_user);
  if (ret.type === 'UserBriefRef') {
    return ret;
  }
  ret.uri += '/details';
  ret.type = 'User';
  ret.createdAt = _user.createdAt;
  ret.updatedAt = _user.updatedAt;
  ret.pointsToAward = _user.pointsToAward;
  ret.receivedPointsToSpend = _user.receivedPointsToSpend;
  ret.contact = _user.contact.map(function (c) {
    return {
      type: c.type,
      server: c.server,
      address: c.address
    };
  });
  return ret;
};


exports.briefUserList = function(userList) {
  return userList.map(exports.briefUser);
};


/**
 */
exports.acknowledgement = function(ack, canViewDetails) {
  if (typeof(ack) === 'object' && ! ack._id && typeof(ack.toString) === 'function') {
    ack = ack.toString();
  }
  if (typeof(ack) === 'string') {
    return {
      id: ack,
      uri: '/api/v1/aaays/' + ack,
      type: 'AaayRef'
    };
  }
  return {
    id: ack._id,
    uri: '/api/v1/aaays/' + ack._id,
    type: 'Aaay',
    updatedAt: ack.updatedAt,
    createdAt: ack.createdAt,
    pointsToEachUser: canViewDetails ? ack.pointsToEachUser : null,
    givenBy: exports.briefUser(ack.givenByUser),
    awardedTo: exports.briefUserList(ack.awardedToUsers),
    comment: ack.comment,
    tags: ack.tags,
    public: ack.public,
    thumbsUps: ack.thumbsUps.map(function (tu) {
      return {
        id: tu.id,
        updatedAt: tu.updatedAt,
        createdAt: tu.createdAt,
        givenBy: exports.briefUser(tu.givenByUser),
        comment: tu.comment,
        pointsToEachUser: canViewDetails ? tu.pointsToEachUser : null,
        type: 'ThumbsUp'
      };
    })
  };
}


exports.acknowledgementList = function(ackList, canViewDetails) {
  return ackList.map(function(ack) { exports.acknowledgement(ack, canViewDetails) });
};


exports.prize = function(prizeObj) {
  if (typeof(prizeObj) === 'object' && ! prizeObj._id && typeof(prizeObj.toString) === 'function') {
    prizeObj = prizeObj.toString();
  }
  if (typeof(prizeObj) === 'string') {
    return {
      id: prizeObj,
      uri: '/api/v1/prizes/' + prizeObj,
      type: 'PrizeRef'
    };
  }
  return {
    id: prizeObj._id,
    name: prizeObj.name,
    description: prizeObj.description,
    referenceUrl: prizeObj.referenceUrl,
    purchasePoints: prizeObj.purchasePoints,
    expires: prizeObj.expires,
    uri: '/api/v1/prizes/' + prizeObj._id,
    type: 'Prize'
  }
};



exports.claimedPrize = function(claimed) {
  if (typeof(claimed) === 'object' && ! claimed._id && typeof(claimed.toString) === 'function') {
    claimed = claimed.toString();
  }
  if (typeof(claimed) === 'string') {
    return {
      id: claimed,
      uri: '/api/v1/claimed-prizes/' + claimed,
      type: 'ClaimedPrizeRef'
    };
  }
  return {
    id: claimed._id,
    claimedByUser: exports.briefUser(claimed.claimedByUser),
    prize: exports.prize(claimed.prize),
    uri: '/api/v1/claimed-prizes/' + claimed._id,
    createdAt: claimed.createdAt,
    type: 'ClaimedPrize'
  }
};



exports.pagedResults = function(pagedResults, converterFunc) {
  pagedResults.results = pagedResults.results.map(converterFunc);
  return pagedResults;
}
