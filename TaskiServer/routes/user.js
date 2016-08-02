var express = require("express"),
    router = express.Router();

router.get("/", function (req, res) {
  res.send("User");
});

router.get("/:id", function (req, res) {
    res.json({"id": req.params.id});
});

router.post("/", function (req, res) {

});

module.exports = router;
