const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

// Load User model
const User = require("../models/user");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "collegeEmail" },
      async (collegeEmail, password, done) => {
        // Match user
        await User.findOne({
          collegeEmail: collegeEmail,
        }).then((user) => {
          if (!user) {
            return done(null, false, {
              message: "That email is not registered",
            });
          } else {
            if (!user.status) {
              return done(null, false, {
                message: "Please verify your email.",
              });
            }
            bcrypt.compare(password, user.password, (err, result) => {
              if (err) {
                return done(err);
              } else {
                if (result === true) {
                  //login
                  return done(null, user);
                } else {
                  return done(null, false, { message: "Password incorrect" });
                }
              }
            });
          }
        });
      }
    )
  );

  passport.serializeUser(function (user, done) {
    return done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      return done(err, user);
    });
  });
};
