'use strict';

const emailjs = require('emailjs');

module.exports = function(connectionSettings) {
  return {
    send: (args) => { return sendEmail(connectionSettings, args); }
  };
};


function sendEmail(connectionSettings, args) {
  var to = args.toEmail;
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

  return new Promise((resolve, reject) => {
    server.send(message, (err, message) => {
      if (err) {
        reject(err);
      }
      // DEBUG
      console.log(`Sent message: ${message}`);
      resolve(null);
    });
  });
}
