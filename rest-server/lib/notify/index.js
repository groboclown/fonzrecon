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
 * TODO for the moment, this only bothers with email.  Eventually, this should
 * add in other notification methods.
 *
 * Returns promise that has a return value of null on success.
 */
exports.send = function(template, to, data) {
  const settingsPromise = Setting.getEmailSettings()
    .then((settings) => {
      data.siteSettings = settings.public;
      return settings;
    });

  if (!Array.isArray(to)) {
    to = [ to ];
  }

  // Send all the allowable contact types.
  var destinations = [];
  for (let i = 0; i < to.length; i++) {
    var user = to[i];
    if (typeof(user) === 'string') {
      // Assume email
      destinations.push({
        provider: 'email',
        locale: DEFAULT_LOCALE,
        address: user,
        server: null
      });
    } else if (user.accountEmail) {
      // Account object
      destinations.push({
        provider: 'email',
        locale: DEFAULT_LOCALE,
        address: user.accountEmail,
        server: null
      });
    } else if (user.contacts) {
      // User object
      for (let j = 0; j < user.contacts.length; j++) {
        destinations.push({
          locale: user.locale || DEFAULT_LOCALE,
          provider: user.contacts[j].type,
          address: user.contacts[j].address,
          server: user.contacts[j].server
        });
      }
    } else {
      // Unknown object
      console.log(`Unknown "to" data type: ${JSON.stringify(user)}`);
      return Promise.reject(new Error(`Unknown "to" data type: ${JSON.stringify(user)}`));
    }
  }

  // Each user has their own locale, so we send it separately.

  return Promise.all(destinations.map((destination) => {
    let templateDirPromise = settingsPromise
      .then((settings) => {
        return getNotifyTemplateDir(template, destination.locale, settings);
      });
    let providerPromise = settingsPromise
      .then((settings) => {
        return require('./providers/' + destination.provider)(settings);
      });
    return Promise
      .all([ settingsPromise, templateDirPromise,
        Promise.resolve(destination), providerPromise ])
      .then((args) => {
        let settings = args[0];
        let templateDir = args[1];
        let toDestination = args[2];
        let provider = args[3];

        return provider.send({
          settings: settings,
          templateDir: templateDir,
          templateName: template,
          toDestination: toDestination
        });
      })

      // TODO for now, the sending of the email handles its own errors.
      // It's expected to run outside the normal promise world.
      // Is this right?
      .catch((err) => {
        console.error(`Problem sending ${template} email to ${email}: ${err.message}`);
        console.error(err.stack);
      });
  }))

};


exports.sendAdminNotification = function(template, data) {
  return Setting.getAdminActionNotificationEmails()
    .then((toEmails) => {
      return exports.send(template, toEmails, data);
    });
};


function getNotifyTemplateDir(provider, locale, settings) {
  let theme = settings.public.EmailTheme || DEFAULT_THEME;
  locale = (locale || DEFAULT_LOCALE).toLowerCase().replace(/_/g, '-');
  let locales = [];
  let dashIndex = locale.length;
  let partial;
  while (dashIndex >= 0) {
    partial = locale.substring(0, dashIndex);
    if (!locales.includes(partial)) {
      locales.push(partial);
    }
    dashIndex = locale.lastIndexOf('-', dashIndex);
  }
  if (!locales.includes(DEFAULT_LOCALE)) {
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
      locationOrder.push(`templates/${provider}/${themeOrder[i]}/${locales[j]}`);
    }
  }

  return files.getDirectoryStatus(locationOrder)
    .then((dirStats) => {
      for (let i = 0; i < dirStats.length; i++) {
        if (dirStats[i][1]) {
          return dirStats[i];
        }
      }
      throw Error(`No template directory found for ${provider}.`);
    });
}
