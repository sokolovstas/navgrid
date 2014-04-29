'use strict';

angular.module('navGridApp')
	.directive('navGrid', function($interpolate, $compile) {
		return {
			restrict: 'A',
			scope: true,
			link: function postLink(scope, element, attrs) {
				scope.dataSlice = new Array(3);

				scope.$watch(attrs.data, function(newValue) {
					scope.dataSlice = newValue;
				});

			}
		};
	});
