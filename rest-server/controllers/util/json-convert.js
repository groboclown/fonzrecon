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
    type: 'UserBrief'
  }
};


function briefUserList(userList) {
  return userList.map(briefUser);
};


function briefAcknowledgement(ack) {
  if (typeof(ack) === 'string') {
    return {
      id: ack,
      uri: '/api/v1/aaays/' + ack,
      type: 'AaayBrief'
    };
  }
  return {
    id: ack._id,
    uri: '/api/v1/aaays/' + ack._id,
    type: 'AaayBrief',
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
        givenBy: briefUser(tu.givenByUsername),
        type: 'ThumbsUpBrief'
      };
    })
  };
}


function detailedAcknowledgement(ack) {
  var ret = briefAcknowledgement(ack);
  ret.pointsToEachUser = ack.pointsToEachUser;
  ret.uri = ret.uri + '/details';
  ret.type = 'Aaay'
  for (var i = 0; i < ack.thumbsUp.length; i++) {
    ret.thumbsUp[i].pointsToEachUser = ack.thumbsUp[i].pointsToEachUser;
    ret.thumbsUp[i].type = 'ThumbsUp';
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
