(function () {
  var app = angular.module("Taski", ["ngRoute"]);
  app.config(function ($routeProvider) {
    $routeProvider
      .when("/", {
            "templateUrl": "/home"
        })
      .when("/login", {
            "controller": "login",
            "templateUrl": "/login"
        })
      .when("/signup", {
            "controller": "signup",
            "templateUrl": "/signup"
        })
      .when("/tasks", {
            "templateUrl": "/tasks"
        })
      .otherwise({
        "template": "<h1>None</h1><p>Nothing has been selected,</p>"
      });
  });

  app.controller("login", function ($scope, $http) {
    $scope.isValidPassword = true;

    $scope.login = function () {
      if (!$scope.username || !$scope.password) {
          $scope.isValidPassword = false;
          return;
      }

      $http({
          "method": "POST",
          "url": "/API/Login",
          "data": {
            "username": $scope.username,
            "password": $scope.password
          }
        })
        .then(function (response) {

        });

    };
  });
  app.controller("signup", function ($scope, $http) {
    $scope.signup = function () {

    };
  });
  ronalag.taski.model.Taski = app;
})();
