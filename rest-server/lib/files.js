'use strict'

const fs = require('fs');
const path = require('path');


exports.ROOT_DIR = path.resolve(__dirname + '../..') + '/';
exports.pathFromRoot = function(path) {
  return path.resolve(ROOT_DIR + path);
}

exports.isFileReadable = function(filename) {
  return new Promise(function(resolve, reject) {
    fs.access(filename, fs.constants.R_OK, function(err) {
      console.log(`${filename} exists? ${! err}`);
      resolve(! err);
    });
  });
};

/**
 * Returns a list of tuples: [filename, boolean] for each filename in the
 * input list.
 */
exports.getFileReadableStatus = function(filenames) {
  var stats = filenames.map(function(name) { return exports.isFileReadable(name); });
  return Promise
    .all(stats)
    .then(function(res) {
      let ret = [];
      for (let i = 0; i < filenames.length; i++) {
        ret.push([filenames[i], res[i]]);
      }
      return ret;
    });
};


exports.isDirectory = function(dirname) {
  return new Promise(function(resolve, reject) {
    fs.stat(filename, function(err, stats) {
      if (err) {
        // Most likely, the location does not exist.
        return resolve(false);
      }
      return stats.isDirectory();
    });
  });
};
