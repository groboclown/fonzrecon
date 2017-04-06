'use strict';

const staticFiles = require('../config/env').staticFiles;
const util = require('./util');
const errors = util.errors;
const models = require('../models');
const User = models.User;
const PrizeChoice = models.PrizeChoice;
const Setting = models.Setting;
const validate = require('../lib/validate');
const imageType = require('image-type');
const fs = require('fs');
const path = require('path');
const imageSizeOf = require('image-size');

const BASE_IMAGE_URI = '/static/uploads/';
const MAXIMUM_IMAGE_SIZE = { width: 512, height: 512 };

// Management of images.

exports.postPrize = function(req, res, next) {
  const prizeId = req.params.id;

  // Find any prize choice object w/ this id.
  const prizePromize = PrizeChoice.findOne({ _id: prizeId })
    .exec()
    .then((prize) => {
      if (!prize) {
        throw errors.resourceNotFound();
      }
      return prize;
    });
  const savedNamePromize = prizePromize
    .then(() => {
      return saveImage(req, 'prize', '' + prizeId);
    });
  return Promise
    .all([prizePromize, savedNamePromize])
    .then((args) => {
      const prize = args[0];
      const name = args[1];
      prize.imageUri = BASE_IMAGE_URI + name;
      return prize.save();
    })
    .then((prize) => {
      return res.status(201).json({ imageUri: prize.imageUri });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postUser = function(req, res, next) {
  const username = req.params.id;

  // Find any user object w/ this id.
  const userPromize = User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        throw errors.resourceNotFound();
      }
      return user;
    });
  const savedNamePromize = userPromize
    .then(() => {
      return saveImage(req, 'user', username);
    });
  return Promise
    .all([userPromize, savedNamePromize])
    .then((args) => {
      const user = args[0];
      const name = args[1];
      user.imageUri = BASE_IMAGE_URI + name;
      return user.save();
    })
    .then((user) => {
      return res.status(201).json({ imageUri: user.imageUri });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postSetting = function(req, res, next) {
  const settingId = req.params.id;

  // Find any user object w/ this id.
  const settingPromize = User.findFor([ settingId ])
    .then((settings) => {
      if (settings.length <= 0) {
        throw errors.resourceNotFound();
      }
      if (settings[0].valueType !== 'url' && settings[0].valueType !== 'url?') {
        throw validate.error(settingId, 'setting type',
          `setting must be a URL, but id ${settings[0].valueType}`);
      }
      return settings[0];
    });
  const savedNamePromize = settingPromize
    .then(() => {
      return saveImage(req, 'setting', settingId);
    });
  return Promise
    .all([settingPromize, savedNamePromize])
    .then((args) => {
      const settingValue = args[0];
      const name = args[1];
      settingValue.value = BASE_IMAGE_URI + name;
      return settingValue.save();
    })
    .then((settingValue) => {
      return res.status(201).json({ imageUri: settingValue.value });
    })
    .catch((err) => {
      next(err);
    });
};


const SUPPORTED_IMAGE_TYPES = ['png', 'jpg', 'bmp', 'gif'];

function saveImage(req, dirname, filenamePrefix) {
  if (!req.files || !req.files.image) {
    return Promise.reject(validate.error(null, 'image', '`image` multipart file not given'));
  }

  const fileType = imageType(req.files.image.data);
  if (!fileType || !SUPPORTED_IMAGE_TYPES.includes(fileType.ext)) {
    return Promise.reject(validate.error(
      null, 'image', 'filetype of image is not one of '
      + SUPPORTED_IMAGE_TYPES.join(', ')));
  }

  const size = imageSizeOf(req.files.image.data);
  if (!size) {
    return Promise.reject(validate.error(null, 'image',
      'size of the image could not be determined'));
  }
  if (size.width > MAXIMUM_IMAGE_SIZE.width || size.height > MAXIMUM_IMAGE_SIZE.height) {
    return Promise.reject(validate.error(`${size.width}x${size.height}`, 'image size',
      `image size must be less than or equal to ${MAXIMUM_IMAGE_SIZE.width}x${MAXIMUM_IMAGE_SIZE.height}`));
  }

  const outdir = path.join(staticFiles, dirname);
  const filename = filenamePrefix + '.' + fileType.ext;
  const outfile = path.join(outdir, filename);

  return mkdirp(outdir)
    .then(() => {
      return new Promise((resolve, reject) => {
        fs.writeFile(outfile, req.files.image.data, (err) => {
          if (err) {
            return reject(err);
          }
          return resolve(dirname + '/' + filename);
        });
      });
    });
}


function mkdirp(outdir) {
  let ret = Promise.resolve(null);
  let fileParts = path.resolve(outdir).split(path.sep);
  for (let i = 0; i < fileParts.length + 1; i++) {
    let p = fileParts.slice(0, i).join(path.sep);
    if (p && p.length > 0) {
      ret = _mkdir(ret, p);
    }
  }
  return ret;
}

function _mkdir(pr, outdir) {
  return pr.then(() => {
    return new Promise((resolve, reject) => {
      fs.mkdir(outdir, (err) => {
        if (err && err.code != 'EEXIST') {
          return reject(err);
        }
        resolve();
      });
    });
  });
}
