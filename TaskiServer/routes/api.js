module.exports = function (passport) {
  var express = require("express"),
      router = express.Router(),
      login = require("./login"),
      user = require("./user");

  router.get("/", function (req, res) {
  	res.send("Hello World!");
  });

  router.get("/Account/:id", function (req, res) {
      var id = req.params.id;
      console.log(id);
  });
  router.use("/User", user);
  router.use("/Login", login);

  return router;
};
