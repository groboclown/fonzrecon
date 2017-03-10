'use strict';

const models = require('../../models');
const Setting = models.Setting;
const files = require('../files');


const DEFAULT_LOCALE = 'en';
const DEFAULT_THEME = 'light';


/**
 * `template`: location in the template directory for the
 *    email body.
 * `to`: list of User objects (or email strings) that will
 *    receive the email.  Each user will receive their own
 *    email, due to the localization.
 * `data`: input to the templates.  The `siteSettings` key
 *    will be set to the public email related settings in the site.
 *
 * The "subject" is implicit in the template name.
 *
 * Returns promise that has a return value of null on success.
 */
exports.send = function(template, to, data) {
  const settingsPromise = Setting.getEmailSettings()
    .then(function(settings) {
      data.siteSettings = settings.public;
      return settings;
    });

  if (! Array.isArray(to)) {
    to = [ to ];
  }

  // Each user has their own locale, so we send it separately.

  return Promise.all(to.map(function(user) {
    let email = user;
    let locale = DEFAULT_LOCALE;
    if (typeof(user) !== 'string') {
      locale = user.locale;
      email = [];
      console.log(`preparing send to ${JSON.stringify(user)}`)
      for (let j = 0; j < user.contacts.length; j++) {
        if (user.contacts[j].type === 'email') {
          email.push(user.contacts[j].address);
        }
      }
      if (email.length <= 0) {
        throw new Error(`No email contact for user ${user.username}`);
      }
    }

    let templateFilePromise = settingsPromise
      .then(function(settings) {
        return getEmailTemplate(template, locale, settings);
      });
    let subjectFilePromise = settingsPromise
      .then(function(settings) {
        return getEmailTemplate(template + '-subject', locale, settings);
      });
    return Promise
      .all([settingsPromise, templateFilePromise, subjectFilePromise, Promise.resolve(email)])
      .then(function(args) {
        let settings = args[0];
        let templateFile = args[1];
        let subjectFile = args[2];
        let toEmails = args[3];
        console.log(`Send email ${templateFile} to ${JSON.stringify(toEmails)}`);

        // TODO format subject
        // TODO format body

        // TODO send email
        return null;
      })

      // TODO for now, the sending of the email handles its own errors.
      // It's expected to run outside the normal promise world.
      // Is this right?
      .catch(function(err) {
        console.error(`Problem sending ${template} email to ${email}: ${err.message}`);
        console.error(err.stack);
      });
  }))

};


exports.sendAdminNotification = function(template, data) {
  return Setting.getAdminActionNotificationEmails()
    .then(function(toEmails) {
      return exports.send(template, toEmails, data);
    });
};


function getEmailTemplate(name, locale, settings) {
  let theme = settings.public.EmailTheme || DEFAULT_THEME;
  locale = (locale || DEFAULT_LOCALE).toLowerCase().replace(/_/g, '-');
  let locales = [];
  let dashIndex = locale.length;
  let partial;
  while (dashIndex >= 0) {
    partial = locale.substring(0, dashIndex);
    if (! locales.includes(partial)) {
      locales.push(partial);
    }
    dashIndex = locale.lastIndexOf('-', dashIndex);
  }
  if (! locales.includes(DEFAULT_LOCALE)) {
    locales.push(DEFAULT_LOCALE);
  }


  // Find the status of all the files where the template could exist.
  // We'll use the first one that matches.
  let themeOrder = [theme];
  if (theme !== DEFAULT_THEME) {
    themeOrder.push(DEFAULT_THEME);
  }
  var locationOrder = [];
  for (let i = 0; i < themeOrder.length; i++) {
    for (let j = 0; j < locales.length; j++) {
      locationOrder.push(`templates/email/${themeOrder[i]}/${locales[j]}/${name}.txt`);
    }
  }

  return files.getFileReadableStatus(locationOrder)
    .then(function(fileStats) {
      for (let i = 0; i < fileStats.length; i++) {
        console.log(`checking ${fileStats[i][0]} ${fileStats[i][1]}`)
        if (fileStats[i][1]) {
          return fileStats[i][0];
        }
      }
      throw Error(`No file found for template ${name}.`);
    });
}
