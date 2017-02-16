(function () {
  "use strict";
  var app = angular.module("Taski", ["ngRoute"]),
      promise;

      app.service("utilityService", [
        function () {
          return {
            constructUrl: function (param) {
              var parameters = param && param.parameters,
                  queryString = "?",
                  url = param && param.url,

                  isUndefined = function (value) {
                    return typeof value === "undefined";
                  };

              if (!Array.isArray(parameters) || typeof url !== "string") {
                return null;
              }

              parameters.forEach(function (parameter) {
                var key = parameter && parameter.key,
                    value = parameter && parameter.value;

                if ([key, value].some(isUndefined)) {
                  return;
                }

                queryString += key + "=" + encodeURIComponent(value);
              });

              return url + queryString;
            },
            resolvePath: function (obj, path) {
              var array = typeof path === "string" && path.split(".") || null,
                  i,
                  length = array && array.length || 0;

              for(i = 0; obj && i < length; i++) {
                obj = obj[array[i]];
              }

              return obj;
            }
          };
      }]);

  app.service("sessionService", [
    "$http",
    "$location",
    "$q",
    "$rootScope",
    "utilityService",
    function($http, $location, $q, $rootScope, utilityService) {
      var callbackInfos = [],
          ignoreClicks = false,
          that = {
            isLoggedIn: false,
            isValid: function (sessionId) {
              var deferred = $q.defer();

              if (sessionId) {
                $http({
                    "method": "GET",
                    "url": utilityService.constructUrl({
                      "url": "/API/Session/isValid",
                      "parameters": [{
                        "key": "sessionId",
                        "value": sessionId
                      }]
                    })
                  })
                  .then(function (response) {
                      var isValid = response && response.data &&
                            response.data.isValid || false;

                      that.isLoggedIn = isValid,
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
                    that.isLoggedIn = true;
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
                  "url": utilityService.constructUrl({
                    "url": "/API/session",
                    "parameters": [{
                      "key": "sessionId",
                      "value": sessionId
                    }]
                  })
                })
                .then(function (response) {
                  var isDeleted = utilityService.resolvePath(
                        response,
                        "data.isDeleted"
                      ),

                      deleteContext = function () {

                        ronalag.taski.context = null;
                        this.isLoggedIn = !isDeleted;

                        if (window.sessionStorage) {
                          sessionStorage.removeItem("sessionData");
                        }
                      }.bind(this);

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
                    "url": utilityService.constructUrl({
                      "url": "/API/Session/isValid",
                      "parameters": [{
                        "key": "sessionId",
                        "value": sessionId
                      }]
                    })
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
    "utilityService",
    function ($http, $q, utilityService) {
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
              "url": utilityService.constructUrl({
                "url": "/API/tasks",
                "parameters": [{
                  "key": "sessionId",
                  "value": sessionId
                }]
              })
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
        },
        getCachedTasks: function () {
          return cache.tasks;
        },
        currentTaskId: null
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
    "utilityService",
    function ($location, $scope, utilityService) {
      var sessionId = utilityService.resolvePath(
            ronalag,
            "taski.context.sessionId"
          );

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
    "utilityService",
    function ($location, $rootScope, $scope, sessionService, utilityService) {

      $scope.isValidPassword = true;

      $scope.login = function () {

        sessionService.login({
            "username": $scope.username,
            "password": $scope.password
          })
          .then(function (response) {
            var sessionId = utilityService.resolvePath (
                  response,
                  "data.sessionId"
                );

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
    "$location",
    "$scope",
    function ($http, $location, $scope) {
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
          .then(function (newUser) {
            $location.path("login");
            console.log(newUser);
          }, function (error) {
            console.log(error);
          });
      };
    }]);

  app.controller("task", [
    "$http",
    "$rootScope",
    "$scope",
    "taskService",
    "utilityService",
    function ($http, $rootScope, $scope, taskService, utilityService) {
        var onShow = function () {
          var id = taskService.currentTaskId,
              task,
              tasks = taskService.getCachedTasks();

          id && tasks.some(function (tsk) {
            if (tsk.id === id) {
              task = tsk;
              return true;
            }
          });

          if (!task) {
            return;
          }

          $scope.id = id;
          $scope.title = task.title;
          $scope.description = task.description || "";
        };
        $rootScope.$on("taskChanged", function (e) {
          onShow();
        });

        $scope.isEditing = $scope.isEditing || false;
        onShow();

        $scope.update = function () {
          var id =  $scope.id,
              sessionId = ronalag.taski.context.sessionId;

          if (!id) {
            return;
          }

          $http({
            "method": "PUT",
            "url": utilityService.constructUrl({
              "url": "/API/task",
              "parameters": [{
                "key": "sessionId",
                "value": sessionId
              }]
            }),
            "data": {
              "id": id,
              "description": $scope.description,
              "title": $scope.title
            }
          })
          .then(function (response) {
            var isUpdated = utilityService.resolvePath(
              response,
              "data.isUpdated"
            );

            if (isUpdated) {
              return;
            }
            console.log("error updating task");
            console.log(response);
          }, function (error) {
            console.log(error);
          })
        };
    }
  ]);

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

        $scope.create = function () {
          var sessionId = ronalag.taski.context.sessionId,
              title = $scope.title;

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

        $scope.setCurrentTaskId = function (id) {
          taskService.currentTaskId = id;
          $rootScope.$emit("taskChanged");
        };

        $scope.tasks = $scope.tasks || [];
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
