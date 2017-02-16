var bcrypt = require("bcrypt-nodejs"),
    config = require("./../config"),
    hashMessage = {
      "message": "Error hashing password!"
    },
    missingArguments = {
      "error": "Missing arguments!"
    },
    mysql = require("mysql"),
    pool = mysql.createPool({
        "connectionLimit": config && config.connectionLimit,
        "host": config && config.host,
        "user": config && config.username,
        "password": config && config.password,
        "port": config && config.port,
        "database": config && config.database
    }),
    saltRounds = config && config.saltRounds || 10,
    uuid = require("node-uuid"),
    utility = require("./utility");

module.exports = {
    "authenticate": function (username, password, callback) {

        if (typeof callback !== "function") {
          return;
        }

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

          bcrypt.compare(password, user.password, callback);
        });
    },
    "createSession": function (username, callback) {
        var id;

        if (typeof callback !== "function") {
          return;
        }

        if (!username) {
            return callback(missingArguments);
        }

        id = uuid.v4();
        pool.query("INSERT INTO session " +
          "SELECT ? AS id, user.id AS userid FROM user WHERE username = ?",
          [id,username], function (error, result) {
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

      if (typeof callback !== "function") {
        return;
      }

      if (!username) {
        return callback(missingArguments);
      }

      pool.query("INSERT INTO task (title, description, dueDate, " +
        "isAllDayEvent, isCompleted, userid) VALUES (?,?,?,?,?," +
         "(SELECT user.id from user where username = ?))",
        [
          title,
          description,
          dueDate,
          isAllDayEvent,
          isCompleted,
          username
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
          firstName = obj && obj.firstName,
          lastName = obj && obj.lastName,
          password = obj && obj.password,
          self = this,
          username = obj && obj.username;

      if (typeof callback !== "function") {
        return;
      }

      if (!email || !firstName || !lastName || !password || !username) {
        return callback(missingArguments);
      }

      try {
          bcrypt.genSalt(saltRounds, function (error, salt) {
            if (error) {
              callback(error);
              return;
            }

            bcrypt.hash(password, salt, null, function (error, hash) {
              if (error) {
                callback(error);
                return;
              }

              pool.query("INSERT INTO user " +
                  "(username, firstName, lastName, email, password) " +
                  "VALUES (?,?,?,?,?)",
                  [username, firstName, lastName, email, hash],
                  function (err, result) {
                    var id = result && result.insertId;

                    if (err) {
                      return callback(err);
                    }

                    if (!result || !result.affectedRows || !id) {
                      return callback(result);
                    }

                    return callback(null, {
                        "username": username,
                        "firstName": firstName,
                        "lastName": lastName,
                        "email": email,
                        "id": id,
                        "password": hash
                      });
                  });
            });
          });
        } catch (error) {
          console.log(error);
        }
    },
    "deleteSession": function (sessionId, callback) {
        if (typeof callback !== "function") {
          return;
        }

        if (!sessionId) {
          return callback(missingArguments);
        }

        pool.query("DELETE FROM session where id = ?", [sessionId],
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
    "deleteTask": function (taskInfo, callback) {
      var id = taskInfo && taskInfo.id,
          username = taskInfo && taskInfo.username;

      if (typeof callback !== "function") {
        return;
      }

      if (!id || !username) {
        callback(missingArguments);
        return;
      }

      pool.query("DELETE FROM task where id = ? AND EXISTS " +
        "(SELECT * FROM user WHERE task.userId = user.id AND username = ?)",
        [id, username],
        function (error, fields) {
          if (error) {
            callback(error);
            return;
          }

          callback(null, fields && fileds.affectedRows && true || false);
          return;
        });
    },
    "getSessions": function (username, callback) {
        if (typeof callback !== "function") {
          return;
        }

        if (!username) {
            return callback(missingArguments);
        }

        pool.query("SELECT username, session.id AS sessionId FROM `session` INNER JOIN `user` " +
        "ON session.userid = user.id WHERE username = ?", [username],
            function (error, results, fields) {
                if (error) {
                    return callback(error);
                }

                return callback(null, results);
            });
    },
    "getTasks": function (username, callback) {
        if (typeof callback !== "function") {
          return;
        }

        if (!username) {
            return callback(missingArguments);
        }

        try {
        pool.query("SELECT * FROM task WHERE EXISTS " +
          "(SELECT * FROM user WHERE user.username = ? " +
          "AND task.userid = user.id)",
          [username], function (error, results, fields) {
                if (error) {
                    return callback(error);
                }

                return callback(null, results);
            });
          } catch (err) {
              console.log(err);
          }
    },
    "getUser": function (username, callback) {
        if (typeof callback !== "function") {
          return;
        }

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
    "getUserBySessionId": function (sessionId, callback) {
        if (typeof callback !== "function") {
          return;
        }

        if (!sessionId) {
          return callback(missingArguments);
        }

        pool.query("SELECT * FROM `user` WHERE EXISTS " +
          "(SELECT * FROM `session` WHERE session.id = ? "+
          "AND user.id = userid)", [sessionId],
          function (error, results, fields) {
            if (error) {
              return callback(error);
            }

            callback(null, results && results[0]);
          });
    },
    "updateTask": function (task, callback) {
        var description = task && task.description,
            dueDate = task && task.dueDate,
            id = task && task.id,
            isAllDayEvent = task && task.isAllDayEvent,
            isCompleted = task && task.isCompleted,
            title = task && task.title;

        if (typeof callback !== "function") {
          return;
        }

        if (!id) {
          callback(missingArguments);
          return;
        }

        pool.query("UPDATE task SET description = ?, dueDate = ?, " +
          "isAllDayEvent = ?, isCompleted = ?, title = ? WHERE id = ?",
          [
            description,
            dueDate,
            isAllDayEvent,
            isCompleted,
            title,
            id
          ], function (error, fields) {
            if (error) {
              callback(error);
              return;
            }

            callback(null, {
              "hasDataChanged": fields && fields.changedRows && true || false,
              "isUpdated": fields && fields.affectedRows && true || false,
            });
          })
    }
  };
