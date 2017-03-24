'use strict';

const testSetup = require('./test-setup');


exports.user = function(username) {
  return structForRole('User', username);
};

exports.admin = function(username) {
  return structForRole('Admin', username);
};

exports.bot = function() {
  return {
    forUser: (username) => {
      return structForBotWithRole('User', username);
    },
    forAdmin: (username) => {
      return structForBotWithRole('Admin', username);
    },
    forSelf: () => {
      return structForBotWithRole(null, null);
    }
  };
};

exports.anonymous = function() {
  return {
    get: (uri) => {
      return runAnonymousAction('get', uri, {});
    },
    post: (uri, data) => {
      return runAnonymousAction('post', uri, data);
    },
    put: (uri, data) => {
      return runAnonymousAction('put', uri, data);
    },
    patch: (uri, data) => {
      return runAnonymousAction('patch', uri, data);
    },
    delete: (uri, data) => {
      return runAnonymousAction('delete', uri, data);
    }
  };
};


function structForRole(role, username) {
  return {
    get: (uri) => {
      return runActionAs(role, 'get', username, uri, {});
    },
    post: (uri, data) => {
      return runActionAs(role, 'post', username, uri, data);
    },
    put: (uri, data) => {
      return runActionAs(role, 'put', username, uri, data);
    },
    patch: (uri, data) => {
      return runActionAs(role, 'patch', username, uri, data);
    },
    delete: (uri, data) => {
      return runActionAs(role, 'delete', username, uri, data);
    }
  };
}


function structForBotWithRole(role, username) {
  return {
    get: (uri) => {
      return runActionAsBotWith(role, 'get', username, uri, {});
    },
    post: (uri, data) => {
      return runActionAsBotWith(role, 'post', username, uri, data);
    },
    put: (uri, data) => {
      return runActionAsBotWith(role, 'put', username, uri, data);
    },
    patch: (uri, data) => {
      return runActionAsBotWith(role, 'patch', username, uri, data);
    },
    delete: (uri, data) => {
      return runActionAsBotWith(role, 'delete', username, uri, data);
    }
  };
}


function runAnonymousAction(methodName, uri, data) {
  return testSetup.request()[methodName](uri).send(data)
    .then((res) => {
      // Unify errors
      if (res.error) {
        throw res.error;
      }
      return res;
    });
}


function runActionAs(roleName, methodName, username, uri, data) {
  return testSetup['createOrGet' + roleName](createUserData(username))
    .then((user) => {
      return testSetup.getLoginToken(username, 'sekret');
    })
    .then((token) => {
      return testSetup.request()[methodName](uri)
        .set('Authorization', 'JWT ' + token)
        .send(data);
    })
    .then((res) => {
      // Unify errors
      if (res.error) {
        throw res.error;
      }
      return res;
    });
}


function runActionAsBotWith(roleName, methodName, username, uri, data) {
  var userPromise;
  if (username) {
    if (methodName == 'get') {
      if (uri.indexOf('?') < 0) {
        uri = uri + '?';
      } else {
        uri = uri + '&';
      }
      uri = uri + 'behalf=' + username;
    } else {
      data.behalf = username;
    }
    userPromise = testSetup['createOrGet' + roleName](createUserData(username));
  } else {
    userPromise = Promise.resolve(null);
  }
  return userPromise
    .then((user) => {
      return testSetup.createOrGetBot(createBotData('bot'));
    })
    .then((bot) => {
      return testSetup.getLoginToken('bot', 'bot password');
    })
    .then((token) => {
      return testSetup.request()[methodName](uri)
        .set('Authorization', 'JWT ' + token)
        .send(data);
    })
    .then((res) => {
      // Unify errors
      if (res.error) {
        throw res.error;
      }
      return res;
    });
}



function createUserData(username) {
  return {
    username: username,
    email: `${username}@fonzrecon.github`,
    names: [`User ${username}`],
    pointsToAward: 0,
    organization: 'org',
    locale: 'en',
    password: 'sekret'
  };
}


function createBotData(username) {
  return {
    username: username,
    email: `${username}@fonzrecon.github`,
    password: 'bot password'
  };
};
