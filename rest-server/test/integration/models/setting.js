'use strict';

const assert = require('chai').assert;
const testSetup = require('../../util/test-setup');
const Setting = testSetup.models.Setting;


describe('Setting setters and getters', () => {
  before(testSetup.beforeDb);

  it('get and set valid', () => {
    return Setting
      .setAdminActionNotificationEmails(['eat@joes.com', 'my.name@host.name'])
      .then((s) => {
        assert.equal(s.key, 'AdminActionNotificationEmails', 'key');
        assert.deepEqual(s.value, ['eat@joes.com', 'my.name@host.name'], 'value');

        // The object returned by save looks right, now check that the getter
        // performs the right behavior.
        return Setting.getAdminActionNotificationEmails();
      })
      .then((s) => {
        assert.deepEqual(s, ['eat@joes.com', 'my.name@host.name'], 'value');
      });
  });
});
