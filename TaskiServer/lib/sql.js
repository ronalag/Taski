var bcrypt = require("bcrypt-nodejs"),
    config = require("./../config"),
    hashMessage = {
      "message": "Error hashing password!"
    },
    missingArguments = {
      "error": "Missing arguments!"
    }
    mysql = require("mysql"),
    pool = mysql.createPool({
        "connectionLimit": config && config.connectionLimit,
        "host": config && config.host,
        "user": config && config.username,
        "password": config && config.password,
        "port": 3306,
        "database": config && config.database
    }),
    saltRounds = config && config.saltRounds || 10,
    uuid = require("node-uuid"),
    utility = require("./utility");

module.exports = {
    "authenticate": function (username, password, callback) {

        if (!username || !password) {
            return callback(missingArguments);
        }

        this.getUser(username, function (error, user) {
          if (error) {
            return callback({"error": error});
          }

          if (!user) {
            return callback({"error": "Incorrect username and/or password!"});
          }

          callback(null, bcrypt.compareSync(password, user.password));
          /*bcrypt.compare(password, user.password, callback); /*function (err, isValidPassword) {
              if (err) {
                return callback(hashMessage);
              }

              pool.query("SELECT * FROM user WHERE username = ? AND " +
                "password = ?", [username, hash], function (error, results) {

                  if (error) {
                    return callback(error);
                  }

                  callback(null, results && results.length > 0 || false);
                });
          });*/
        });
    },
    "createSession": function (username, callback) {
        var id;

        if (!username) {
            return callback(missingArguments);
        }

        id = uuid.v4();
        pool.query("INSERT INTO session (username, sessionId) " +
            "VALUES (?,?)", [username,id],
            function (error, result) {
                  if (error) {
                      return callback(error);
                  }

                  if (!result || !result.affectedRows) {
                      return callback(result);
                  }

                  return callback(null, {
                    "username": username,
                    "sessionId": id
                  });
              });
    },
    "createTask": function (obj, callback) {
      var description = obj && obj.description || null,
          dueDate = obj && obj.dueDate || null,
          isAllDayEvent = obj && obj.isAllDayEvent || false,
          isCompleted = obj && obj.isCompleted || false,
          title = obj && obj.title || null,
          username = obj && obj.username;          ;

      if (!username) {
        return callback(missingArguments);
      }

      pool.query("INSERT INTO tasks (username, title, description, " +
        "dueDate, isAllDayEvent, isCompleted) VALUES (?,?,?,?,?,?)",
        [
          username,
          title,
          description,
          dueDate,
          isAllDayEvent,
          isCompleted
        ], function (err, result) {
          var id = result && result.insertId;

          if (err) {
            return callback(err);
          }

          if (!result || !result.affectedRows || !id) {
            return callback(result);
          }

          return callback(null, {
              "id": id,
              "username": username,
              "description": description,
              "dueDate": dueDate,
              "isAllDayEvent": isAllDayEvent,
              "isCompleted": isCompleted,
              "title": title
            });
        });
    },
    "createUser": function (obj, callback) {
      var email = obj && obj.email,
          id,
          firstName = obj && obj.firstName,
          lastName = obj && obj.lastName,
          password = obj && obj.password,
          self = this,
          username = obj && obj.username;

      if (!email || !firstName || !lastName || !password || !username) {
        return callback(missingArguments);
      }

      id = uuid.v4();

      try {
          var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(saltRounds));
          pool.query("INSERT INTO user " +
              "(username, firstName, lastName, email, id, password) " +
              "VALUES (?,?,?,?,?,?)",
              [username, firstName, lastName, email, id, hash],
              function (err, result) {
                if (err) {
                  return callback(err);
                }

                if (!result || !result.affectedRows) {
                  return callback(result);
                }

                return callback(null, {
                    "username": username,
                    "firstName": firstName,
                    "lastName": lastName,
                    "email": email,
                    "id": id,
                    "hash": hash
                  });
              });
        } catch (error) {
          console.log(error);
        }
    },
    "deleteSession": function (sessionId, callback) {
        if (!sessionId) {
          return callback(missingArguments);
        }

        pool.query("DELETE FROM session where sessionId = ?", [sessionId],
          function (error, results, fields) {
            if (error) {
              return callback(error);
            }
            var obj = {
              results: results,
              fields: fields
            };
            console.log(obj);

            return callback(
              null,
              results && results.affectedRows && true || false
            );
          }
        );
    },
    "getSessions": function (username, callback) {
        if (!username) {
            return callback(missingArguments);
        }

        pool.query("SELECT * FROM session WHERE username = ?", [username],
            function (error, results, fields) {
                if (error) {
                    return callback(error);
                }

                return callback(null, results);
            });
    },
    "getTasks": function (username, callback) {
        if (!username) {
            return callback(missingArguments);
        }

        pool.query("SELECT * FROM tasks WHERE username = ?", [username],
            function (error, results, fields) {
                if (error) {
                    return callback(error);
                }

                return callback(null, results);
            });
    },
    "getUser": function (username, callback) {
        if (!username) {
            callback(missingArguments);
            return;
        }

        try {
        pool.query("SELECT * FROM user WHERE username = ?",
            [username], function (error, results, fields) {
                if (error) {
                    return callback({"error": error});
                }

                callback(null, results && results[0]);
            });
          } catch (err) {
            console.log(err);
          }
    },
    "getUserById": function (id, callback) {
      if (!id) {
        return callback(missingArguments);
      }

      pool.query("SELECT * FROM user WHERE id = ?",
        [id], function (error, results, fields) {
          if (error) {
            return callback(error);
          }

          callback(null, results && results[0]);
        });
    },
    "getUserBySessionId": function (sessionId, callback) {
        if (!sessionId) {
          return callback(missingArguments);
        }

        pool.query("SELECT * FROM session where sessionId = ?",
          [sessionId], function (error, results, fields) {
            if (error) {
              return callback(error);
            }

            callback(null, results && results[0]);
          });
    }
  };
