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
  };
  createNamespace(window, "ronalag.taski.model");
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
