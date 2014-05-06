'use strict';

var navigation = angular.module('directives.navigation', []);

var NavItemController = function controller($scope, $element, $attrs, $interpolate, FocusManager) {
	// Set and clear focus
	$scope.setFocus = function() {
		$element.addClass('active');
		$scope.focused = true;
		if ($scope.onSetFocus) {
			$scope.onSetFocus();
		}
	};
	$scope.clearFocus = function() {
		$element.removeClass('active');
		$scope.focused = false;
		if ($scope.onClearFocus) {
			$scope.onClearFocus();
		}
	};
	// Focus element
	$scope.focusElement = $element;
	if ($attrs.focusGroup) {
		$scope.focusGroup = $interpolate($attrs.focusGroup)($scope);
	}

	// If have flag default-focus set it
	$scope.focusByDefault = $attrs.defaultFocus === '';
	// Register in focus manager
	FocusManager.registerNavItem($scope);

	$element.addClass('nav-item');

	$element.on('click', function() {
		FocusManager.setFocus($scope);
	});

	// On destroy remove it from focus manager
	$scope.$on('$destroy', function() {
		FocusManager.unregisterNavItem($scope);
		$element.off();
		$scope.focusElement = null;
		$element.remove();
	});
};



navigation.directive('navGridItem', function($interpolate, $parse, RemoteService, FocusManager) {
	return {
		priority: 0,
		restrict: 'A',
		scope: true,
		compile: function compile(tElement, tAttrs, transclude) {
			return function postLink(scope, iElement, iAttrs, controller) {

				iElement.addClass('nav-grid--nav-item');

				iElement.on('click', function(event) {
					if (iAttrs.dontPreventDefault === 'true') {
						scope.$emit('focusNavGridItemInNavGrid', iElement, scope.getData(), scope.getItem());
					} else {
						if (!iElement.hasClass('active')) {
							scope.$emit('focusNavGridItemInNavGrid', iElement, scope.getData(), scope.getItem());
							scope.$emit('setNavGridXY', iElement);
							event.preventDefault();
							event.stopPropagation();
						} else {
							if (iElement.attr('nav-click')) {
								$parse(iElement.attr('nav-click'))(scope);
							}
						}
					}
				});

				iElement.on('enter', function(event) {
					if (iAttrs.dontPreventDefault === 'true') {
						scope.$emit('focusNavGridItemInNavGrid', iElement, scope.getData(), scope.getItem());
					} else {
						if (iElement.attr('nav-click')) {
							$parse(iElement.attr('nav-click'))(scope);
						}
					}
				});

				iElement.on('mouseover', function() {
					if (iAttrs.focusOnHover !== 'false') {

					}
				});
				scope.getData = function() {
					return iAttrs.navGridData;
				};

				scope.getItem = function() {
					return iAttrs.navGridItem;
				};

				scope.$on('$destroy', function() {
					iElement.off();
				});
			};
		}
	};
});




navigation.directive('navGrid', function($parse, $injector) {
	return {
		priority: 0,
		restrict: 'A',
		scope: true,
		controller: function controller($scope, $rootScope, $element, $attrs, $location, $parse, RemoteService, FocusManager) {

			$injector.invoke(NavItemController, null, {
				$scope: $scope,
				$element: $element,
				$attrs: $attrs
			});

			$scope.elements = {};
			$scope.yScroll = 0;
			$scope.xScroll = 0;

			$scope.yOverflowItem = 1;
			$scope.xOverflowItem = 1;

			$element.addClass('nav-grid');

			if ($('.nav-grid--scroller', $element).length === 0) {
				$($element.children()[0]).addClass('nav-grid--scroller');
			}

			$scope.scroller = $('.nav-grid--scroller', $element);

			//Размер матрицы для отображения в списке
			$scope.matrix = function() {
				//Задаю размер матрицы
				if ($attrs.horizontalItem && $attrs.horizontalItem > 0) {
					$scope.xItems = Number($attrs.horizontalItem);
					$scope.xItemsOrigin = $scope.xItems;
				} else {
					$scope.xItems = 1;
				}
				if ($attrs.verticalItem && $attrs.verticalItem > 0) {
					$scope.yItems = Number($attrs.verticalItem);
					$scope.yItemsOrigin = $scope.yItems;
				} else {
					$scope.yItems = 1;
				}
				//Задаю текущий элемент матрицы
				$scope.x = 0;
				$scope.y = 0;
				//Задаю скрытые элементы для прокрутки
				switch ($attrs.layout) {
					case 'vertical':
						$scope.yItems = $scope.yItems + $scope.yOverflowItem;
						break;
					case 'horizontal':
						$scope.xItems = $scope.xItems + $scope.xOverflowItem;
						break;
					case 'both':
						$scope.yItems = $scope.yItems + $scope.yOverflowItem;
						$scope.xItems = $scope.xItems + $scope.xOverflowItem;
						break;
				}
			};

			$scope.matrix();

			$scope.elementsToVisibleArray = function() {
				var x, y;
				var item = 0;
				$scope.elements = {};
				$scope.elementsArray = $('.nav-grid--scroller').children();
				for (y = 0; y < $scope.yItems; y++) {
					for (x = 0; x < $scope.xItems; x++) {
						if (!$scope.elementsArray[item]) {
							break;
						}
						$scope.elements[(x + $scope.xScroll) + ':' + (y + $scope.yScroll)] = $scope.elementsArray[item++];
					}
				}
			};

			$scope.$watch($attrs.navGrid.split('|')[0].trim(), function(value) {
				if (value) {
					$scope.navGridDataLength = value.length;
					$scope.value = value;
				}

				$scope.getVisibleItem();

				setTimeout(function() {
					$scope.elementsToVisibleArray();
					$scope.invalidateSize();
				});
			});

			$scope.invalidateSize = function() {
				if (!$scope.containerHeight || !$scope.containerWidth) {
					$scope.containerHeight = $($element).innerHeight();
					$scope.containerWidth = $($element).innerWidth();
					switch ($attrs.layout) {
						case 'vertical':
							//$scope.containerHeight = $($element).innerHeight();
							$scope.navGridItemHeight = $('.nav-grid--nav-item', $element).eq(0).outerHeight(true);
							break;
						case 'horizontal':
							$scope.navGridItemWidth = $('.nav-grid--nav-item', $element).eq(0).outerHeight(true);
							//$scope.containerWidth = $($element).innerWidth();
							break;
						case 'both':
							$scope.navGridItemHeight = $('.nav-grid--nav-item', $element).eq(0).outerHeight(true);
							$scope.navGridItemWidth = $('.nav-grid--nav-item', $element).eq(0).outerHeight(true);
							break;
					}
				}
			};

			$scope.getVisibleItem = function() {
				switch ($attrs.layout) {
					case 'vertical':
						$scope.navGridItems = $scope.value.slice($scope.yScroll * $scope.xItems, $scope.xItems * $scope.yItems + ($scope.yScroll * $scope.xItems));
						break;
					case 'horizontal':
						$scope.navGridItems = $scope.value.slice($scope.xScroll * $scope.yItems, $scope.xItems * $scope.yItems + ($scope.xScroll * $scope.yItems));
						break;
				}

				setTimeout(function() {
					$scope.$apply();
					$scope.elementsToVisibleArray();
				});
			};

			$scope.$on('focusNavGridItemInNavGrid', function(event, element, data, item) {
				$('.nav-grid--nav-item', $element).removeClass('active');
				$(element).addClass('active');
				$scope.selectedData = data;
				$scope.selectedItem = item;
				setTimeout(function() {
					$scope.$apply();
				});
			});
			//Координаты элемента по клику
			$scope.$on('setNavGridXY', function(event, element) {
				var index = $(element).index();
				$scope.y = index / $scope.xItems | 0;
				$scope.x = index - $scope.y * $scope.xItems;
			});

			$scope.rebuildList = function(coordinate) {
				if ($scope[coordinate] - $scope[coordinate + 'Scroll'] === $scope[coordinate + 'Items'] - $scope[coordinate + 'OverflowItem']) {
					$scope[coordinate + 'Scroll']++;
					$scope.getVisibleItem();
					//анимация
					/*					$('.nav-grid--scroller').css('margin-top', -$scope.navGridItemHeight + 'px');
					setTimeout(function(){
						console.log('Анимация');
						$('.nav-grid--scroller').css('transition', '');
						$('.nav-grid--scroller').css('margin-top', '0px');
						
						$('.nav-grid--scroller').css('transition', 'all');
					}, 500);*/
				} else if ($scope[coordinate] - $scope[coordinate + 'Scroll'] === 0 && $scope[coordinate + 'Scroll'] > 0) {
					$scope[coordinate + 'Scroll']--;
					$scope.getVisibleItem();
				}
			};

			$scope.setFocus = function() {
				setTimeout(function() {
					if (!$scope.elements[$scope.x + ':' + $scope.y]) {
						$scope.x--
					}
					$scope.$emit('focusNavGridItemInNavGrid', $scope.elements[$scope.x + ':' + $scope.y], angular.element($scope.elements[$scope.x + ':' + $scope.y]).scope().getData(), angular.element($scope.elements[$scope.x + ':' + $scope.y]).scope().getItem());
				});
			};

			$scope.animateTime = 100;

			$scope.loopFunction = function(x, coordinate) {
				if ($scope[coordinate] >= 0 && $scope[coordinate] < Math.ceil($scope.navGridDataLength / $scope[$scope.coordinatParam + 'Items'])) {
					$scope.rebuildList(coordinate);
				} else {
					if ($scope[coordinate] < 0) {
						//Y Для выборки данных
						$scope[coordinate] = Math.ceil($scope.navGridDataLength / $scope[$scope.coordinatParam + 'Items']);
						$scope[coordinate + 'Scroll'] = $scope[coordinate] - ($scope[coordinate + 'Items'] - $scope[$scope.coordinatParam + 'OverflowItem']);
						$scope.getVisibleItem();
						//Y для установки фокуса
						$scope[coordinate]--;
						/*						//число элементов в полседней строке для устновки фокуса
						if (coordinate === 'y') {
							$scope.lastRowColumnCount = $scope.navGridDataLength % $scope[$scope.coordinatParam + 'Items'];
							if ($scope.lastRowColumnCount < $scope[coordinate + 'Items'] && $scope[coordinate] + 1 > $scope.lastRowColumnCount) {
								$scope[coordinate]--;
							}
						}*/
					} else if ($scope[coordinate] === Math.ceil($scope.navGridDataLength / $scope[$scope.coordinatParam + 'Items'])) {
						$scope[coordinate] = 0;
						$scope[coordinate + 'Scroll'] = 0;
						$scope.getVisibleItem();
					}
				}
				$scope.setFocus();
			};

			$scope.noLoopFunction = function(x, coordinate) {
				if ($scope[coordinate] >= 0 && $scope[coordinate] < Math.ceil($scope.navGridDataLength / $scope[$scope.coordinatParam + 'Items'])) {
					$scope.rebuildList(coordinate);
					$scope.setFocus();
				} else {
					$scope[coordinate] = $scope[coordinate] - x;
				}
			};

			$scope.changeNavgridFocusPosition = function(x, coordinate) {
				if ($scope[coordinate] >= 0 && $scope[coordinate] < $scope[coordinate + 'Items']) {
					$scope.setFocus();
				} else {
					$scope[coordinate] = $scope[coordinate] - x;
					return true;
				}
			};

			$scope.selcetNewNavgridItem = function(x, coordinate) {
				switch (coordinate) {
					case 'y':
						$scope.coordinatParam = 'x';
						$scope.orientationParam = 'vertical';
						$scope.loopOrientatonParam = 'vertical'
						break;
					case 'x':
						$scope.coordinatParam = 'y';
						$scope.orientationParam = 'horizontal';
						$scope.loopOrientatonParam = 'horizontal'
						break;
				};

				$scope[coordinate] = $scope[coordinate] + x;

				if ($attrs.layout === $scope.orientationParam || $attrs.layout === 'both') {
					if ($attrs.loop && ($attrs.loop === $scope.loopOrientatonParam || $attrs.loop === 'both')) {
						$scope.loopFunction(x, coordinate);
					} else {
						$scope.noLoopFunction(x, coordinate);
					}
					return false;
				} else {
					$scope.changeNavgridFocusPosition(x, coordinate);
				}
			};

			if ($attrs.hasScroller && $attrs.hasScroller === 'true') {
				$scope.$watch('y', function() {
					$scope.$broadcast('scrollWork', $scope.y);
				});
			}

			$scope.onKeyPress = function(code) {
				switch (code) {
					case RemoteService.KEY_LEFT:
						if ($attrs.focusLeft && $attrs.focusLeft !== '') {
							setTimeout(function() {
								FocusManager.setFocusToElement($($attrs.focusUp));
								return;
							}, 0);
						} else if ($scope.selcetNewNavgridItem(-1, 'x')) {
							if (FocusManager.getRight($scope)) {
								return;
							}
						}

						break;
					case RemoteService.KEY_RIGHT:
						if ($attrs.focusRight && $attrs.focusRight !== '') {
							setTimeout(function() {
								FocusManager.setFocusToElement($($attrs.focusRight));
								return;
							}, 0);
						} else if ($scope.selcetNewNavgridItem(1, 'x')) {
							if (FocusManager.getRight($scope)) {
								return;
							}
						}
						break;
					case RemoteService.KEY_UP:
						if ($attrs.focusUp && $attrs.focusUp !== '') {
							setTimeout(function() {
								FocusManager.setFocusToElement($($attrs.focusUp));
								return;
							}, 0);
						} else if ($scope.selcetNewNavgridItem(-1, 'y')) {
							if (FocusManager.getUp($scope)) {
								return;
							}
						}
						break;
					case RemoteService.KEY_DOWN:
						if ($attrs.focusDown && $attrs.focusDown !== '') {
							setTimeout(function() {
								FocusManager.setFocusToElement($($attrs.focusDown));
								return;
							}, 0);
						} else if ($scope.selcetNewNavgridItem(1, 'y')) {
							if (FocusManager.getDown($scope)) {
								return;
							}
						}
						break;
					case RemoteService.SCROLL_UP:
						if ($scope.layout === 'horizontal') {
							$scope.onKeyPress(RemoteService.KEY_LEFT);
						}
						if ($scope.layout === 'vertical') {
							$scope.onKeyPress(RemoteService.KEY_UP);
						}
						break;
					case RemoteService.SCROLL_DOWN:
						if ($scope.layout === 'horizontal') {
							$scope.onKeyPress(RemoteService.KEY_RIGHT);
						}
						if ($scope.layout === 'vertical') {
							$scope.onKeyPress(RemoteService.KEY_DOWN);
						}
						break;
					case RemoteService.ENTER:
						var selectedElement = $scope.elements[$scope.x + ':' + $scope.y];
						if (selectedElement.attr('href')) {
							window.location.href = selectedElement.attr('href');
						} else {
							selectedElement.trigger('click');
							selectedElement.trigger('enter');
						}
						break;
				}
			};

			$scope.$watch($attrs.lastY, function(value) {
				if (value && (value = Number(value)) !== $scope.y) {
					setTimeout(function() {
						if ($scope.elements[$scope.x + ':' + $scope.y]) {
							$($scope.elements[$scope.x + ':' + $scope.y]).removeClass('active');
						}
						$scope.y = value;

						if (!$scope.elements[$scope.x + ':' + $scope.y]) {
							$scope.yScroll = $scope.y - ($scope.yItems - $scope.yOverflowItem);
							$scope.rebuildList('y');
							$scope.setFocus();
						}
					});
				}
			});

			$scope.$watch($attrs.lastX, function(value) {
				if (value && (value = Number(value)) !== $scope.x) {
					setTimeout(function() {
						if ($scope.elements[$scope.x + ':' + $scope.y]) {
							$($scope.elements[$scope.x + ':' + $scope.y]).removeClass('active');
						}
						$scope.x = value;

						if (!$scope.elements[$scope.x + ':' + $scope.y]) {
							$scope.yScroll = $scope.x - ($scope.yItems - $scope.xOverflowItem);
							$scope.rebuildList('x');
							$scope.setFocus();
						}
					});
				}
			});

			$scope.$on('scrollUp', function(event) {
				$scope.onKeyPress(RemoteService.KEY_UP);
			});
			$scope.$on('scrollDown', function(event) {
				$scope.onKeyPress(RemoteService.KEY_DOWN);
			});
			$scope.$on('getItemLength', function(event) {
				$scope.$broadcast('returnItemLength', $scope.navGridDataLength, $scope.containerHeightInPixels, $attrs.horizontalItem);
			});


			/*			$scope.throttle = $attrs.throttle || 10;
			$scope.throttledDown3 = $.throttle($scope.throttle * 10, true, $scope.onKeyPress);
			$scope.throttledDown2 = $.throttle($scope.throttle * 5, true, $scope.onKeyPress);
			$scope.throttledDown = $.throttle($scope.throttle, true, $scope.onKeyPress);
			$scope.throttledUp = $.throttle($scope.throttle, true, $scope.onKeyUp);*/

			$scope.onKeyPressWrapper = function(code) {
				if (code === RemoteService.SCROLL_UP || code === RemoteService.SCROLL_DOWN) {
					$scope.onKeyPress(code);
				} else {
					$scope.onKeyPress(code);
				}
			};
			$scope.onKeyUpWrapper = function(code) {
				if (code === RemoteService.SCROLL_UP || code === RemoteService.SCROLL_DOWN) {
					$scope.onKeyUp(code);
				} else {
					//$scope.onKeyUp(code);
				}
			};
			$scope.onKeyUp = function(code) {
				if (!$scope.focused) {
					return;
				}
				//$($scope.scroller).css('transition', '');
				//$scope.pressedCount = 0;
			};
			// Bind to remote service and listen for key press


			RemoteService.bindKeyDown($scope.onKeyPressWrapper, $scope);
			RemoteService.bindKeyUp($scope.onKeyUpWrapper, $scope);
		},
		compile: function compile(tElement, tAttrs, transclude) {
			return function postLink(scope, iElement, iAttrs, controller) {
				if (iAttrs.focusOnHover !== 'false') {
					iElement.on('mouseover', function() {
						setTimeout(function() {
							//FocusManager.setFocusToElement(iElement);
						});
					});
				}
			};
		}
	};
});

navigation.directive('navItem', function($injector, $location, FocusManager) {
	return {
		priority: 0,
		restrict: 'A',
		scope: true,
		controller: function controller($scope, $element, $attrs, $parse, RemoteService, FocusManager) {
			$injector.invoke(NavItemController, null, {
				$scope: $scope,
				$element: $element,
				$attrs: $attrs
			});

			$scope.onKeyPress = function(code) {
				if (!$scope.focused) {
					return;
				}
				switch (code) {
					case RemoteService.KEY_LEFT:
						if ($element.attr('on-left')) {
							$parse($element.attr('on-left'))($scope);
						} else {
							if ($attrs.focusLeft && $attrs.focusLeft !== '') {
								setTimeout(function() {
									FocusManager.setFocusToElement($($attrs.focusLeft));
								});
							} else {
								FocusManager.getLeft($scope);
							}
						}
						break;
					case RemoteService.KEY_RIGHT:
						if ($element.attr('on-right')) {
							$parse($element.attr('on-right'))($scope);
						} else {
							if ($attrs.focusRight && $attrs.focusRight !== '') {
								setTimeout(function() {
									FocusManager.setFocusToElement($($attrs.focusRight));
								});
							} else {
								FocusManager.getRight($scope);
							}
						}
						break;
					case RemoteService.KEY_UP:
						if ($element.attr('on-up')) {
							$parse($element.attr('on-up'))($scope);
						} else {
							if ($attrs.focusUp && $attrs.focusUp !== '') {
								setTimeout(function() {
									FocusManager.setFocusToElement($($attrs.focusUp));
								});
							} else {
								FocusManager.getUp($scope);
							}
						}
						break;
					case RemoteService.KEY_DOWN:
						if ($element.attr('on-down')) {
							$parse($element.attr('on-down'))($scope);
						} else {
							if ($attrs.focusDown && $attrs.focusDown !== '') {
								setTimeout(function() {
									FocusManager.setFocusToElement($($attrs.focusDown));
								}, 0);
							} else {
								FocusManager.getDown($scope);
							}
						}
						break;
					case RemoteService.ENTER:
						if ($element.attr('on-enter')) {
							$parse($element.attr('on-enter'))($scope);
						} else {
							if ($element.attr('href')) {
								window.location.href = $element.attr('href');
							} else {
								$element.trigger('click');
							}
						}
						break;
				}
			};
			$scope.onSetFocus = function() {
				if ($element.attr('on-active')) {
					$parse($element.attr('on-active'))($scope);
				}
				if ($attrs.activateBy === 'hover') {
					setTimeout(function() {
						$scope.onKeyPress(RemoteService.ENTER);
					});
				}
			};

			// Bind to remote service and listen for key press

			RemoteService.bindKeyDown($scope.onKeyPress, $scope);

			$scope.$on('$destroy', function() {
				RemoteService.unbindKeyDown($scope.onKeyPress, $scope);
				$element.remove();
			});
		},
		compile: function compile(tElement, tAttrs, transclude) {
			return function postLink(scope, iElement, iAttrs, controller) {
				if (iAttrs.focusOnHover !== 'false') {
					/*iElement.on('mouseover', function() {
						setTimeout(function() {
							FocusManager.setFocusToElement(iElement);
						});
					});*/
				}
			};
		}
	};
});

navigation.directive('navGridScroller', function($interpolate) {
	return {
		priority: 0,
		restrict: 'A',
		templateUrl: 'scroller.html',
		scope: true,
		controller: function controller($scope, $element, $attrs) {
			var _scrollerContainerHeight;

			if ($attrs.horizontal && $attrs.horizontal === 'horizontal') {

			} else {
				$element.addClass('global-scroll--vertical');
				$scope._scrollerContainerHeight = $scope.containerHeight + 'px';
			}

			$scope._scrollerClickTop = function() {
				$scope.$emit('scrollUp');
			};
			$scope._scrollerClickDown = function() {
				$scope.$emit('scrollDown');
			};

			$scope.$on('returnItemLength', function(event, length, height, rowItem) {
				//$scope._scrollerContainerHeight = height - 108;

				//Число строк в навгриде
				$scope.rows = Math.ceil(length / rowItem);
				if ($scope.rows === 1) {
					$scope._scrollerHeight = $scope._scrollerContainerHeight;
				} else {
					_scrollerContainerHeight = parseInt($scope._scrollerContainerHeight);
					$scope._scrollerHeight = (Number(_scrollerContainerHeight) / Number($scope.rows) < 50) ? (50 + 'px') : (parseInt(Number(_scrollerContainerHeight) / Number($scope.rows), 10)) + 'px';
				}
				$scope.progressStep = (_scrollerContainerHeight - parseInt($scope._scrollerHeight, 10)) / ($scope.rows - 1);
			});
			$scope.$on('scrollWork', function(event, currItem) {
				$scope._scrollerTop = $scope.progressStep * currItem + 'px';
			});
			$scope.$on('$destroy', function() {
				$element.remove();
			});
			$scope.$emit('getItemLength');
		},
		compile: function compile(tElement, tAttrs, transclude) {
			return function postLink(scope, iElement, iAttrs, controller) {

			};
		}
	};
});
