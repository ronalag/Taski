(function () {
  var createNamespace = function (object, path) {
        var keys;

        if (!object || typeof path !== "string") {
          return;
        }

        keys = path.split(".");
        keys.forEach(function (key) {
          if (!object[key]) {
            object[key] = {};
          }
          object = object[key];
        });

        return
      },
      setContext = function () {
        var sessionData = sessionStorage &&
           sessionStorage.getItem("sessionData") || null;

        if (sessionData) {
           ronalag.taski.context = JSON.parse(sessionData);
        }
      };

  createNamespace(window, "ronalag.taski.model");
  createNamespace(window, "ronalag.taski.context");
  //setContext();
})();

/*
$(document).ready(function () {
  $.ajax({
    "url": "/login"
  })
  .done(function (data) {
    console.log("success");
    console.log(data);
  });
});
*/
