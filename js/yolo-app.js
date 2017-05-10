'use strict';

/* App Module */
var yoloApp = angular.module('yoloApp', [
    'ngRoute',
    'yoloControllers'
    ]);

yoloApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider){
        $routeProvider.
        when('/', {
            templateUrl: 'partials/main.html',
            controller: 'MainCtrl' }).
        when('/dashboard', {
            templateUrl: '/partials/bucketlists.html',
            controller: 'DashboardCtrl'
        }).
        when('/search/:searchTerm',  {
            templateUrl: '/partials/search.html',
            controller: 'SearchCtrl'
        }).
        when('/viewbucketlist/:id', {
            templateUrl: '/partials/viewbucketlist.html',
            controller: 'BucketlistCtrl'
        });
        $locationProvider.html5Mode(false).hashPrefix('!');
        }]);