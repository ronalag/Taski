var config = require("./../config"),
    mysql = require("mysql"),
    pool = mysql.createPool({
        "connectionLimit": config && config.connectionLimit,
        "host": config && config.host,
        "user": config && config.user,
        "password": config && config.password,
        "database": config && config.database
    }),
    utility = require("./utility");

module.exports = function () {
  return {
    "createSession": function (username, callback) {
        var id;

        if (!username) {
            callback({"message": "username isn't supplied"});
            return;
        }
        console.log(utility);
        id = utility.createGuid();
        pool.query("INSERT INTO sessions SET ?", {"username": username, "id": id},
            function (error, result) {
                if (error) {
                    callback(error);
                    return;
                }

                console.log(result);
                callback(null, id);
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
    "getUsers": function (username, password, callback) {
        if (!username || !password) {
            callback({"message":"Missing username and/or password"});
            return;
        }

        pool.query("SELECT * FROM user WHERE username = ? AND PASSWORD = ?",
            [username, password], function (error, results, fields) {
                if (error) {
                    callback(error);
                    return;
                }

                callback(null, results);
            });
    },
    "getUserById": function (id, callback) {
      if (!id) {
        callback({"message":"Missing id"});
        return;
      }

      pool.query("SELECT * FROM user WHERE id = ?",
        [id], function (error, results, fields) {
          if (error) {
            callback(error);
            return;
          }

          callback(null, results);
        });
    },
    
  };
};
