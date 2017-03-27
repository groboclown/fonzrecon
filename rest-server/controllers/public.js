'use strict';

const models = require('../models');
const Setting = models.Setting;
const errors = require('./util').errors;


exports.siteSettings = function(res, req, next) {
  return Setting
    .getPublicSiteSettings()
    .then((settings) => {
      res.status(200).json({ settings: settings });
    })
    .catch((err) => {
      next(err);
    });
};
