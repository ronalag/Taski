module.exports = function (app, passport) {
  var express = require("express"),
      sql = require("./../lib/sql")();

  app.post("/", function (req, res) {
      var data = req.body,
          password = data && data.password,
          username = data && data.username;

      sql.getUsers(username, password, function (userError, users) {
          if (userError) {
              res.json(userError);
              return;
          }

          if (!users.length) {
              res.json({"message": "User not found"});
              return;
          }

          sql.getSessions(username, function (sessionError, data1) {
              var func = function (sessionData) {
                  res.json(sessionData);
              };

              if (sessionError) {
                  res.json(sessionError);
                  return;
              }

              if (!data1.length) {
                  sql.createSession(username, function (sessionErr, data2) {
                      if (sessionErr) {
                          res.json(sessionErr);
                          return;
                      }

                      func(data2);
                  });
                  return;
              }

              func(data1);
          });
      });
  });

  app.post("/signup", passport.authenticate("local-signup", {
    "successRedirect": "/tasks",
    "failureRedirect": "/signup",
    "failureFlash": true
  }));


      sql = require("./../lib/sql")();

  router.post("/", function (req, res) {
      var data = req.body,
          password = data && data.password,
          username = data && data.username;

      sql.getUsers(username, password, function (userError, users) {
          if (userError) {
              res.json(userError);
              return;
          }

          if (!users.length) {
              res.json({"message": "User not found"});
              return;
          }

          sql.getSessions(username, function (sessionError, data1) {
              var func = function (sessionData) {
                  res.json(sessionData);
              };

              if (sessionError) {
                  res.json(sessionError);
                  return;
              }

              if (!data1.length) {
                  sql.createSession(username, function (sessionErr, data2) {
                      if (sessionErr) {
                          res.json(sessionErr);
                          return;
                      }

                      func(data2);
                  });
                  return;
              }

              func(data1);
          });
      });

      app.post("/signup");
  });
};
