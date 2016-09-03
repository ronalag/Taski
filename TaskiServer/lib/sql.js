var bcrypt = require("bcrypt-nodejs"),
    config = require("./../config"),
    mysql = require("mysql"),
    pool = mysql.createPool({
        "connectionLimit": config && config.connectionLimit,
        "host": config && config.host,
        "user": config && config.username,
        "password": config && config.password,
        "port": 3306,
        "database": config && config.database
    }),
    uuid = require("node-uuid"),
    utility = require("./utility");

module.exports = {
    "createSession": function (username, callback) {
        var id;

        if (!username) {
            callback({"message": "username isn't supplied"});
            return;
        }

        id = utility.createGuid();
        pool.query("INSERT INTO sessions SET ?", {
            "username": username,
            "id": id
          },
          function (error, result) {
                if (error) {
                    callback(error);
                    return;
                }

                callback(null, id);
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
        return callback({"message": "Missing required fields!"});
      }

      id = uuid.v4();

      bcrypt.hash(password, null, null, function (err, hash) {
        if (err) {
          return callback({"message": "Error saving password!"});
        }

        pool.query("INSERT INTO user " +
          "(username, firstName, lastName, email, id, password) " +
          "VALUES (?,?,?,?,?,?)",
          [username, firstName, lastName, email, id, hash],
          function (err, results) {
            if (err) {
              return callback(err);
            }

            self.getUserById(id, function (error, user) {
              if (err) {
                return callback(err);
              }

              return callback(null, user);
            });
          });
      });
    },
    "getSessions": function (username, callback) {
        if (!username) {
            callback({"message": "Missing username"});
            return;
        }

        pool.query("SELECT * FROM sessions WHERE username = ?", [username],
            function (error, results, fields) {
                if (error) {
                    callback(error);
                    return;
                }

                callback(null, results);
            });
    },
    "getUser": function (username, callback) {
        if (!username) {
            callback({"message":"Missing username and/or password"});
            return;
        }

        pool.query("SELECT * FROM user WHERE username = ?",
            [username], function (error, results, fields) {
                if (error) {
                    return callback({"error": error});
                }

                callback(null, results && results[0]);
            });
    },
    "getUserById": function (id, callback) {
      if (!id) {
        return callback({"message":"Missing id"});
      }

      pool.query("SELECT * FROM user WHERE id = ?",
        [id], function (error, results, fields) {
          if (error) {
            return callback(error);
          }

          callback(null, results && results[0]);
        });
    }
  };
