'use strict';

// ==========================================================================
// Install pagination Query extension.
// Taken from https://github.com/lowol/mongoose-query-paginate
// (MIT license)
// However, that one doesn't properly support promises.  This version here
// supports *only* promises (not callbacks)
// Note that this replaces the `exec` call.

const mongoose = require('mongoose');

const defaults = {
  perPage: 10, // Number of items to display on each page.
  delta: 5, // Number of page numbers to display before and after the current one.
  page: 1, // Initial page number.
  offset: 0  // Offset number.
};

mongoose.Query.prototype.paginate = function(options) {

  options = options || defaults;
  options.perPage = options.perPage || defaults.perPage;
  options.delta = options.delta || defaults.delta;
  options.page = options.page || defaults.page;
  options.offset = options.offset || defaults.offset;

  const self = this;
  const model = self.model;
  var countPromise = model.count(self._conditions).exec();
  var execPromise = countPromise
    .then((count) => {
      let _skip = (options.page - 1) * options.perPage;
      _skip += options.offset;
      if (_skip <= 0) {
        return self.limit(+options.perPage).exec();
      }
      if (_skip >= count) {
        return [];
      }
      return self.skip(_skip).limit(+options.perPage).exec();
    });
  // Use the results from both the count and the exec calls.
  return Promise
    .all([countPromise, execPromise])
    .then((promiseValues) => {
      let count = promiseValues[0];
      let results = promiseValues[1] || [];
      let page = parseInt(options.page, 10) || 0;
      let delta = options.delta;
      let offsetCount = count - options.offset;
      offsetCount = offsetCount > 0 ? offsetCount : 0;
      let last = Math.ceil(offsetCount / options.perPage);
      let current = page;
      let start = page - delta > 1 ? page - delta : 1;
      let end = current + delta + 1 < last ? current + delta : last;

      let pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      let prev = !count || current == start ? null : current - 1;
      let next = !count || current == end ? null : current + 1;
      if (!offsetCount) {
        prev = next = last = null;
      }

      let pager = {
        results: results,
        options: options,
        current: current,
        last: last,
        prev: prev,
        next: next,
        pages: pages,
        count: count
      };
      return pager;
    });
};
// ==========================================================================
