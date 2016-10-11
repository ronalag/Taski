module.exports = function (passport) {
  var error = require("./../lib/error"),
      express = require("express"),
      missingArguments = {
        "error": "Missing Arguments!"
      },
      router = express.Router(),
      sql = require("./../lib/sql");

  router.get("/Account/:id", function (req, res) {
      var id = req.params.id;
  });

  router.post("/Login", function (req, res) {
    var body = req.body,
        password = body && body.password,
        username = body && body.username;

    if (!username || !password) {
      return res.status(400).json(missingArguments);
    }

    sql.authenticate(username, password, function (error, isAuthenticated) {
      if (error) {
        return res.status(500).json({"error": error});
      }

      if (!isAuthenticated) {
        return res.status(400).json({"error": "Incorrect username and/or password!"});
      }

      sql.getSessions(username, function (error, sessions) {
        var isSessionFound;

        if (error) {
          return res.status(500).json({"error": error});
        }

        isSessionFound = Array.isArray(sessions) &&
          sessions.some(function (session) {            
            if (session.remoteIp === req.iq) {
              res.json(session);
              return true;
            }
          });

        if (!isSessionFound) {
          sql.createSession(username, function (error, session) {
            if (error) {
              return res.status(500).json({"error": error});
            }

            res.json(session);
          });
        }
      });
    });
  });

  router.post("/Signup", function (req, res) {
    var username,
        utility = require("./../lib/utility");

    username = utility.resolvePath(req, "body.username");

    if (!username) {
      return res.status(400).json(missingArguments);
    }

    sql.getUser(username, function (error, user) {
      var body = req && req.body,
          email = body && body.email,
          firstName = body && body.firstName,
          lastName = body && body.lastName,
          password = body && body.password,
          repeatPassword = body && body.repeatPassword,
          username = body && body.username;

      if (error) {
        return res.status(500).json({"error": error});
      }

      if (user) {
        return res.status(409).json({"error": "Username is already taken!"});
      }

      if (!email || !firstName || !lastName || !password || !username) {
        return res.status(400).json(missingArguments);
      }

      if (password !== repeatPassword) {
        return res.status(409).json({"error": "Passwords don't match!"});
      }

      sql.createUser({
            "email": email,
            "firstName": firstName,
            "lastName": lastName,
            "password": password,
            "username": username
        }, function (err, newUser) {
            if (err) {
              return res.status(500).json({"error": err});
            }

            return res.json(newUser);
        });
      });
    });

    router.post("/Task", function (req, res) {

    });

    return router;
};
