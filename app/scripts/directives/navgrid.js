'use strict';

angular.module('navGridApp')
	.directive('navGrid', function($interpolate) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {
				scope.$watch(attrs.data, function(newValue) {
					console.log(newValue);
				});
			}
		};
	});
