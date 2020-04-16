const localStrategy = require("passport-local").Strategy;
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

module.exports = (passport) => {
  passport.use(
    new localStrategy({ usernameField: "email" }, (email, password, done) => {
      User.findOne({ email: email }, (err, user) => {
        if (err) throw err;
        if (!user)
          return done(null, false, {
            type: "danger",
            message: "No user found",
          });

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) return done(null, user);
          return done(null, false, {
            type: "danger",
            message: "Password incorrect",
          });
        });
      });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
