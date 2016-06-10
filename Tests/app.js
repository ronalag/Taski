
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
                "username": "test",
                "password": "pwd"
            }
        })
        .done(function (json) { 
            console.log(json);
        });

});
