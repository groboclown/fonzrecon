'use strict';

const emailjs = require('emailjs');

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
  var auth = null; // default setting is to try all authentication types.
  if (connectionSettings.authentication) {
    for (let k in emailjs.SMTP.authentication) {
      if (emailjs.SMTP.authentication.hasOwnProperty(k)
          && k.toUpperCase() === connectionSettings.authentication.toUpperCase()) {
        auth = email.authentication[k];
        break;
      }
    }
  }

  var options = {
    user: parseStr(connectionSettings.user),
    password: parseStr(connectionSettings.password),
    host: parseStr(connectionSettings.host),
    ssl: parseBool(connectionSettings.ssl),
    tls: parseBool(connectionSettings.tls),
    timeout: parseNumber(connectionSettings.timeout),
    port: parseNumber(connectionSettings.port),
    domain: parseStr(connectionSettings.domain),
    authentication: auth
  };

  console.log(`DEBUG connecting to email server with ${JSON.stringify(options)}`);

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
        console.log(`Encountered error ${err}: ${JSON.stringify(err)}`);
        if (err.previous) {
          console.log(err.previous.stack);
        }
        reject(err);
      }
      resolve(null);
    });
  });
}


function parseStr(s) {
  if (!s || s === '') {
    return null;
  }
  return s;
}

function parseBool(s) {
  if (typeof(s) === 'boolean') {
    return s;
  }
  return s === 'true';
}

function parseNumber(s) {
  if (!s) {
    return null;
  }
  return +s;
}
