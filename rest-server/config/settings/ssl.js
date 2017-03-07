'use strict';


if (!!process.env.SSL_KEY && !!process.env.SSL_CERT) {
  module.exports = {
    key: process.env.SSL_KEY,
    cert: process.env.SSL_CERT
  };
} else {
  module.exports = null;
}
