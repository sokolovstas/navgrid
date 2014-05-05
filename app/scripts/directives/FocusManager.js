'use strict';


angular.module('navGridApp')
	.factory('FocusManager', function($rootScope) {
	var focusManager = {};
	focusManager.items = [];

	// Set focus to nearest and strightest element in collection
	focusManager.working = false;
	focusManager.setFocusToNearest = function(scope, searchFunction, angleShift) {
		if (focusManager.working) {
			return;
		}
		focusManager.working = true;
		var finded = [];

		for (var i = focusManager.items.length - 1; i >= 0; i--) {
			var itemScope = focusManager.items[i];
			if (itemScope === scope.focusElement) {
				continue;
			}
			if (itemScope.focusElement.css('display') === 'none') {
				continue;
			}
			if ( !! scope.focusGroup && scope.focusGroup !== itemScope.focusGroup) {
				continue;
			}
			if (itemScope.focusElement[0].offsetWidth === 0 || itemScope.focusElement[0].offsetHeight === 0) {
				continue;
			}
			// Execute search function to add only interested objects
			if (searchFunction(itemScope, scope)) {
				finded.push({
					scope: itemScope
				});
			}
		}

		if (finded.length === 0) {
			focusManager.working = false;
			return;
		}

		// Find element center
		var centerY = scope.focusElement.offset().top + scope.focusElement.outerHeight() / 2;
		var centerX = scope.focusElement.offset().left + scope.focusElement.outerWidth() / 2;

		for (var f = finded.length - 1; f >= 0; f--) {
			var newScope = finded[f].scope;
			// Find center of object in finded objects
			var newCenterY = newScope.focusElement.offset().top + newScope.focusElement.outerHeight() / 2;
			var newCenterX = newScope.focusElement.offset().left + newScope.focusElement.outerWidth() / 2;

			// calculate delta x and delta y from current object
			finded[f].dx = centerX - newCenterX;
			finded[f].dy = centerY - newCenterY;
			// calculate distance from current object
			finded[f].d = Math.sqrt(Math.pow(finded[f].dx, 2) + Math.pow(finded[f].dy, 2));
			// caculate angle from current object using angle shift
			finded[f].angle = Math.abs(Math.abs(Math.atan2(finded[f].dy, finded[f].dx)) + angleShift);
		}

		// Sort array by distance using angle as multiple
		// Angle can be from 0 to PI
		// angle will be near zero when it is more straight to keyboard direction 
		finded = finded.sort(function(a, b) {
			return (a.d * (a.angle + 1)) - (b.d * (b.angle + 1));
		});

		var next = finded[0].scope;
		if (next) {
			setTimeout(function() {
				// clear and set new focus
				focusManager.working = false;
				focusManager.setFocus(next);
				//scope.clearFocus();
				//next.setFocus();
			});
		} else {
			focusManager.working = false;
		}
	};
	// on focus exit up, down, left, right
	focusManager.getUp = function(scope) {
		focusManager.setFocusToNearest(scope, function(newScope, scope) {
			return newScope.focusElement.offset().top < scope.focusElement.offset().top;
		}, -Math.PI / 2);
	};
	focusManager.getDown = function(scope) {
		focusManager.setFocusToNearest(scope, function(newScope, scope) {
			return newScope.focusElement.offset().top > scope.focusElement.offset().top;
		}, -Math.PI / 2);
	};
	focusManager.getLeft = function(scope) {
		focusManager.setFocusToNearest(scope, function(newScope, scope) {
			return newScope.focusElement.offset().left < scope.focusElement.offset().left;
		}, 0);
	};
	focusManager.getRight = function(scope) {
		focusManager.setFocusToNearest(scope, function(newScope, scope) {
			return newScope.focusElement.offset().left > scope.focusElement.offset().left;
		}, -Math.PI);
	};

	// clear focus from all elements
	focusManager.clearFocus = function() {
		for (var s = focusManager.items.length - 1; s >= 0; s--) {
			focusManager.items[s].clearFocus();
		}
	};

	focusManager.currentFocus = undefined;
	focusManager.setFocus = function(scope) {
		if (focusManager.currentFocus) {
			focusManager.currentFocus.clearFocus();
		}
		focusManager.currentFocus = scope;
		focusManager.currentFocus.setFocus();
	};

	focusManager.setFocusToElement = function(element) {
		focusManager.setFocus(element.scope());
	};

	//register nav item to focus manager
	focusManager.registerNavItem = function(scope) {
		if (scope.setFocus) {
			focusManager.items.push(scope);
			if (scope.focusByDefault) {
				setTimeout(function() {
					focusManager.setFocus(scope);
				});
			}
		}
	};
	focusManager.unregisterNavItem = function(scope) {
		focusManager.items.splice(focusManager.items.indexOf(scope), 1);
	};
	return focusManager;
});