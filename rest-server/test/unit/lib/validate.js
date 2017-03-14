'use strict';

const assert = require('chai').assert;
const validate = require('../../../lib/validate');

describe('Validators', () => {

  it('email', () => {
    assert.isTrue(validate.isEmailAddress('eat@joes.com'));
  });
});


describe('Validator Promise Factory', () => {
  it('email valid', () => {
    let factory = validate.asValidatePromiseFactory(validate.isEmailAddress, 'email', []);
    return factory('eat@joes.com')
      .then((v) => {
        assert.equal(v, 'eat@joes.com', 'scrubbed email address');
      });
  });
  it('email invalid', () => {
    let factory = validate.asValidatePromiseFactory(validate.isEmailAddress, 'email', []);
    return factory('eat')
      .then((v) => {
        assert.fail('Incorrectly marked "eat" as valid');
      }, () => {
        // Catch the validate failure, but not the assert.fail.
        return null;
      });
  });
});
