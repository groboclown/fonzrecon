'use strict';

module.exports = function() {
  return process.env.SECRET_SIGNING_KEY || 'secret passport key';
};
