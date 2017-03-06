'use strict';

const roles = require('../../config/access/roles');



exports.getCanViewAckDetailsFunc = function(req, reqUser) {
  if (exports.canViewPrivate(req)) {
    return function() { return true; };
  }
  const username = reqUser.username;
  return function(ack) {
    if (ack.givenByUser.username === username) {
      return true;
    }
    for (var i = 0; i < ack.awardedToUsers.length; i++) {
      if (ack.awardedToUsers[i].username === username) {
        return true;
      }
    }
    return false;
  };
};



exports.canViewPrivate = function(req) {
  const account = req.userAccount.account;
  if (! account || ! account.role) {
    return false;
  }
  const role = roles[account.role];
  if (! role || ! role.permissions.ACKNOWLEDGEMENT_PRIVATE_VIEW) {
    console(`no role for account: ${role}`);
    return false;
  }
  console.log(`role ${role.name} private view? ${role.permissions.ACKNOWLEDGEMENT_PRIVATE_VIEW([])}`);
  return role.permissions.ACKNOWLEDGEMENT_PRIVATE_VIEW([]);
};
