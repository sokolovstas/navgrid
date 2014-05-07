'use strict';

angular.module('navGridApp')
	.controller('MainCtrl', function($scope, RemoteService) {
		$scope.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma',
			'Meridia',
			'Stels',
			'Stark',
			'AGang',
			'Alpin Bike',
			'Atom',
			'Author',
			'Hare',
			'Stern',
			'Black One',
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma',
			'Meridia',
			'Stels',
			'Stark',
			'AGang',
			'Alpin Bike',
			'Atom',
			'Author',
			'Hare',
			'Stern',
			'Black One'
		];
		window.sl = {};
		sl.forEach = function(object, callback) {
			var keys = Object.keys(object);
			var i, len = 0;
			for (i = 0, len = keys.length; i < len; i++) {
				callback(keys[i], object[keys[i]]);
			}
		};
		RemoteService.init('PC');
	});
