'use strict';

angular.module('navGridApp')
	.controller('MainCtrl', function($scope, RemoteService) {
		$scope.awesomeThings = [{
			name: 'HTML5 Boilerplate - 0'
		}, {
			name: 'AngularJS - 1'
		}, {
			name: 'Karma - 2'
		}, {
			name: 'Meridia - 3'
		}, {
			name: 'Stels - 4'
		}, {
			name: 'Stark - 5'
		}, {
			name: 'AGang - 6'
		}, {
			name: 'Alpin Bike - 7'
		}, {
			name: 'Atom - 8'
		}, {
			name: 'Author - 9'
		}, {
			name: 'Hare - 10'
		}, {
			name: 'Stern - 11'
		}, {
			name: 'Black One - 12'
		}, {
			name: 'HTML5 Boilerplate - 13'
		}, {
			name: 'AngularJS - 14'
		}, {
			name: 'Karma - 15'
		}, {
			name: 'Meridia - 16'
		}, {
			name: 'Stels - 17'
		}, {
			name: 'Stark - 18'
		}, {
			name: 'AGang - 19'
		}, {
			name: 'Alpin Bike - 20'
		}, {
			name: 'Atom - 21'
		}, {
			name: 'Author - 22'
		}, {
			name: 'Hare - 23'
		}, {
			name: 'Stern - 24'
		}, {
			name: 'Black One - 25'
		}, {
			name: 'HTML5 Boilerplate - 26'
		}, {
			name: 'AngularJS - 27'
		}, {
			name: 'Karma - 28'
		}, {
			name: 'Meridia - 29'
		}, {
			name: 'Stels - 30'
		}, {
			name: 'Stark - 31'
		}, {
			name: 'AGang - 32'
		}, {
			name: 'Alpin Bike - 33'
		}, {
			name: 'Atom - 34'
		}, {
			name: 'Author - 35'
		}, {
			name: 'Hare - 36'
		}, {
			name: 'Stern - 37'
		}, {
			name: 'Black One - 38'
		}, {
			name: 'HTML5 Boilerplate - 39'
		}, {
			name: 'AngularJS - 40'
		}, {
			name: 'Karma - 41'
		}, {
			name: 'Meridia - 42'
		}, {
			name: 'Stels - 43'
		}, {
			name: 'Stark - 44'
		}, {
			name: 'AGang - 45'
		}, {
			name: 'Alpin Bike - 46'
		}, {
			name: 'Atom - 47'
		}, {
			name: 'Author - 48'
		}, {
			name: 'Hare - 48'
		}, {
			name: 'Stern - 49'
		}, {
			name: 'Black One - 50'
		}];
		window.sl = {};
		sl.forEach = function(object, callback) {
			var keys = Object.keys(object);
			var i, len = 0;
			for (i = 0, len = keys.length; i < len; i++) {
				callback(keys[i], object[keys[i]]);
			}
		};
		$scope.$on('navGridChangePosition', function(event, scope) {
			/*			console.log('xxxxxxx');*/
		});
		RemoteService.init('PC');
	});
