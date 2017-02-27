'use strict';

// Helper functions to convert queried objects into a correctly
// consumable format.
// Hopefully, the model can be fixed so that the virtual versions
// do what this is doing, and this file can be deleted.

function briefUser(user) {
  // Note: this must be manually updated along with the model.
  if (typeof(user) === 'string') {
    return {
      username: user,
      uri: '/api/v1/users/' + user,
      type: 'User'
    };
  }
  return {
    username: user.username,
    organization: user.organization,
    names: user.names,
    uri: '/api/v1/users/' + user.username,
    type: 'User'
  }
};


function briefUserList(userList) {
  return userList.map(briefUser);
};


function briefAcknowledgement(ack) {
  if (typeof(ack) === 'string') {
    return {
      id: ack,
      uri: '/api/vi/aaays/' + ack,
      type: 'Aaay'
    };
  }
  return {
    id: ack._id,
    updatedAt: ack.updatedAt,
    createdAt: ack.createdAt,
    givenBy: briefUser(ack.givenByUsername),
    awardedTo: briefUserList(ack.awardedToUsernames),
    comment: ack.comment,
    tags: ack.tags,
    public: (ack.public === undefined ? true : ack.public),
    thumbsUp: ack.thumbsUp.map(function (tu) {
      return {
        id: tu.id,
        updatedAt: tu.updatedAt,
        createdAt: tu.createdAt,
        givenBy: briefUser(tu.givenByUsername)
      };
    })
  };
}


function detailedAcknowledgement(ack) {
  var ret = briefAcknowledgement(ack);
  ret.pointsToEachUser = ack.pointsToEachUser;
  for (var i = 0; i < ack.thumbsUp.length; i++) {
    ret.thumbsUp[i].pointsToEachUser = ack.thumbsUp[i].pointsToEachUser;
  }
  return ret;
}


function briefAcknowledgementList(ackList) {
  return ackList.map(briefAcknowledgement);
};


function pagedResults(pagedResults, converterFunc) {
  pagedResults.results = pagedResults.results.map(converterFunc);
  return pagedResults;
}


module.exports = {
  briefUser: briefUser,
  briefUserList: briefUserList,
  briefAcknowledgement: briefAcknowledgement,
  briefAcknowledgementList: briefAcknowledgementList,
  detailedAcknowledgement: detailedAcknowledgement,
  pagedResults: pagedResults,
}
