'use strict';

const assert = require('chai').assert;
// Anything that tests the models needs to load the models
// through this.  This is to ensure that the promises
// are correctly setup, so we don't get deprecation errors
const mongooseTesting = require('../../util/mongoose-testing');
const Setting = mongooseTesting.models.Setting;

describe('Construction of setters and getters', () => {
  it('getter', () => {
    assert.isFunction(Setting.getAdminActionNotificationEmails, 'get AdminActionNotificationEmails');
  });

  it('setter', () => {
    assert.isFunction(Setting.setAdminActionNotificationEmails, 'set AdminActionNotificationEmails');
  });
});
