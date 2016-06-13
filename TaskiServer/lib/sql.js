var mysql = require("mysql"),
    pool = mysql.createPool({
        "connectionLimit": 10,
        "host": "",
        "user": "",
        "password": "",
        "database": ""
    }),
    utility = require("./utility");

module.exports = {
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
    }
};
