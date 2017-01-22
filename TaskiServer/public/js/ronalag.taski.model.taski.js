(function () {
  var app = angular.module("Taski", ["ngRoute"]),
      promise,

      resolvePath = function (obj, path) {
        var array = typeof path === "string" && path.split(".") || null,
            i,
            length = array && array.length || 0;

        for(i = 0; obj && i < length; i++) {
          obj = obj[array[i]];
        }

        return obj;
      };

  app.service("sessionService", [
    "$http",
    "$location",
    "$q",
    "$rootScope",
    function($http, $location, $q, $rootScope) {
      var callbackInfos = [],
          ignoreClicks = false,
          that = {
            isLoggedIn: false,
            isValid: function (sessionId) {
              var deferred = $q.defer();

              if (sessionId) {
                $http({
                    "method": "GET",
                    "url": "/API/Session/isValid?sessionId=" +
                      encodeURIComponent(sessionId)
                  })
                  .then(function (response) {
                      var isValid = response && response.data &&
                            response.data.isValid || false;

                      this.isLoggedIn = isValid,
                      deferred.resolve(isValid);
                    }, function (error) {
                      console.log("Error checking whether session is valid");
                      console.log(error);
                      deferred.reject(error);
                    });
              } else {
                deferred.reject("No session found!");
              }

              return deferred.promise;
            },
            login: function (param) {
                var deferred = $q.defer(),
                    password = param && param.password,
                    promise = deferred.promise,
                    username = param && param.username;

                if (!username || !password) {
                    deferred.reject("Missing arguments!");
                    return promise;
                }

                $http({
                    "method": "POST",
                    "url": "/API/Session",
                    "data": {
                      "username": username,
                      "password": password
                    }
                  })
                  .then(function (response) {
                    var data = response && response.data;

                    if (!data || !data.sessionId) {
                      deferred.reject("Unknown error");
                      return;
                    }

                    if (window.sessionStorage) {
                        sessionStorage.setItem(
                          "sessionData",
                          JSON.stringify(data)
                        );
                    }

                    ronalag.taski.context = data;
                    this.isLoggedIn = true;
                    deferred.resolve(response);
                  });

              return promise;
            },
            logout: function () {
              var deferred = $q.defer(),
                  promise = deferred.promise,
                  sessionId = ronalag.taski.context.sessionId;

              if (!sessionId) {
                deferred.reject("Missing arguments!");
                return promise;
              }

              $http({
                  "method": "DELETE",
                  "url": "/API/session?sessionId=" +
                    encodeURIComponent(sessionId),
                })
                .then(function (response) {
                  var isDeleted = resolvePath(response, "data.isDeleted"),

                      deleteContext = function () {

                        ronalag.taski.context = null;
                        this.isLoggedIn = !isDeleted;

                        if (window.sessionStorage) {
                          sessionStorage.removeItem("sessionData");
                        }
                      };

                  console.log(response);

                  if (!isDeleted) {
                    this.isValid(sessionId)
                      .then(function (isValid) {
                        if (!isValid) {
                          deleteContext();
                        }
                        deferred.resolve(!isValid);
                      });
                  } else {
                    deleteContext();
                    deferred.resolve(isDeleted);
                  }

                }.bind(this), function (error) {
                }.bind(this));

              return promise;
            },
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
            },
            setSession: function (session) {
              var deferred = $q.defer(),
                  sessionData = window.sessionStorage &&
                    sessionStorage.getItem("sessionData") || null,
                  sessionId,
                  sessionObject = sessionData && JSON.parse(sessionData);

              sessionId = sessionObject && sessionObject.sessionId;

              if (sessionId) {

                $http({
                    "method": "GET",
                    "url": "/API/Session/isValid?sessionId=" +
                      encodeURIComponent(sessionId)
                  })
                  .then(function (response) {
                      var isValid = response && response.data &&
                            response.data.isValid || false;

                      if (!isValid) {
                        wipeSessionData();
                        return;
                      }

                      ronalag.taski.context = sessionObject;
                      $rootScope.$emit("sessionValidated", {
                        "error": null,
                        "isValid": isValid
                      });
                      deferred.resolve(isValid);
                    }, function (error) {
                      console.log(error);
                      wipeSessionData();
                      $rootScope.$emit("sessionValidated", {
                        "error": error,
                        "isValid": false
                      });
                      deferred.reject(error);
                    });
              } else {
                deferred.reject("No session found!");
              }
            }
          },

          setContext = function () {
            var sessionData,
                sessionId,
                sessionObject;

            if (!window.sessionStorage) {
              return;
            }

            sessionData = sessionStorage.getItem("sessionData");
            sessionObject = sessionData && JSON.parse(sessionData);
            sessionId = sessionObject && sessionObject.sessionId;

            if (!sessionId) {
              return;
            }

            that.isValid(sessionId)
              .then(function (isValid) {

                ronalag.taski.context = isValid ? sessionObject : null;
                that.isLoggedIn = isValid;

                if (!isValid && $location.path() === "/tasks") {
                  $location.url("/home");
                }

                $rootScope.$emit("sessionValidated", {
                  "error": null,
                  "isValid": isValid
                });
              }, function (error) {
                ronalag.taski.context = null;
              });
          };

      setContext();
      return that;
    }]);

  app.service("taskService", [
    "$http",
    "$q",
    function ($http, $q) {
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
        reset: function () {
          delete cache.tasks;
        }
      };
    }]);

  app.config([
    "$locationProvider",
    "$routeProvider",
    function ($locationProvider, $routeProvider) {
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
    }]);

  app.controller("home", [
    "$location",
    "$scope",
    function ($scope, $location) {
      var sessionId = resolvePath(ronalag, "taski.context.sessionId");

      if (sessionId && $location) {
        $location.url("/tasks");
        return;
      }
    }]);

  app.controller("login", [
    "$location",
    "$rootScope",
    "$scope",
    "sessionService",
    function ($location, $rootScope, $scope, sessionService) {

      $scope.isValidPassword = true;

      $scope.login = function () {

        sessionService.login({
            "username": $scope.username,
            "password": $scope.password
          })
          .then(function (response) {
            var sessionId = resolvePath (response, "data.sessionId");

            if (!sessionId) {
              return;
            }

            $rootScope.$emit("sessionValidated", {
              "error": null,
              "isValid": sessionId && true || false
            });

            $location.url("/tasks");
          }, function (error) {
            console.log(error);
          });
      };
    }]);

  app.controller("navigation", [
    "$http",
    "$location",
    "$rootScope",
    "$scope",
    "sessionService",
    "taskService",
    function (
      $http,
      $location,
      $rootScope,
      $scope,
      sessionService,
      taskService) {
        $rootScope.$on("sessionValidated", function (e) {

          $scope.isUserMenuVisible = sessionService.isLoggedIn;
        });

        $scope.isUserMenuVisible = sessionService.isLoggedIn;

        $scope.logout = function () {
          sessionService.logout()
            .then(function (isDeleted) {
              if (!isDeleted) {
                return;
              }

              $scope.isUserMenuVisible = false;
              taskService.reset();
              $location.url("/home");
            });
        };
    }]);

  app.controller("signup",[
    "$http",
    "$scope",
    function ($http, $scope) {
      $scope.signup = function () {
        if (!$scope.username || !$scope.password ||
              !$scope.repeatPassword || !$scope.firstName ||
              !$scope.lastName || !$scope.email ||
              $scope.password !== $scope.repeatPassword) {
                return;
              console.log($location);
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
            ronalag.task.session = response && response.data || null;
            $locationProvider.path("tasks");
            console.log(response);
          }, function (response) {
            console.log(response);
          });
      };
    }];

  app.controller("tasks", [
    "$rootScope",
    "$scope",
    "$http",
    "$location",
    "sessionService",
    "taskService",
    function (
      $rootScope,
      $scope,
      $http,
      $location,
      sessionService,
      taskService) {
        var getTasks = function () {
            var sessionId = ronalag.taski.context.sessionId;

            if (sessionId) {
              taskService.getTasks(sessionId, function (error, tasks) {
                if (error) {
                  console.log(error);
                  return;
                }

                $scope.tasks = tasks || [];
              });
            } else {
              return $location.url("/login");
            }
          };
        $rootScope.$emit("isLoading");

        promise && promise.then(getTasks) || getTasks();

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
      }]);

  app.run([
    '$rootScope',
    '$location',
    '$http',
    "$q",
    "sessionService",
    function($rootScope, $location, $http, $q, sessionService) {
      var func = function (event, next, current) {
            /*
            console.log(event);
            console.log(next);
            console.log(current);
            */
          };

      // see what's going on when the route tries to change
      $rootScope.$on("$routeChangeError", func);
      $rootScope.$on("$routeChangeStart", function (event, next, current) {

      });

      $rootScope.$on("$routeChangeSuccess", function (e, current, pre) {

      });
      $rootScope.$on("$routeUpdate", func);

      $rootScope.$on("$routeChangeError", func);

      $rootScope.$on('$routeChangeStart', function(event, next, current) {
        // next is an object that is the route that we are starting to go to
        // current is an object that is the route where we are currently
        var currentPath = current && current.originalPath || null;
        var nextPath = next && next.originalPath || null;

        console.log('Starting to leave %s to go to %s', currentPath, nextPath);

      });

  }]);

  ronalag.taski.model.Taski = app;
})();
