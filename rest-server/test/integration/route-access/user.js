'use strict';

const assert = require('chai').assert;
const testSetup = require('../../util/test-setup');
const runAs = require('../../util/run-as');

// ==========================================================================
describe('Access GET /api/v1/users', () => {
  before(testSetup.beforeDb);

  it('Not logged in', () => {
    return runAs.anonymous().get('/api/v1/users')
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').get('/api/v1/users')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for Admin', () => {
    return runAs.bot().forAdmin('testadmin').get('/api/v1/users')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As User', () => {
    return runAs.user('testuser').get('/api/v1/users')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for User', () => {
    return runAs.bot().forUser('testuser').get('/api/v1/users')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot', () => {
    return runAs.bot().forSelf().get('/api/v1/users')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });
});


// ==========================================================================
describe('Access GET /api/v1/users/:id', () => {
  before(testSetup.beforeDb);

  beforeEach(() => {
    return testSetup.createOrGetUser({
      username: 'testuser',
      email: `testuser@fonzrecon.github`,
      names: [`User Test`],
      pointsToAward: 0,
      organization: 'org',
      locale: 'en',
      password: 'sekret'
    })
  });

  it('Not logged in', () => {
    return runAs.anonymous().get('/api/v1/users/testuser')
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').get('/api/v1/users/testuser')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for Admin', () => {
    return runAs.bot().forAdmin('testadmin').get('/api/v1/users/testuser')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Self User', () => {
    return runAs.user('testuser').get('/api/v1/users/testuser')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for Self User', () => {
    return runAs.bot().forUser('testuser').get('/api/v1/users/testuser')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Other User', () => {
    return runAs.user('otheruser').get('/api/v1/users/testuser')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for Other User', () => {
    return runAs.bot().forUser('otheruser').get('/api/v1/users/testuser')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot', () => {
    return runAs.bot().forSelf().get('/api/v1/users/testuser')
      .then((res) => {
        // A bot can query the list of users on its own; this is for
        // determining whether a user exists in the system for specific
        // requests.
        assert.equal(res.status, 200, 'status');
      });
  });
});


// ==========================================================================
describe('Access GET /api/v1/users/:id/details', () => {
  before(testSetup.beforeDb);

  beforeEach(() => {
    return testSetup.createOrGetUser({
      username: 'testuser',
      email: `testuser@fonzrecon.github`,
      names: [`User Test`],
      pointsToAward: 0,
      organization: 'org',
      locale: 'en',
      password: 'sekret'
    })
  });

  it('Not logged in', () => {
    return runAs.anonymous().get('/api/v1/users/testuser/details')
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').get('/api/v1/users/testuser/details')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for Admin', () => {
    return runAs.bot().forAdmin('testadmin').get('/api/v1/users/testuser/details')
      .then((res) => {
        // An admin running through a bot has normal user access.
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Self User', () => {
    return runAs.user('testuser').get('/api/v1/users/testuser/details')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for Self User', () => {
    return runAs.bot().forUser('testuser').get('/api/v1/users/testuser/details')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Other User', () => {
    return runAs.user('otheruser').get('/api/v1/users/testuser/details')
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot for Other User', () => {
    return runAs.bot().forUser('otheruser').get('/api/v1/users/testuser/details')
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot', () => {
    return runAs.bot().forSelf().get('/api/v1/users/testuser/details')
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });
});


// ==========================================================================
describe('Access POST /api/v1/users', () => {
  before(testSetup.beforeDb);

  it('Not logged in', () => {
    return runAs.anonymous().post('/api/v1/users', createOneUserData('user1'))
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As User', () => {
    return runAs.user('otheruser').post('/api/v1/users', createOneUserData('user1'))
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot for User', () => {
    return runAs.bot().forUser('otheruser').post('/api/v1/users', createOneUserData('user1'))
      .then((res) => {
        // Bots running as users can create users, so that the bot, which may
        // have deeper knowledge of the actual domain of users, can construct
        // a new user if it hasn't been created in this site.
        assert.equal(res.status, 201, 'status');
      });
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').post('/api/v1/users', createOneUserData('user1'))
      .then((res) => {
        assert.equal(res.status, 201, 'status');
      });
  });

  it('As Bot for Admin', () => {
    return runAs.bot().forAdmin('testadmin').post('/api/v1/users', createOneUserData('user1'))
      .then((res) => {
        assert.equal(res.status, 201, 'status');
      });
  });

  it('As Bot', () => {
    return runAs.bot().forSelf().post('/api/v1/users', createOneUserData('user1'))
      .then((res) => {
        assert.equal(res.status, 201, 'status');
      });
  });
});


// ==========================================================================
describe('Access PUT /api/v1/users/:id', () => {
  before(testSetup.beforeDb);

  beforeEach(() => {
    return testSetup.createOrGetUser({
      username: 'testuser',
      email: `testuser@fonzrecon.github`,
      names: [`User Test`],
      pointsToAward: 0,
      organization: 'org',
      locale: 'en',
      password: 'sekret'
    })
  });

  it('Not logged in', () => {
    return runAs.anonymous().put('/api/v1/users/testuser', createOneUserData('testuser'))
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Self User', () => {
    return runAs.user('testuser').put('/api/v1/users/testuser', createOneUserData('testuser'))
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for Self User', () => {
    return runAs.bot().forUser('testuser').put('/api/v1/users/testuser', createOneUserData('testuser'))
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Other User', () => {
    return runAs.user('otheruser').put('/api/v1/users/testuser', createOneUserData('testuser'))
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot for Other User', () => {
    return runAs.bot().forUser('otheruser').put('/api/v1/users/testuser', createOneUserData('testuser'))
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').put('/api/v1/users/testuser', createOneUserData('testuser'))
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for Admin', () => {
    return runAs.bot().forAdmin('testadmin').put('/api/v1/users/testuser', createOneUserData('testuser'))
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot', () => {
    return runAs.bot().forSelf().put('/api/v1/users/testuser', createOneUserData('testuser'))
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });
});


// ==========================================================================
describe('Access DELETE /api/v1/users/:id', () => {
  before(testSetup.beforeDb);

  beforeEach(() => {
    return testSetup.createOrGetUser({
      username: 'testuser',
      email: `testuser@fonzrecon.github`,
      names: [`User Test`],
      pointsToAward: 0,
      organization: 'org',
      locale: 'en',
      password: 'sekret'
    })
  });

  it('Not logged in', () => {
    return runAs.anonymous().delete('/api/v1/users/testuser', {})
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Self User', () => {
    return runAs.user('testuser').delete('/api/v1/users/testuser', {})
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot for Self User', () => {
    return runAs.bot().forUser('testuser').delete('/api/v1/users/testuser', {})
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Other User', () => {
    return runAs.user('otheruser').delete('/api/v1/users/testuser', {})
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot for Other User', () => {
    return runAs.bot().forUser('otheruser').delete('/api/v1/users/testuser', {})
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').delete('/api/v1/users/testuser', {})
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for Admin', () => {
    return runAs.bot().forAdmin('testadmin').delete('/api/v1/users/testuser', {})
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot', () => {
    return runAs.bot().forSelf().delete('/api/v1/users/testuser', {})
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });
});


// ==========================================================================
describe('Access POST /api/v1/users/batch-import', () => {
  before(testSetup.beforeDb);

  it('Not logged in', () => {
    return runAs.anonymous().post('/api/v1/users/batch-import', createManyUserData())
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As User', () => {
    return runAs.user('otheruser').post('/api/v1/users/batch-import', createManyUserData())
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot for User', () => {
    return runAs.bot().forUser('otheruser').post('/api/v1/users/batch-import', createManyUserData())
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').post('/api/v1/users/batch-import', createManyUserData())
      .then((res) => {
        assert.equal(res.status, 201, 'status');
      });
  });

  it('As Bot for Admin', () => {
    return runAs.bot().forAdmin('testadmin').post('/api/v1/users/batch-import', createManyUserData())
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot', () => {
    return runAs.bot().forSelf().post('/api/v1/users/batch-import', createManyUserData())
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });
});


// ==========================================================================
describe('Access PUT /api/v1/users/:id/role', () => {
  before(testSetup.beforeDb);

  beforeEach(() => {
    return testSetup.createOrGetUser({
      username: 'testuser',
      email: `testuser@fonzrecon.github`,
      names: [`User Test`],
      pointsToAward: 0,
      organization: 'org',
      locale: 'en',
      password: 'sekret'
    })
  });

  it('Not logged in', () => {
    return runAs.anonymous().put('/api/v1/users/testuser/role', { role: 'ADMIN' })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Self User', () => {
    return runAs.user('testuser').put('/api/v1/users/testuser/role', { role: 'ADMIN' })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot for Self User', () => {
    return runAs.bot().forUser('testuser').put('/api/v1/users/testuser/role', { role: 'ADMIN' })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Other User', () => {
    return runAs.user('otheruser').put('/api/v1/users/testuser/role', { role: 'ADMIN' })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot for Other User', () => {
    return runAs.bot().forUser('otheruser').put('/api/v1/users/testuser/role', { role: 'ADMIN' })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').put('/api/v1/users/testuser/role', { role: 'ADMIN' })
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for Admin', () => {
    return runAs.bot().forAdmin('testadmin').put('/api/v1/users/testuser/role', { role: 'ADMIN' })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot', () => {
    return runAs.bot().forSelf().put('/api/v1/users/testuser/role', { role: 'ADMIN' })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });
});


// ==========================================================================
describe('Access PUT /api/v1/users/reset-points-to-award', () => {
  before(testSetup.beforeDb);

  it('Not logged in', () => {
    return runAs.anonymous().put('/api/v1/users/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As User', () => {
    return runAs.user('testuser').put('/api/v1/users/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot for User', () => {
    return runAs.bot().forUser('testuser').put('/api/v1/users/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').put('/api/v1/users/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for Admin', () => {
    return runAs.bot().forAdmin('testadmin').put('/api/v1/users/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot', () => {
    return runAs.bot().forSelf().put('/api/v1/users/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });
});


// ==========================================================================
describe('Access PUT /api/v1/users/:id/reset-points-to-award', () => {
  before(testSetup.beforeDb);

  beforeEach(() => {
    return testSetup.createOrGetUser({
      username: 'testuser',
      email: `testuser@fonzrecon.github`,
      names: [`User Test`],
      pointsToAward: 0,
      organization: 'org',
      locale: 'en',
      password: 'sekret'
    })
  });

  it('Not logged in', () => {
    return runAs.anonymous().put('/api/v1/users/testuser/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Self User', () => {
    return runAs.user('testuser').put('/api/v1/users/testuser/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot for Self User', () => {
    return runAs.bot().forUser('testuser').put('/api/v1/users/testuser/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Other User', () => {
    return runAs.user('otheruser').put('/api/v1/users/testuser/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot for Other User', () => {
    return runAs.bot().forUser('otheruser').put('/api/v1/users/testuser/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').put('/api/v1/users/testuser/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for Admin', () => {
    return runAs.bot().forAdmin('testadmin').put('/api/v1/users/testuser/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot', () => {
    return runAs.bot().forSelf().put('/api/v1/users/testuser/reset-points-to-award', { points: 10 })
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });
});


// ==========================================================================
describe('Access GET /api/v1/users/about-me', () => {
  before(testSetup.beforeDb);

  it('Not logged in', () => {
    return runAs.anonymous().get('/api/v1/users/about-me')
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As User', () => {
    return runAs.user('testuser').get('/api/v1/users/about-me')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for User', () => {
    return runAs.bot().forUser('testuser').get('/api/v1/users/about-me')
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').get('/api/v1/users/about-me')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Bot for Admin', () => {
    return runAs.bot().forAdmin('testadmin').get('/api/v1/users/about-me')
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });

  it('As Bot', () => {
    return runAs.bot().forSelf().get('/api/v1/users/about-me')
      .then((res) => {
        assert.fail('Must not succeed');
      }, assertForbidden);
  });
});


// ==========================================================================


function createOneUserData(username) {
  return {
    user: createUserData(username)
  };
}

function createManyUserData(count) {
  count = count || 10;
  var ret = [];
  for (let i = 0; i < count; i++) {
    ret.push(createUserData('user' + i));
  }
  return { users: ret };
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



/**
 * Use as the catch second argument to the "then" call, so that
 * any assertions in the "then" call don't trigger this function.
 */
function assertForbidden(err) {
  if (!err.status) {
    throw err;
  }
  assert.equal(err.status, 403, 'status');
  assert.equal(err.message, 'Forbidden', 'message');
}
