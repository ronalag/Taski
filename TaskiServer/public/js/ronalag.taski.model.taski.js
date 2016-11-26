(function () {
  var app = angular.module("Taski", ["ngRoute"]);

  app.service("sessionService", function() {
    var callbackInfos = [];
    return {
      trigger: function (eventName) {
        callbackInfos.forEach(function (callbackInfo){
          if (callbackInfo.eventName === eventName &&
                typeof callbackInfo.callback === "function") {
            callbackInfo.callback(eventName);
          }
        });
      },
      register: function (eventName, callback) {
        if (eventName && callback) {
          callbackInfos.push({
            "eventName": eventName,
            "callback": callback
          });
        }
      }
    }
  });

  app.service("taskService", function ($http) {
    var cache = {};

    return {
      getTasks: function (sessionId, callback) {
        if (!sessionId) {
          return callback("Missing session Id");
        }

        if (cache.tasks) {
          return callback(null, cache.tasks);
        }

        $http({
            "method": "GET",
            "url": "/API/tasks?sessionId=" + encodeURIComponent(sessionId)
          })
          .success(function (tasks) {
            cache.tasks = tasks;
            return callback(null, tasks);
          })
          .error(function (error, status) {
            console.log(error);
            console.log(status);
          });
      },
      invalidate: function () {
        delete cache.tasks;
      }
    };
  });

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
          "url": "/API/Session",
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

  app.controller("navigation", function ($scope, $http, $location, sessionService) {
    sessionService.register("isLoading", function (eventName) {
      $scope.isUserMenuVisible = ronalag.taski.context.sessionId ? true : false;
    });

    $scope.isUserMenuVisible = $scope.isUserMenuVisible || false;

    $scope.logout = function () {
      var sessionId = ronalag.taski.context.sessionId;

      $http({
          "method": "DELETE",
          "url": "/API/session?sessionId=" + encodeURIComponent(sessionId),
        })
        .then(function (response) {
          isLogingOut = false;
          console.log(response);

          if (!response || !response.data || !response.data.isDeleted) {
            return;
          }

          delete ronalag.taski.context.sessionId;
          delete ronalag.taski.context.username;

          if (sessionStorage) {
            sessionStorage.removeItem("sessionData");
          }

          $scope.isUserMenuVisible = false;
          $location.url("/home");
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

  app.controller("tasks", function ($scope, $http, $location, sessionService, taskService) {
    var sessionId;
    sessionService.trigger("isLoading");

    sessionId = ronalag.taski.context.sessionId;

    if (sessionId) {
      taskService.getTasks(sessionId, function (error, tasks) {
        if (error) {
          console.log(error);
          return;
        }

        $scope.tasks = tasks || [];
      });

      /*
      $http({
          "method": "GET",
          "url": "/API/tasks?sessionId=" + encodeURIComponent(sessionId)
        })
        .success(function (tasks) {
          $scope.tasks = tasks;
        })
        .error(function (error, status) {
          if (status === 404) {
            sessionStorage.removeItem("sessionData");
            delete ronalag.taski.context.sessionId;
            delete ronalag.taski.context.username;
            $location.url("/home");
          }
          console.log(error);
          console.log(status);
        });
        */
    } else {
      return $location.url("/login");
    }

    $scope.tasks = $scope.tasks || [];

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
  '$location',
  '$http',
  function($rootScope, $location, $http) {
    var func = function (event, next, current) {
          console.log(event);
          console.log(next);
          console.log(current);
        },
        wipeSessionData = function () {
          if (sessionData) {
            sessionStorage.removeItem("sessionData");
          }
        };

    var sessionData = sessionStorage &&
          sessionStorage.getItem("sessionData") || null,
        sessionId,
        sessionObject = sessionData && JSON.parse(sessionData);

    sessionId = sessionObject && sessionObject.sessionId;

    if (sessionId) {
      $http({
          "method": "GET",
          "url": "/API/Session/isValid?sessionId=" + encodeURIComponent(sessionId)
        })
        .then(function (response) {
            var isValid = response && response.data && response.data.isValid;

            if (!isValid) {
              wipeSessionData();
              return;
            }

            ronalag.taski.context = sessionObject;
          }, function (error) {
            console.log(error);
            wipeSessionData();
          });
    }
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
