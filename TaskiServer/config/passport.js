var LocalStrategy = require("passport-local").Strategy,
    bcrypt = require("bcrypt-nodejs"),
    sql = require("../lib/sql"),

    generateHash = function (password) {
        bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

module.exports = function (passport) {

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    sql.getUserById(id, function (error, user) {
      done(error, user);
    });
  });

};
