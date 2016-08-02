(function () {
  var app = angular.module("Taski", ["ngRoute"]);
  app.config(function ($routeProvider) {
    $routeProvider
      .when("/login", {
        "templateUrl": "/login"
      })
      .otherwise({
        "templateUrl": "/home"
      });

  });
  ronalag.taski.model.Taski = app;
})();
