
module.exports = function() {
  return process.env.DATABASE_URL || 'mongodb://localhost:27017';
};
