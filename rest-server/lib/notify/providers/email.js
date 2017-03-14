'use strict';

const path = require('path');
const emailProviders = require('../../../config/contact').emailProviders;
const EmailTemplates = require('swig-email-templates');

module.exports = function(settings) {
  if (!settings.private.EmailProviderImpl) {
    if (!emailProviders.includes(settings.private.EmailProvider)) {
      throw new Error(`Unknown email provider ${settings.private.EmailProvider}`);
    }
    let emailProvider = require('./' + settings.private.EmailProvider);
    if (!emailProvider) {
      throw new Error(`Unknown email provider {settings.private.EmailProvider}`);
    }

    // Create our own setting object.
    settings.private.EmailProviderImpl = provider(
      settings.private.EmailProviderConnection);
  }

  return { send: sendEmail };
};


function sendEmail(args) {
  var settings = args.settings;
  var templateDir = args.templateDir;
  var templateName = args.template;
  var toEmail = args.toDestination;
  var templates = new EmailTemplates({
    root: templateDir
  });

  return new Promise((resolve, reject) => {
    templates.render(templateName, settings.public, (err, html, text, subject) => {
      if (err) {
        return reject(err);
      }
      resolve(settings.private.EmailProviderImpl.send({
        to: toEmail,
        subject: subject,
        text: text,
        html: html,
        from: settings.SiteFromEmail
      }));
    });
  });
}
