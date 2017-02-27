'use strict';

// ==========================================================================
// Install pagination Query extension.
// Taken from https://github.com/lowol/mongoose-query-paginate
// (MIT license)
// However, it doesn't properly support promises.  This version here
// supports *only* promises (not callbacks)
// Note that this replaces the `exec` call.

const mongoose = require('mongoose');

const defaults = {
  perPage: 10, // Number of items to display on each page.
  delta  :  5, // Number of page numbers to display before and after the current one.
  page   :  1, // Initial page number.
  offset :  0  // Offset number.
};

mongoose.Query.prototype.paginate = function(options) {

  options = options || defaults;
  options.perPage = options.perPage || defaults.perPage;
  options.delta = options.delta || defaults.delta;
  options.page = options.page || defaults.page;
  options.offset = options.offset || defaults.offset;

  const query = this;
  const model = query.model;
  var countPromise = model.count(query._conditions).exec();
  var execPromise = countPromise
    .then(function(count) {
      let _skip = (options.page - 1) * options.perPage;
      _skip += options.offset;
      return query.skip(_skip).limit(+options.perPage).exec();
    });
  // Use the results from both the count and the exec calls.
  return Promise.all([countPromise, execPromise]).then(function(promiseValues) {
      let count = promiseValues[0];
      let results = promiseValues[1] || [];
      let page = parseInt(options.page, 10) || 0;
      let delta = options.delta;
      let offset_count = count - options.offset;
      offset_count = offset_count > 0 ? offset_count : 0;
      let last = Math.ceil(offset_count / options.perPage);
      let current = page;
      let start = page - delta > 1 ? page - delta : 1;
      let end = current + delta + 1 < last ? current + delta : last;

      let pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      let prev = !count || current == start ? null : current - 1;
      let next = !count || current == end ? null : current + 1;
      if (!offset_count) {
        prev = next = last = null;
      }

      let pager = {
        'results': results,
        'options': options,
        'current': current,
        'last': last,
        'prev': prev,
        'next': next,
        'pages': pages,
        'count': count
      };
      return pager;
    });
};
// ==========================================================================
