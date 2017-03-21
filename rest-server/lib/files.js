'use strict';

const fs = require('fs');
const path = require('path');


exports.ROOT_DIR = path.resolve(path.join(__dirname, '..'));
exports.pathFromRoot = function(name) {
  return path.resolve(path.join(exports.ROOT_DIR, name));
};

exports.isFileReadable = function(filename) {
  return new Promise((resolve, reject) => {
    fs.access(filename, fs.constants.R_OK, (err) => {
      resolve(!err);
    });
  });
};

/**
 * Returns a list of tuples: [filename, boolean] for each filename in the
 * input list.
 */
exports.getFileReadableStatus = function(filenames) {
  var stats = filenames.map((name) => { return exports.isFileReadable(name); });
  return Promise
    .all(stats)
    .then((res) => {
      let ret = [];
      for (let i = 0; i < filenames.length; i++) {
        ret.push([filenames[i], res[i]]);
      }
      return ret;
    });
};


exports.isDirectory = function(dirname) {
  return new Promise((resolve, reject) => {
    fs.stat(dirname, (err, stats) => {
      if (err) {
        // Most likely, the location does not exist.
        return resolve(false);
      }
      resolve(stats.isDirectory());
    });
  });
};


exports.getDirectoryStatus = function(dirnames) {
  return Promise
    .all(dirnames.map((name) => {
      return exports.isDirectory(name);
    }))
    .then((stats) => {
      let ret = [];
      for (let i = 0; i < dirnames.length; i++) {
        ret.push([dirnames[i], stats[i]]);
      }
      return ret;
    });
};
