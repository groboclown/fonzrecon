var JwtStrategy = require('passport-jwt').Strategy;

// load up the user model
var User = require('../lib/model/user');

module.exports = {
  setup: function(passport) {
    var opts = {};
    var ret = passport.initialize();
    opts.secretOrKey = require('../config/secret')();
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
      User.findOne({id: jwt_payload.id})
        .then(user => {
          if (user) {
              done(null, user);
          } else {
              done(null, false);
          }
        })
        .catch(error => {
          return done(err, false);
        });
    }));
    return ret;
  },
  authenticate: function(passport) {
    return passport.authenticate('jwt', { session: false });
  }
};
