'use strict';

const assert = require('chai').assert;
const testSetup = require('../../util/test-setup');
const initializeDb = require('../../util/initialize-db');
const mockControllerRunner = require('../../util/mock-controller');
const userController = require('../../../controllers/user');
const models = require('../../../models');
const Account = models.Account;
const User = models.User;


describe('Create User', () => {
  before(testSetup.beforeDb);

  // Create a test user as a fixture
  beforeEach(() => {
    return new Account({
        id: 'testuser',
        authentications: [],
        role: 'USER',
        userRef: 'testuser',
        accountEmail: 'eat@joes.com'
      })
      .save()
      .then(() => {
        return new User({
            username: 'testuser',
            names: ['n'],
            contacts: [{
              type: 'email',
              server: null,
              address: 'eat@joes.com'
            }],
            pointsToAward: 0,
            receivedPointsToSpend: 0,
            image: false,
            organization: 'org'
          })
          .save();
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
            names: ['b'],
            pointsToAward: 0,
            organization: 'b',
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
            value: ['testuser', '11@abc.def', 'b']
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
            names: ['n'],
            pointsToAward: 0,
            organization: 'b',
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
            value: ['testuser2', '112@abc.def', 'n']
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
            names: ['b'],
            pointsToAward: 0,
            organization: 'b',
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
            value: ['testuser2', 'eat@joes.com', 'b']
          }
        ], 'error details');
      });
  });
});


describe('Get All', () => {
  before(testSetup.beforeDb);

  // TODO add tests
});
