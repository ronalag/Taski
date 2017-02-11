module.exports = function (passport) {
  var error = require("./../lib/error"),
      express = require("express"),
      missingArguments = {
        "error": "Missing Arguments!"
      },
      missingSessionId = {
        "error": "Missing Session ID!"
      },
      router = express.Router(),
      sql = require("./../lib/sql"),
      utility = require("./../lib/utility");

  router.get("/Account/:id", function (req, res) {
      var id = req.params.id;
  });

  router.delete("/Session", function (req, res) {
      var query = req && req.query,
          sessionId = query && query.sessionId;

      if (!sessionId) {
        return res.status(500).json(missingSessionId);
      }

      sql.getUserBySessionId(sessionId, function (err, user) {
        if (err) {
          return res.status(500).json(err);
        }

        sql.deleteSession(sessionId, function (err, isDeleted) {
            if (err) {
              return res.status(500).json(err);
            }

            return res.json({"isDeleted": isDeleted});
        });
      });
  });

  router.post("/Session", function (req, res) {
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
        var isSessionFound,
            session = Array.isArray(sessions) && sessions[0];

        if (error) {
          res.status(500).json({"error": error});
          return;
        }

        if (session) {
          res.json(session);
          return;
        }

        sql.createSession(username, function (error, session) {
          if (error) {
            return res.status(500).json({"error": error});
          }

          res.json(session);
        });
      });
    });
  });

  router.get("/Session/isValid", function (req, res) {
    var query = req && req.query,
        sessionId = query && query.sessionId;

    if (!sessionId) {
      return res.status(500).json(missingSessionId);
    }

    sql.getUserBySessionId(sessionId, function (err, user) {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({"isValid": user && user.username && true || false});
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

            if (newUser) {
              delete newUser.password;
            }
            
            return res.json(newUser);
        });
      });
    });

    router.get("/Tasks", function (req, res) {
        var query = req && req.query,
            sessionId = query && query.sessionId;

        if (!sessionId) {
          return res.status(400).json(missingSessionId);
        }

        sql.getUserBySessionId(sessionId, function (error, user) {
          var username = user && user.username;

          if (error) {
            return res.status(400).json(error);
          }

          if (!username) {
            return res.status(404).json({"error": "Invalid session!"});
          }

          sql.getTasks(username, function (error, tasks) {
              if (error) {
                return res.status(400).json(error);
              }

              return res.json(tasks);
          });
        });
    });

    router.post("/Task", function (req, res) {
      var body = req && req.body,
          description = body && body.description,
          dueDate = body && body.dueDate,
          isAllDayEvent = body && body.isAllDayEvent,
          isCompleted = body && body.isCompleted,
          query = req && req.query,
          sessionId = query && query.sessionId,
          title =  body && body.title;

      if (!sessionId) {
        return res.status(400).json(missingSessionId);
      }

      sql.getUserBySessionId(sessionId, function (error, user) {
        var object;

        if (error) {
          return res.status(500).json(error);
        }

        object = utility.cloneProperties({
          "object": body,
          "properties": [
            "description",
            "dueDate",
            "isAllDayEvent",
            "isCompleted",
            "title",
            "username"
          ]
        });
        object.username = user && user.username;

        sql.createTask(object, function (error, task) {
          if (error) {
            return res.status(400).json(error);
          }

          return res.json(task);
        });
      });
    });

    return router;
};
