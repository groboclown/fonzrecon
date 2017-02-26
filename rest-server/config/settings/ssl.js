'use strict';

module.exports = function() {
  if (!!process.env.SSL_KEY && !!process.env.SSL_CERT) {
    return {
      key: process.env.SSL_KEY,
      cert: process.env.SSL_CERT
    };
  } else {
    return null;
  }
};
