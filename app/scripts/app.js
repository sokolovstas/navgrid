'use strict';

angular.module('navGridApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'navGridApp',
  'service.remote',
  'directives.navigation',
  'ngRoute'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
