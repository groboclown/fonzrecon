'use strict';

const assert = require('chai').assert;
const setting = require('../../../models').Setting;

describe('Construction of setters and getters', () => {
  var s = new Setting();

  it('getter', () => {
    assert.isFunction(s.getAdminActionNotificationEmails, 'get AdminActionNotificationEmails');
  });

  it('setter', () => {
    assert.isFunction(s.setAdminActionNotificationEmails, 'set AdminActionNotificationEmails');
  });
});
