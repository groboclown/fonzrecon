'use strict';

/**
 * Each source object must provide these functions
 * (they all return promises):
 *
 * * onUserInfoSaved(userInfo);
 * * onLogin(reqAuthData, userInfo);
 */
exports.sourceMethodNames = [
  // This is a special hook for the 'save' function;
  // it is not added to the AuthenticationMethodSchema methods.
  // onUserInfoSaved

  'onLogin',
];

exports.sources = {
  local: require('./local'),
};

exports.sourceNames = [];
for (var k in exports.sources) {
  if (exports.sources.hasOwnProperty(k)) {
    exports.sourceNames.push(k);
  }
}
