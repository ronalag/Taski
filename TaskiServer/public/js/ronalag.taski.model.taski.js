(function () {
  var app = angular.module("Taski", ["ngRoute"]),

      setContext = function () {
        var sessionData;

        if (ronalag.taski.context.sessionId) {
          return;
        }

        sessionData = sessionStorage &&
           sessionStorage.getItem("sessionData") || null;

        if (sessionData) {
           ronalag.taski.context = JSON.parse(sessionData);
        }
      };

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

  app.controller("home", function ($scope, $location) {
    setContext();

    if (ronalag.taski.context.sessionId && $location) {
      return $location.url("/tasks");
    }
    /*
    var sessionData = sessionStorage &&
      sessionStorage.getItem("sessionData") || null;

    if (sessionData && $location) {
        ronalag.taski.context = JSON.parse(sessionData);
        return $location.url("/tasks");
    }*/
  });

  app.controller("login", function ($scope, $http, $location) {

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
          var data = response && response.data;

          if (!data || !response.data.sessionId) {
            console.log("Unknown error");
            return;
          }

          if (sessionStorage) {
              sessionStorage.setItem("sessionData", JSON.stringify(data));
          }

          ronalag.taski.context = response.data;
          $location.url("/tasks");
        });

    };
  });

  app.controller("signup", function ($scope, $http) {
    $scope.signup = function () {
      if (!$scope.username || !$scope.password ||
            !$scope.repeatPassword || !$scope.firstName ||
            !$scope.lastName || !$scope.email ||
            $scope.password !== $scope.repeatPassword) {
              return;
      }

      $http({
          "method": "POST",
          "url": "/API/Signup",
          "data": {
            "username": $scope.username,
            "password": $scope.password,
            "repeatPassword": $scope.repeatPassword,
            "firstName": $scope.firstName,
            "lastName": $scope.lastName,
            "email": $scope.email
          }
        })
        .then(function (response) {
          //var sessionId = response && response.data && response.data.sessionId;
          ronalag.task.session = response && response.data || null;
          $locationProvider.path("tasks");
          console.log(response);
        }, function (response) {
          console.log(response);
        });
      };
    });

  app.controller("tasks", function ($scope, $http, $location) {
    var sessionId;

    setContext();

    sessionId = ronalag.taski.context.sessionId;

    if (sessionId) {
      $http({
          "method": "GET",
          "url": "/API/tasks?sessionId=" + encodeURIComponent(sessionId)
        })
        .success(function (tasks) {
          $scope.tasks = tasks;
        });
    } else {
      return $location.url("/login");
    }

    $scope.tasks = [];

    $scope.create = function () {
      var title = $scope.title;

      if (!title) {
        return;
      }

      $http({
          "method": "POST",
          "url": "/API/task?sessionId=" + encodeURIComponent(sessionId),
          "data": {
            "title": title
          }
        })
        .success(function (task) {
          $scope.tasks.push(task);
          $scope.tasks = $scope.tasks;
        });
    };
  });

  app.run([
  '$rootScope',
  function($rootScope, $location) {
    var func = function (event, next, current) {
      console.log(event);
      console.log(next);
      console.log(current);
    };
    // see what's going on when the route tries to change
    //$rootScope.$on("$routeChangeError", func);
    $rootScope.$on("$routeChangeStart", function (event, next, current) {

    });
    //$rootScope.$on("$routeUpdate", func);

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
