'use strict';

function MockODM(dataEntries) {
  this._data = dataEntries;
  this.methods = {};
}

function matches(entry, mapper) {
  for (var key in mapper) {
    if (mapper.hasOwnProperty(key)) {
      if (entry[key] === undefined || entry[key] !== mapper[key]) {
        return false;
      }
    }
  }
  return true;
}

MockODM.prototype.findOne = function(mapper, cb) {
  mapper = mapper || {};
  for (var i = 0; i < this._data.length; i++) {
    if (matches(this._data[i], mapper)) {
      return cb(null, this.extractData(this._data[i]));
    }
  }
  cb(null, null);
};

MockODM.prototype.find = function(mapper, cb) {
  var found = [];
  mapper = mapper || {};
  for (var i = 0; i < this._data.length; i++) {
    if (matches(this._data[i], mapper)) {
      found.push(this.extractData(this._data[i]));
    }
  }
  cb(null, found);
};

MockODM.prototype.extractData = function(orig) {
  return orig;
};

module.exports = MockODM;
