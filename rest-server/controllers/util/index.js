'use strict';

module.exports = {
  paging: require('./paging'),
  jsonConvert: require('./json-convert'),
  errors: require('./errors'),
  emptyResults: function(pagination) {
    return {
        "results": [
          {}
        ],
        "options": pagination,
        "current": 0,
        "last": null,
        "prev": null,
        "next": null,
        "pages": [],
        "count": 0
    }
  }
};
