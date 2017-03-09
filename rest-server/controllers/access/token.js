'use strict';

const models = require('../../models');
const Account = models.Account;


exports.findAccountByToken = function(req) {
  if (! req.fingerprint) {
    console.error('No browser / request fingerprint. Is express setup?');
    return new Promise(function(resolve, reject) {
      reject(new Error('InternalError'));
    });
  }

  return Account
    .findByBrowser(req.token, req.fingerprint);
};


exports.removeToken = function(username, authName, req) {
  if (! req.fingerprint) {
    console.error('No browser / request fingerprint. Is express setup?');
    return new Promise(function(resolve, reject) {
      reject(new Error('InternalError'));
    });
  }


  var accountPromise;
  if (req.userAccount && req.userAccount.account) {
    accountPromise = new Promise(function(resolve, reject) {
      return resolve(req.userAccount.account);
    });
  } else if (req.user) {
    accountPromise = Account.findByUserRef(username);
  } else {
    accountPromise = new Promise(function(resolve, reject) { resolve(null); });
  }

  var authMethodPromise = accountPromise
    .then(function(account) {
      if (! account) {
        // This is fine.
        return null;
      }
      return account.getAuthenticationNamed(authName);
    });
  var existingTokensForReqPromise = authMethodPromise
    .then(function(authMethod) {
      if (! authMethod) {
        // Does not exist, so there's nothing to do.
        return { browsers: [], browserIndexes: [] };
      }
      //
      return authMethod.findBrowsersForFingerprint(req.fingerprint, true);
    });

  // If there's an existing browser token, then we either need to delete it.
  return Promise.
    all([accountPromise, authMethodPromise, existingTokensForReqPromise])
    .then(function(args) {
      var account = args[0];
      var authMethod = args[1];
      var existingTokens = args[2];
      if (existingTokens.browsers.length > 0) {
        // Delete the browser token by adding all the existing browsers
        // that *aren't* a match.
        var newBrowsers = [];
        for (var i = 0; i < authMethod.browsers.length; i++) {
          if (! existingTokens.browserIndexes.includes(i)) {
            newBrowsers.push(auth.browsers[i]);
          }
        }
        authMethod.browsers = newBrowsers;
      }
      // else no existing tokens that match.

      if (account) {
        return account.save();
      }
      return null;
    });
}


/**
 * Updates the account to include the new, generated token, and returns
 * in the promise the token (string) itself.
 */
exports.generateToken = function(replaceExistingToken, authName, req) {
  if (! req.fingerprint) {
    console.error('No browser / request fingerprint. Is express setup?');
    return new Promise(function(resolve, reject) {
      reject(new Error('InternalError'));
    });
  }

  var accountPromise;
  if (req.userAccount && req.userAccount.account) {
    accountPromise = new Promise(function(resolve, reject) {
      return resolve(req.userAccount.account);
    });
  } else if (req.user) {
    accountPromise = new Promise(function(resolve, reject) {
      resolve(req.user);
    });
  } else {
    return new Promise(function(resolve, reject) {
      reject(new Error('InternalError'));
    });
  }

  var authMethodPromise = accountPromise
    .then(function(account) {
      if (! account) {
        var err = new Error('Unauthorized');
        err.status = 401;
        throw err;
      }
      return account.getAuthenticationNamed(authName);
    });
  var existingTokensForReqPromise = authMethodPromise
    .then(function(authMethod) {
      if (! authMethod) {
        // Does not exist, which means the account isn't setup to
        // handle this kind of token authentication.
        var err = new Error('Account cannot login with ' + authName);
        err.status = 401;
        throw err;
      }
      return authMethod.findBrowsersForFingerprint(req.fingerprint, false);
    });

  // If there's an existing browser token, then we either need to delete it
  // or raise an error.
  var browserToken = Promise.
    all([accountPromise, authMethodPromise, existingTokensForReqPromise])
    .then(function(args) {
      var account = args[0];
      var authMethod = args[1];
      var existingTokens = args[2];
      if (existingTokens.browsers.length > 0) {
        if (! replaceExistingToken) {
          var err = new Error('Already authenticated.  Cannot create new token.');
          err.status = 401;
          throw err;
        }
        // Delete the browser token by adding all the existing browsers
        // that *aren't* a match.
        var newBrowsers = [];
        for (var i = 0; i < authMethod.browsers.length; i++) {
          if (! existingTokens.browserIndexes.includes(i)) {
            newBrowsers.push(auth.browsers[i]);
          }
        }
        authMethod.browsers = newBrowsers;
      }
      // else no existing tokens that match.

      // Create the new token.
      return authMethod.generateBrowserEntry(req.fingerprint);
    });

  // Save the account after the browser token was created.
  var savedAccount = Promise
    .all([accountPromise, browserToken])
    .then(function(args) {
      console.log(`Saving account`);
      return args[0].save();
    });

  return Promise
    .all([savedAccount, browserToken])
    .then(function(args) {
      return args[1];
    });
};
