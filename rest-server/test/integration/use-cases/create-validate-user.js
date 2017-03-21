'use strict';

const assert = require('chai').assert;
const testSetup = require('../../util/test-setup');
const initializeDb = require('../../util/initialize-db');
const roles = require('../../../config/access/roles');
const models = require('../../../models');
const emailBox = require('../../../lib/notify/providers/test-email');
const Account = models.Account;

describe('Authentication', () => {
  before(testSetup.beforeDb);
  beforeEach(() => {
    return initializeDb()
      .then(() => {
        emailBox.clearOutbox();
        return null;
      });
  });

  describe('/api/v1/users POST and validate', () => {
    it('no existing user', () => {
      let tokenPromise = testSetup
        .getLoginToken('initialadmin', 'sekret')
        .then((token) => {
          debug(`1. Creating user1`);
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

          let adminEmails = emailBox.pullMailFor('initialadmin@fonzrecon.github');
          assert.deepEqual(adminEmails, [], 'admin emails');
          let userEmails = emailBox.pullMailFor('user1@some.place');
          assert.equal(userEmails.length, 1, 'number of user emails');
          assert.equal(userEmails[0].to, 'user1@some.place', 'to email');
          assert.equal(userEmails[0].from, 'no-reply@site.fonzrecon', 'from email');
          assert.equal(userEmails[0].subject, 'New User FonzRecon For You');
          let emailData = JSON.parse(userEmails[0].html);
          assert.equal(emailData.username, 'user1', 'text username');
          assert.equal(emailData.name, 'User Name', 'text name');
          assert.isString(emailData.reset.resetAuthenticationToken, 'text ticket');
          assert.isString(emailData.reset.resetAuthenticationExpires, 'text expires');

          // The resulting request body is empty for security purposes.  The
          // actual authentication token should have been sent over email.
          // Use that email security token that we just parsed.

          debug(`2. validate with ${JSON.stringify(emailData.reset.resetAuthenticationToken)}`);
          return testSetup.request()
            .put('/auth/validate')
            .send({
              username: 'user1',
              password: 'user1password',
              resetAuthenticationToken: emailData.reset.resetAuthenticationToken
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
        })
        .then((res) => {
          debug(`5a. - Done`);
          assert.equal(res.status, 200, 'password change request status');

          // The password change request does not pass back the token.
          // The token is sent through email for security reasons.
          // Pull the token from the test email outbox.

          let adminEmails = emailBox.pullMailFor('initialadmin@fonzrecon.github');
          assert.deepEqual(adminEmails, [], 'admin emails');
          let userEmails = emailBox.pullMailFor('user1@some.place');
          assert.equal(userEmails.length, 1, 'number of user emails');
          let emailData = JSON.parse(userEmails[0].html);
          assert.isString(emailData.reset.resetAuthenticationToken, 'email resetAuthenticationToken');

          return emailData.reset.resetAuthenticationToken;
        });

      // Attempt another valid request with a pending password change.
      let p2 = Promise
        .all([tokenPromise, passwordChangeTokenPromise])
        .then((args) => {
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
              resetAuthenticationToken: args[0]
            });
        })
        .then((res) => {
          debug(`7a. - Done`);
          assert.equal(res.status, 200, 'validate status');

          // Attempt login with given password.
          debug(`8. Logging in w/ new password`);
          return testSetup.getLoginToken('user1', 'user1password-2');
        });
    });
  });
});


function debug(arg) {
  // DEBUG console.log(arg);
  console.log(arg);
}
