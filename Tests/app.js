
var jsdom = require("jsdom");

jsdom.env("", function (err, window) {
    var $ = require("jquery")(window);
    if (err) {
        console.error(err);
        return;
    }

    $
        .ajax({
            "method": "POST",
            "url": "http://localhost:3000/Login",
            "data": {
                "username": "admin",
                "password": "1234"
            }
        })
        .done(function (json) { 
            console.log(json);
        });
/*
    $.ajax({
        "method": "POST",
        "url": "http://localhost:3000/User",
        "data": {
            "sessionId": "f7ba55dc-50af-9cd1-9e00-0f2484f0c34a",
            "
        }
*/
});
