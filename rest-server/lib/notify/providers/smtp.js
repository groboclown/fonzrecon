'use strict';

const emailjs = require('emailjs');
// FIXME understand why this isn't setup right.
emailjs.authentication = emailjs.authentication || {};

module.exports = function(connectionSettings) {
  return {
    send: (args) => { return sendEmail(connectionSettings, args); }
  };
};


function sendEmail(connectionSettings, args) {
  var to = args.to;
  var subject = args.subject;
  var text = args.text;
  var html = args.html;
  var from = args.from;

  var options = {
    user: connectionSettings.username,
    password: connectionSettings.password,
    host: connectionSettings.host,
    ssl: connectionSettings.ssl,
    tls: connectionSettings.tls,
    timeout: connectionSettings.timeout,
    domain: connectionSettings.domain,
    authentication: connectionSettings.authentication === 'xoauth2'
      ? emailjs.authentication.XOAUTH2
      : emailjs.authentication.PLAIN
  };

  var server = emailjs.server.connect(options);

  var message = {
    text: text,
    from: from,
    to: to,
    subject: subject,
    attachment: [
      { data: html }
    ]
  };
  console.log(`DEBUG sending message ${JSON.stringify(message)}`);
  var msg = emailjs.message.create(message);

  return new Promise((resolve, reject) => {
    server.send(msg, (err, message) => {
      if (err) {
        reject(err);
      }
      // DEBUG
      console.log(`DEBUG Sent message: ${message}`);
      resolve(null);
    });
  });
}
