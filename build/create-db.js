var config = require("./../config"),
    connection,
    fs = require("fs"),
    mysql = require("mysql");

console.log("creating database");

if (!config || !config.host || !config.username || !config.password ||
    !config.database || !config.port) {
          console.log("Please setup config.js files before setting up " +
            "database.\nYou can use config.js.example as a template.");
          process.exit();
          return;
}

connection = mysql.createConnection({
    "host": config && config.host,
    "user": config && config.username,
    "password": config && config.password,
    "port": config.port,
    "database": config && config.database,
    "multipleStatements": true
});

fs.readFile("./taski.sql", "utf-8", function (error, data) {
  if (error) {
    console.log("error reading from taski.sql");
    console.log(error);
    return;
  }

  connection.query(data, function (error, results) {
    if (error) {
      console.log("error creating database");
      console.log(error);
      return;
    }

    console.log("Database created successfully. Exiting ...");
    process.exit(0);
  });
});
