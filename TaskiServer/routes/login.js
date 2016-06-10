var express = require("express"),
    mysql = require("mysql"),
    router = express.Router();


router.post("/", function (req, res) {
    console.log("received");
    var text = JSON.stringify(req.body);
    console.log(text);
    res.send(text);
});

module.exports = router;