'use strict';

const path = require('path');
const emailProviders = require('../../../config/contact').emailProviders;
const EmailTemplates = require('swig-email-templates');
const env = require('../../../config/env');

module.exports = function(settings) {
  if (!settings.private.EmailProviderImpl) {
    let emailProviderName;
    if (env.emailProvider) {
      emailProviderName = env.emailProvider;
    } else {
      if (!emailProviders.includes(settings.private.EmailProvider)) {
        throw new Error(`Unknown email provider ${settings.private.EmailProvider}`);
      }
      emailProviderName = settings.private.EmailProvider;
    }
    let emailProvider = require('./' + emailProviderName);
    if (!emailProvider) {
      throw new Error(`Unknown email provider ${settings.private.EmailProvider}`);
    }

    // Create our own setting object.
    settings.private.EmailProviderImpl = emailProvider(
      settings.private.EmailProviderConnection);
  }

  return Promise.resolve({ send: sendEmail });
};


function sendEmail(args) {
  const settings = args.settings;
  const notifyData = args.notifyData;
  const templateDir = args.templateDir;
  const templateName = args.templateName;
  const toEmail = args.toDestination.address;
  const when = args.when;
  const templates = new EmailTemplates({
    root: templateDir
  });
  const emailProvider = module.exports(settings);

  return new Promise((resolve, reject) => {
    templates.render(templateName + '.html', notifyData, (err, html, text, subject) => {
      if (err) {
        return reject(err);
      }

      // Strip out newlines and extra spaces,
      // and other general cleanup for the subject.
      subject = subject.replace(/\n/g, ' ').replace(/\s\s+/g, ' ').trim();

      // DEBUG console.log(`DEBUG send email:\n<<<<<<<<\n${subject}\n<<<<<<<<\n${html}\n<<<<<<<<`);
      resolve(settings.private.EmailProviderImpl.send({
        to: toEmail,
        subject: subject,
        text: text,
        html: html,
        from: settings.public.SiteFromEmail,
        when: when
      }));
    });
  });
}
