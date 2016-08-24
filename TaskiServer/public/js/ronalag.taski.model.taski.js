(function () {
  var app = angular.module("Taski", ["ngRoute"]);
  app.config(function ($routeProvider, $locationProvider) {
    //$locationProvider.html5Mode(true);

    $routeProvider
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
            "templateUrl": "/home"
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

  app.run([
  '$rootScope',
  function($rootScope) {
    var func = function (event, next, current) {
      console.log(event);
      console.log(next);
      console.log(current);
    };
    // see what's going on when the route tries to change
    $rootScope.$on("$routeChangeError", func);
    $rootScope.$on("$routeChangeStart", func);
    $rootScope.$on("$routeUpdate", func);

    // /$rootScope.$on("$routeChangeError", func);
    /*
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
      // next is an object that is the route that we are starting to go to
      // current is an object that is the route where we are currently
      /*
      var currentPath = current.originalPath;
      var nextPath = next.originalPath;

      console.log('Starting to leave %s to go to %s', currentPath, nextPath);

      consol
    });
    */
  }
]);
  ronalag.taski.model.Taski = app;
})();
