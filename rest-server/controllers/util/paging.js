'use strict';

exports.extract = function(req) {
  var ret = {};

  setIfInt(req.query.page, ret, 'page');
  setIfInt(req.query.perPage, ret, 'perPage');
  setIfInt(req.query.offset, ret, 'offset');
  setIfInt(req.query.delta, ret, 'delta');
  if (req.body.page) {
    setIfInt(req.body.page.page, ret, 'page');
    setIfInt(req.body.page.perPage, ret, 'perPage');
    setIfInt(req.body.page.offset, ret, 'offset');
    setIfInt(req.body.page.delta, ret, 'delta');
  }
  return ret;
};



function setIfInt(value, obj, key) {
  var x;
  if (isNaN(value)) {
    // Do not set
    return;
  }
  x = parseFloat(value);
  if ((x | 0) === x) {
    // It's an integer
    obj[key] = parseInt(value);
  }
}
