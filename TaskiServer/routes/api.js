module.exports = function (passport) {
  var express = require("express"),
      router = express.Router()
      //login = require("./login"),
      //user = require("./user")
      ;

  /*
  router.get("/", function (req, res) {
  	res.send("Hello World!");
  });
  */

  router.get("/Account/:id", function (req, res) {
      var id = req.params.id;
      //console.log(id);
  });
  //router.use("/User", user);
  router.post(
    "/Signup",
    passport.authenticate("local-signup"),
    function (req, res) {
      //console.log(req.user);
      res.json(req.user);
    });
  //router.use("/Login", login)(passport);


  return router;
};
