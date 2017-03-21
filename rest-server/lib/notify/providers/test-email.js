'use strict';

// Unit Test email provider.
module.exports = function() {
  return module.exports;
};


// Emails by user
module.exports.outbox = {};

module.exports.clearOutbox = function() {
  module.exports.outbox = {};
};

module.exports.getMailFor = function(emailAddress) {
  return module.exports.outbox[emailAddress] || [];
};

module.exports.pullMailFor = function(emailAddress) {
  let ret = module.exports.outbox[emailAddress] || [];
  module.exports.outbox[emailAddress] = [];
  return ret;
};


module.exports.send = function(args) {
  let to = args.to;
  if (!module.exports.outbox[to]) {
    module.exports.outbox[to] = [];
  }
  module.exports.outbox[to].push(args);
};
