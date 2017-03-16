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
          console.log(`1. logged in as initial admin`);
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
          console.log(`1a. - Done`);
          assert.equal(res.status, 201, 'create user status');
          assert.isString(res.body.resetAuthenticationToken, 'token');
          assert.isString(res.body.resetAuthenticationExpires, 'expires');

          console.log(`2. validate with ${JSON.stringify(res.body)}`);
          return testSetup.request()
            .put('/auth/validate')
            .send({
              username: 'user1',
              password: 'user1password',
              resetAuthenticationToken: res.body.resetAuthenticationToken
            });
        })
        .then((res) => {
          console.log(`2a. - Done`);
          assert.equal(res.status, 200, 'validate status');

          // Attempt login with given password.
          console.log(`3. Logging in`);
          return testSetup.getLoginToken('user1', 'user1password');
        });

      let p1 = tokenPromise
        .then((token) => {
          console.log(`3a. - Done`);

          // Attempt a request that should work.
          console.log(`4. Get users`);
          return testSetup.request()
            .get('/api/v1/users')
            .set('Authentication', 'JWT ' + token)
        });

      // Request a password change
      let passwordChangeTokenPromise = Promise
        .all([tokenPromise, p1])
        .then((args) => {
          console.log(`4a. - Done`);
          assert.equal(args[1].status, 200, 'get users status');

          console.log(`5. Requesting password change`);
          return testSetup.request()
            .put('/auth/password-change')
            .set('Authentication', 'JWT ' + args[0])
            .send({ email: 'user1@some.place' });
        });

      // Attempt another valid request with a pending password change.
      let p2 = Promise
        .all([tokenPromise, passwordChangeTokenPromise])
        .then((args) => {
          console.log(`5a. - Done`);
          assert.equal(args[1].status, 200, 'password change request status');

          console.log(`6. Getting users`);
          return testSetup.request()
            .get('/api/v1/users')
            .set('Authentication', 'JWT ' + args[0])
        });

      // Attempt the password change
      return Promise
        .all([passwordChangeTokenPromise, p2])
        .then((args) => {
          console.log(`6a. - Done`);
          assert.equal(args[1].status, 200, 'get users 2 status');

          console.log(`7. Validating password change`);
          return testSetup.request()
            .put('/auth/validate')
            .send({
              username: 'user1`',
              password: 'user1password-2',
              resetAuthenticationToken: args[0].body.resetAuthenticationToken
            });
        })
        .then((res) => {
          console.log(`7a. - Done`);
          assert.equal(res.status, 200, 'validate status');

          // Attempt login with given password.
          console.log(`8. Logging in w/ new password`);
          return testSetup.getLoginToken('user1', 'user1password-2');
        })
        .catch((err) => {
          console.log(err.message + '\n' + err.stack);
          assert.fail(err.message);
        });
    });
  });
});
