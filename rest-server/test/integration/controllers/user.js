'use strict';

const assert = require('chai').assert;
const testSetup = require('../../util/test-setup');
const initializeDb = require('../../util/initialize-db');
const mockControllerRunner = require('../../util/mock-controller');
const userController = require('../../../controllers/user');
const createUserApi = require('../../../lib/create-user-api');
const models = testSetup.models;
const Account = models.Account;
const User = models.User;


describe('Create User', () => {
  before(testSetup.beforeDb);

  // Create a test user as a fixture
  beforeEach(() => {
    return createUserApi.createUser({
        username: 'testuser',
        names: ['nnn'],
        email: 'eat@joes.com',
        pointsToAward: 0,
        organization: 'org'
      })
      .then(initializeDb);
  });

  it('Existing username', () => {
    return mockControllerRunner.run(userController.create, {
        username: 'initialadmin',
        body: {
          user: {
            username: 'testuser',
            email: '11@abc.def',
            names: ['bbb'],
            pointsToAward: 0,
            organization: 'bb',
            locale: 'es'
          }
        }
      })
      .then((res) => {
        assert.isTrue(res.next, 'next');
        assert.isOk(res.error, 'Must have generated error');
        assert.equal(res.status, 400, 'status');
        assert.equal(res.errorMessage, 'ValidationError', 'message');
        assert.deepEqual(res.errorDetails, [
          {
            msg: 'One of these values is already in use',
            param: 'username, email, or names',
            value: ['testuser', '11@abc.def', 'bbb']
          }
        ], 'error details');
      });
  });

  it('Existing name', () => {
    return mockControllerRunner.run(userController.create, {
        username: 'initialadmin',
        body: {
          user: {
            username: 'testuser2',
            email: '112@abc.def',
            names: ['nnn'],
            pointsToAward: 0,
            organization: 'bb',
            locale: 'es'
          }
        }
      })
      .then((res) => {
        assert.isTrue(res.next, 'next');
        assert.isOk(res.error, 'Must have generated error');
        assert.equal(res.status, 400, 'status');
        assert.equal(res.errorMessage, 'ValidationError', 'message');
        assert.deepEqual(res.errorDetails, [
          {
            msg: 'One of these values is already in use',
            param: 'username, email, or names',
            value: ['testuser2', '112@abc.def', 'nnn']
          }
        ], 'error details');
      });
  });

  it('Existing email', () => {
    return mockControllerRunner.run(userController.create, {
        username: 'initialadmin',
        body: {
          user: {
            username: 'testuser2',
            email: 'eat@joes.com',
            names: ['bbb'],
            pointsToAward: 0,
            organization: 'bb',
            locale: 'es'
          }
        }
      })
      .then((res) => {
        assert.isTrue(res.next, 'next');
        assert.isOk(res.error, 'Must have generated error');
        assert.equal(res.status, 400, 'status');
        assert.equal(res.errorMessage, 'ValidationError', 'message');
        assert.deepEqual(res.errorDetails, [
          {
            msg: 'One of these values is already in use',
            param: 'username, email, or names',
            value: ['testuser2', 'eat@joes.com', 'bbb']
          }
        ], 'error details');
      });
  });

  it('Simple create', () => {
    return mockControllerRunner.run(userController.create, {
      username: 'initialadmin',
      body: {
        user: {
          username: 'testuser3',
          email: 'testuser3@fonzrecon.github',
          names: ['testuser3a'],
          pointsToAward: 0,
          organization: 'bb',
          locale: 'zn'
        }
      }
    })
    .then((res) => {
      assert.isFalse(res.next, 'next');
      assert.equal(res.status, 201, 'status');
      assert.deepEqual(res.json, {}, 'json');
    });
  });
});


describe('Get All', () => {
  before(testSetup.beforeDb);

  // Create a test user as a fixture
  beforeEach(() => {
    // This should be automatically removed for us by mocha-mongoose,
    // but without it an extra admin user is inserted.
    return User.remove()
      .then(() => {
        return Account.remove();
      })
      .then(() => {
        return createUserApi.createUser({
            username: 'testuser',
            names: ['nnn'],
            email: 'eat@joes.com',
            pointsToAward: 0,
            organization: 'org'
          });
      });
  });

  it('Bot not returned', () => {
    // Create a bot
    return createUserApi.createBot({
        username: 'bot1',
        email: 'bot1@fonzrecon.github',
        password: 'sekret'
      })
      .then(() => {
        return mockControllerRunner.run(userController.getAllBrief, {});
      })
      .then((res) => {
        assert.isFalse(res.next, 'next');
        assert.equal(res.status, 200, 'status');
        assert.deepEqual(res.json, pageSimpleUser(), 'json');
      });
  });

  it('Get Create Get', () => {
    return mockControllerRunner.run(userController.getAllBrief, {})
    .then((res) => {
      assert.isFalse(res.next, 'next');
      assert.equal(res.status, 200, 'status');
      assert.deepEqual(res.json, pageSimpleUser(), 'json');
    })
    .then(() => {
      return createUserApi.createUser({
        username: 'user2',
        email: 'user2@fonzrecon.github',
        names: ['Two, User'],
        pointsToAward: 0,
        organization: 'org'
      });
    })
    .then(() => {
      return mockControllerRunner.run(userController.getAllBrief, {});
    })
    .then((res) => {
      assert.isFalse(res.next, 'next');
      assert.equal(res.status, 200, 'status');
      var paged = pageSimpleUser();
      paged.count = 2;
      paged.results.push({
        username: 'user2',
        names: ['Two, User', 'user2'],
        organization: 'org',
        active: true,
        type: 'UserBrief',
        uri: '/api/v1/users/user2',
        imageUri: null
      });
      assert.deepEqual(res.json, paged, 'json');
    });
  });

  it('Empty list', () => {
    return User.remove({})
      .then(() => {
        return Account.remove({});
      })
      .then(() => {
        return mockControllerRunner.run(userController.getAllBrief, {});
      })
      .then((res) => {
        assert.isFalse(res.next, 'next');
        assert.equal(res.status, 200, 'status');
        var paged = pageSimpleUser();
        paged.count = 0;
        paged.last = null;
        paged.pages = [];
        paged.results = [];
        assert.deepEqual(res.json, paged, 'json');
      });
  });

  it('Paging', () => {
    var userList = [];
    for (let i = 0; i < 100; i++) {
      userList.push({
        username: `auser${i}`,
        email: `auser${i}@fonzrecon.github`,
        names: [`${i}, A. User`],
        pointsToAward: 0,
        organization: 'org'
      });
    }
    return mockControllerRunner.run(userController.import, { body: { users: userList } })
      .then((res) => {
        assert.equal(res.status, 201, 'status');

        return mockControllerRunner.run(userController.getAllBrief, {
          query: {
            page: 2,
            perPage: 5
          }
        });
      })
      .then((res) => {
        assert.isFalse(res.next, 'next');
        assert.equal(res.status, 200, 'status');
        assert.equal(res.json.type, 'UserBrief', 'type')
        assert.equal(res.json.results.length, 5, 'result length');
        assert.equal(res.json.count, 101, 'count');
        assert.equal(res.json.current, 2, 'current');
        assert.equal(res.json.last, 21, 'last page');
        assert.equal(res.json.prev, 1, 'prev page');
        assert.equal(res.json.next, 3, 'next page');
        assert.deepEqual(res.json.pages, [1, 2, 3, 4, 5, 6, 7], 'pages');
        assert.deepEqual(res.json.options, {
          delta: 5,
          offset: 0,
          page: 2,
          perPage: 5
        }, 'options');
      });
  });

  it('Deleted User', () => {
    return mockControllerRunner.run(userController.delete, { params: { id: 'testuser' } })
    .then((res) => {
      assert.equal(res.status, 200, 'delete status');

      return mockControllerRunner.run(userController.getAllBrief, {});
    })
    .then((res) => {
      assert.isFalse(res.next, 'next');
      assert.equal(res.status, 200, 'status');
      var paged = pageSimpleUser();
      paged.count = 0;
      paged.last = null;
      paged.pages = [];
      paged.results = [];
      assert.deepEqual(res.json, paged, 'json');
    });
  });

  it('Query Params', () => {
    var userList = [];
    for (let i = 0; i < 4; i++) {
      userList.push({
        username: `auser${i}`,
        email: `auser${i}@fonzrecon.github`,
        names: [`${i}, A. User`],
        pointsToAward: 0,
        organization: 'org'
      });
    }
    for (let i = 0; i < 2; i++) {
      userList.push({
        username: `buser${i}`,
        email: `buser${i}@fonzrecon.github`,
        names: [`${i}, B. User`],
        pointsToAward: 0,
        organization: 'org'
      });
    }
    return mockControllerRunner.run(userController.import, { body: { users: userList } })
      .then((res) => {
        assert.equal(res.status, 201, 'status');
        return mockControllerRunner.run(userController.delete, { params: { id: 'auser0' } });
      })
      .then((res) => {
        assert.equal(res.status, 200, 'status');

        return mockControllerRunner.run(userController.getAllBrief, {
          query: {
            like: '.*?A. User'
          }
        });
      })
      .then((res) => {
        assert.isFalse(res.next, 'next');
        assert.equal(res.status, 200, 'status');
        assert.equal(res.json.type, 'UserBrief', 'type')
        assert.equal(res.json.results.length, 3, 'result length');
        assert.equal(res.json.count, 3, 'count');

        return mockControllerRunner.run(userController.getAllBrief, {
          query: {
            like: '.*?A. User',
            all: 'true'
          }
        });
      })
      .then((res) => {
        assert.isFalse(res.next, 'next');
        assert.equal(res.status, 200, 'status');
        assert.equal(res.json.type, 'UserBrief', 'type')
        assert.equal(res.json.results.length, 4, 'result length');
        assert.equal(res.json.count, 4, 'count');
      });
  });
});


function pageSimpleUser() {
  return {
    count: 1,
    current: 1,
    last: 1,
    next: null,
    prev: null,
    pages: [1],
    options: {
      delta: 5,
      offset: 0,
      page: 1,
      perPage: 10
    },
    type: 'UserBrief',
    results: [
      {
        username: 'testuser',
        names: ['nnn', 'testuser'],
        organization: 'org',
        active: true,
        type: 'UserBrief',
        uri: '/api/v1/users/testuser',
        imageUri: null
      }
    ]
  };
}
