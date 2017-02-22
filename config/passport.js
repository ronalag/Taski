var LocalStrategy = require("passport-localapikey").Strategy,
    bcrypt = require("bcrypt-nodejs"),
    sql = require("../lib/sql"),

    generateHash = function (password) {
        bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

module.exports = function (passport) {

  passport.serializeUser(function (user, done) {
    return done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    sql.getUserById(id, function (error, user) {
      if (error) {
        return done({"error": error});
      }

      return done(null, user);
    });
  });

/*
  passport.use("local-signup", new LocalStrategy({
      "passReqToCallback": true
    },
    function (req, username, password, done) {
      sql.getUser(username, function (error, user) {
        var body = req && req.body,
            email = body && body.email,
            firstName = body && body.firstName,
            lastName = body && body.lastName,
            password = body && body.password,
            repeatPassword = body && body.repeatPassword,
            username = body && body.username;

        if (error) {
          //console.log(error);
          return done({"error": error});
        }

        if (user) {
          return done(
            null,
            false,
            req.flash("signupMessage", "Username is already taken!")
          );
        }

        if (!email || !firstName || !lastName || !password || !username) {
          return done(
            null,
            false,
            req.flash("signupMessage", "Missing required fields!")
          );
        }

        if (password !== repeatPassword) {
          return done(
            null,
            false,
            req.flash("signupMessage", "Passwords don't match!")
          );
        }

        sql.createUser({
              "email": email,
              "firstName": firstName,
              "lastName": lastName,
              "password": password,
              "username": username
        }, function (err, newUser) {
            if (err) {
              //console.log(err);
              return done({"error": err});
            }

            done(null, newUser);
        });
      });
    }));
    */
    passport.use(new LocalStrategy(function (apikey, done) {
      process.nextTick(function () {

      });
    }));
};
