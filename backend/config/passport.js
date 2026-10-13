const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

module.exports = function(passport) {
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Local Strategy
  passport.use(
  new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done) => {
      try {
        const user = await User.findOne({
          username: username.trim()
        });

        if (!user) {
          return done(null, false, {
            message: 'Incorrect username or password.'
          });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          return done(null, false, {
            message: 'Incorrect username or password.'
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

  
};
