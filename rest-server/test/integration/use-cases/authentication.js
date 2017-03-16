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

  describe('/auth/login POST', () => {
    it('local login', () => {
      return testSetup.request()
        .post('/auth/login')
        .send({ username: 'initialadmin', password: 'sekret' })
        .then((res) => {
          assert.equal(res.status, 200, 'status');
          assert.isString(res.body.token, 'token');
          return res.body.token;
        });
    });
  });

  describe('/auth/logout POST', () => {
    it('local logout without a token', () => {
      return testSetup.request()
        .post('/auth/logout')

        // Note the promise split, so that the "then" failure
        // won't trigger the "catch" assertions.
        .then((res) => {
          assert.fail('Did not cause a Forbidden error');
        }, (err) => {
          assert.equal(err.status, 403, 'status');
          assert.equal(err.message, 'Forbidden', 'message');
        });
    });

    it('local logout with a token', () => {
      return testSetup
        .getLoginToken('initialadmin', 'sekret')
        .then((token) => {
          return testSetup.request()
            .post('/auth/logout')
            .set('Authorization', 'JWT ' + token);
        })
        .then((res) => {
          assert.equal(res.status, 200, 'status');
        });
    });
  });
});
