'use strict';

const assert = require('chai').assert;
const testSetup = require('../../util/test-setup');
const initializeDb = require('../../util/initialize-db');
const roles = require('../../../config/access/roles');

describe('Authentication', () => {
  before(testSetup.beforeDb);
  beforeEach(() => {
    return initializeDb();
  });

  describe('/api/v1/users POST and validate', () => {
    it('no existing user', () => {
      let tokenPromise = testSetup
        .getLoginToken('initialadmin', 'sekret')
        .then((token) => {
          debug(`1. logged in as initial admin`);
          return testSetup.request()
            .post('/api/v1/users')
            .set('Authorization', 'JWT ' + token)
            .send({
              user: {
                username: 'user1',
                email: 'user1@some.place',
                names: ['User Name'],
                pointsToAward: 0,
                organization: 'org',
                locale: 'en'
              }
            });
        })
        .then((res) => {
          debug(`1a. - Done`);
          assert.equal(res.status, 201, 'create user status');
          assert.isString(res.body.resetAuthenticationToken, 'token');
          assert.isString(res.body.resetAuthenticationExpires, 'expires');

          debug(`2. validate with ${JSON.stringify(res.body)}`);
          return testSetup.request()
            .put('/auth/validate')
            .send({
              username: 'user1',
              password: 'user1password',
              resetAuthenticationToken: res.body.resetAuthenticationToken
            });
        })
        .then((res) => {
          debug(`2a. - Done`);
          assert.equal(res.status, 200, 'validate status');

          // Attempt login with given password.
          debug(`3. Logging in`);
          return testSetup.getLoginToken('user1', 'user1password');
        });

      let p1 = tokenPromise
        .then((token) => {
          debug(`3a. - Done`);

          // Attempt a request that should work.
          debug(`4. Get users with token ${token}`);
          return testSetup.request()
            .get('/api/v1/users')
            .set('Authorization', 'JWT ' + token)
        });

      // Request a password change
      let passwordChangeTokenPromise = Promise
        .all([tokenPromise, p1])
        .then((args) => {
          debug(`4a. - Done`);
          assert.equal(args[1].status, 200, 'get users status');

          debug(`5. Requesting password change`);
          return testSetup.request()
            .put('/auth/password-change')
            // Can be done without authorization
            .send({ email: 'user1@some.place' });
        });

      // Attempt another valid request with a pending password change.
      let p2 = Promise
        .all([tokenPromise, passwordChangeTokenPromise])
        .then((args) => {
          debug(`5a. - Done`);
          assert.equal(args[1].status, 200, 'password change request status');

          debug(`6. Getting users`);
          return testSetup.request()
            .get('/api/v1/users')
            .set('Authorization', 'JWT ' + args[0])
        });

      // Attempt the password change
      return Promise
        .all([passwordChangeTokenPromise, p2])
        .then((args) => {
          debug(`6a. - Done`);
          assert.equal(args[1].status, 200, 'get users 2 status');

          debug(`7. Validating password change`);
          return testSetup.request()
            .put('/auth/validate')
            .send({
              username: 'user1',
              password: 'user1password-2',
              resetAuthenticationToken: args[0].body.resetAuthenticationToken
            });
        })
        .then((res) => {
          debug(`7a. - Done`);
          assert.equal(res.status, 200, 'validate status');

          // Attempt login with given password.
          debug(`8. Logging in w/ new password`);
          return testSetup.getLoginToken('user1', 'user1password-2');
        })
        .catch((err) => {
          debug(err.message + '\n' + err.stack);
          assert.fail(err.message);
        });
    });
  });
});


function debug(arg) {
  // DEBUG console.log(arg);
}
