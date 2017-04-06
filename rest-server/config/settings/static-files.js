'use strict';

const path = require('path');

module.exports = process.env.STATIC_FILES || path.join(__dirname, '../../static');
