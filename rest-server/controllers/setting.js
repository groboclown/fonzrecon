'use strict';

const models = require('../models');
const Setting = models.Setting;
const errors = require('./util').errors;


function mapSettingsList(settings) {
  var ret = {};

  for (var i = 0; i < settings.length; i++) {
    ret[settings[i].key] = {
      key: settings[i].key,
      description: settings[i].description,
      value: settings[i].value,
    };
  }

  return ret;
}


exports.get = function(req, res, next) {
  Setting.findAll()
    .then(mapSettingsList)
    .then(function(results) {
      res.status(200).json(results);
    })
    .catch(function(err) {
      next(err);
    });
};



exports.set = function(req, res, next) {
  if (! req.body.settings || typeof(req.body.settings) !== 'object') {
    return next(
      errors.extraValidationProblem('settings', req.body.settings,
        'must be a key value map.'));
  }
  Setting.setSettings(req.body.settings)
    .then(mapSettingsList)
    .then(function(results) {
      res.status(200).json(results);

      // TODO should we send an email to admins?
    })
    .catch(function(err) {
      next(err);
    });
}
