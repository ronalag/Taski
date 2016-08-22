var express = require("express"),
    router = express.Router();

router.get("/", function (req, res) {
    res.render("index", {});
});
router.get("/home", function (req, res) {
    res.render("home", {});
});
router.get("/login", function (req, res) {
    res.render("login", {});
});
router.get("/tasks", function (req, res) {
    res.render("tasks", {});
});
router.get("/signup", function (req, res) {
  res.render("signup", {});
});

module.exports = router;
