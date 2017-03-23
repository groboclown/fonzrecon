'use strict';

const assert = require('chai').assert;
const testSetup = require('../../util/test-setup');
const runAs = require('../../util/run-as');

describe('Access GET /api/v1/users', () => {
  before(testSetup.beforeDb);

  it('Not logged in', () => {
    return runAs.anonymous().get('/api/v1/users')
      .then((res) => {
        if (res.error) {
          // Simulate the error.
          throw res.error;
        }
        assert.fail('Must not succeed');
      })
      .catch((err) => {
        assert.equal(err.status, 403, 'status');
        assert.equal(err.message, 'Forbidden', 'message');
      });
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').get('/api/v1/users')
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
});


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
        if (res.error) {
          // Simulate the error.
          throw res.error;
        }
        assert.fail('Must not succeed');
      })
      .catch((err) => {
        assert.equal(err.status, 403, 'status');
        assert.equal(err.message, 'Forbidden', 'message');
      });
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').get('/api/v1/users/testuser')
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

  it('As Other User', () => {
    return runAs.user('otheruser').get('/api/v1/users/testuser')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });
});


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
        if (res.error) {
          // Simulate the error.
          throw res.error;
        }
        assert.fail('Must not succeed');
      })
      .catch((err) => {
        assert.equal(err.status, 403, 'status');
        assert.equal(err.message, 'Forbidden', 'message');
      });
  });

  it('As Admin', () => {
    return runAs.admin('testadmin').get('/api/v1/users/testuser/details')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Self User', () => {
    return runAs.user('testuser').get('/api/v1/users/testuser/details')
      .then((res) => {
        assert.equal(res.status, 200, 'status');
      });
  });

  it('As Other User', () => {
    return runAs.user('otheruser').get('/api/v1/users/testuser/details')
      .then((res) => {
        if (res.error) {
          // Simulate the error.
          throw res.error;
        }
        assert.fail('Must not succeed');
      })
      .catch((err) => {
        assert.equal(err.status, 403, 'status');
        assert.equal(err.message, 'Forbidden', 'message');
      });
  });
});
