(function () {
  var app = angular.module("Taski", ["ngRoute"]);
  app.config(function ($routeProvider) {
    $routeProvider
      .when("/", {
            "templateUrl": "/home"
        })
      .when("/login", {
            "templateUrl": "/login"
        })
      .when("/tasks", {
            "templateUrl": "/tasks"
        });
  });
  ronalag.taski.model.Taski = app;
})();
