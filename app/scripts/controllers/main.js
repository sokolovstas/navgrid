'use strict';

angular.module('navGridApp')
	.controller('MainCtrl', function($scope, RemoteService) {
		$scope.awesomeThings = [{
			name: 'HTML5 Boilerplate'
		}, {
			name: 'AngularJS'
		}, {
			name: 'Karma'
		}, {
			name: 'Meridia'
		}, {
			name: 'Stels'
		}, {
			name: 'Stark'
		}, {
			name: 'AGang'
		}, {
			name: 'Alpin Bike'
		}, {
			name: 'Atom'
		}, {
			name: 'Author'
		}, {
			name: 'Hare'
		}, {
			name: 'Stern'
		}, {
			name: 'Black One'
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
