﻿'use strict';

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

			$scope.yOverflowItem = 0;
			$scope.xOverflowItem = 0;

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
					switch ($attrs.layout) {
						case 'vertical':
							$scope.containerHeight = $($element).innerHeight();
							$scope.navGridItemHeight = $('.nav-grid--nav-item', $element).eq(0).outerHeight(true);
							break;
						case 'horizontal':
							$scope.navGridItemWidth = $('.nav-grid--nav-item', $element).eq(0).outerHeight(true);
							$scope.containerWidth = $($element).innerWidth();
							break;
						case 'both':
							$scope.containerHeight = $($element).innerHeight();
							$scope.containerWidth = $($element).innerWidth();
							$scope.navGridItemHeight = $('.nav-grid--nav-item', $element).eq(0).outerHeight(true);
							$scope.navGridItemWidth = $('.nav-grid--nav-item', $element).eq(0).outerHeight(true);
							break;
					}
				}
			};

			$scope.getVisibleItem = function() {
				//console.log(($scope.yScroll * $scope.xItems - 1) + ' , ' + ($scope.xItems * $scope.yItems + ($scope.yScroll * $scope.xItems)));
				switch ($attrs.layout) {
					case 'vertical':
						$scope.navGridItems = $scope.value.slice($scope.yScroll * $scope.xItems, $scope.xItems * $scope.yItems + ($scope.yScroll * $scope.xItems));
						break;
					case 'horizontal':
						console.log($scope.xScroll * $scope.yItems + ' , ' + ($scope.xItems * $scope.yItems + ($scope.xScroll * $scope.yItems)));
						$scope.navGridItems = $scope.value.slice($scope.xScroll * $scope.yItems, $scope.xItems * $scope.yItems + ($scope.xScroll * $scope.yItems));
						/*						$scope.emptyScroll = 0;
						$scope.navGridItems = [];
						for (var i = 0, len = $scope.value.length; i < len; i++) {
							if ($scope.emptyScroll < $scope.yItemsOrigin * $scope.xScroll && !!!i % $scope.xItemsOrigin) {
								$scope.emptyScroll++;
								continue;
							}
							console.log($scope.value[i]);
							$scope.navGridItems.push($scope.value[i]);
							if($scope.navGridItems.length === $scope.yItems * $scope.xItems){
								break;
							}
						}*/
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
				} else if ($scope[coordinate] - $scope[coordinate + 'Scroll'] === 0 && $scope[coordinate + 'Scroll'] > 0) {
					$scope[coordinate + 'Scroll']--;
					$scope.getVisibleItem();
				}
			};

			$scope.setFocus = function() {
				setTimeout(function() {
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
						//число элементов в полседней строке для устновки фокуса
						if (coordinate === 'y') {
							$scope.lastRowColumnCount = $scope.navGridDataLength % $scope[$scope.coordinatParam + 'Items'];
							if ($scope.lastRowColumnCount < $scope[coordinate + 'Items'] && $scope[coordinate] + 1 > $scope.lastRowColumnCount) {
								$scope[coordinate]--;
							}
						}
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

			$scope.onKeyPress = function(code) {
				switch (code) {
					case RemoteService.KEY_LEFT:
						if ($scope.selcetNewNavgridItem(-1, 'x')) {
							if (FocusManager.getRight($scope)) {
								return;
							}
						}
						break;
					case RemoteService.KEY_RIGHT:
						if ($scope.selcetNewNavgridItem(1, 'x')) {
							if (FocusManager.getRight($scope)) {
								return;
							}
						}
						break;
					case RemoteService.KEY_UP:
						if ($scope.selcetNewNavgridItem(-1, 'y')) {
							if (FocusManager.getUp($scope)) {
								return;
							}
						}
						break;
					case RemoteService.KEY_DOWN:
						if ($scope.selcetNewNavgridItem(1, 'y')) {
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


			/*			RemoteService.bindKeyDown($scope.onKeyPressWrapper, $scope);
			RemoteService.bindKeyUp($scope.onKeyUpWrapper, $scope);*/




			//Get params
			//coordinate
			/*			$scope.layout = $attrs.layout || 'vertical';

			//list loop
			$scope.loop = $attrs.loop;
			$scope.throttle = $attrs.throttle || 10;

			$scope.width = $scope.height = 0;

			// Get width and height
			$scope.containerWidthInPixels = $element.innerWidth();
			$scope.containerHeightInPixels = $element.innerHeight();*/

			// Total length of list



			/*			$scope.$watch(function() {
				return $('.nav-grid--nav-item-new', $scope.scroller).length;
			}, function(value) {
				$scope.elements = [];
				if ($scope.navGridData) {
					$scope.navGridDataLength = $scope.navGridData.length;
				} else {
					$scope.navGridDataLength = 0;
				}
				console.log('reinit');
				var items = $('.nav-grid--nav-item-new', $scope.scroller);
				for (var i = 0; i < items.length; i++) {
					$(items[i]).scope().reinit();
				}
				$scope.$broadcast('returnItemLength', $scope.navGridDataLength, $scope.containerHeightInPixels, $scope.containerWidth);
			});*/

			/*			$scope.lockScroll = false;
			$rootScope.$on('scrollTimeBlock', function() {
				if (!$scope.lockScroll) {
					$scope.lockScroll = true;
				} else {
					$scope.lockScroll = false;
				}

			});*/

			/*$scope.onSetFocus = function() {
				if ($element.attr('on-active')) {
					$parse($element.attr('on-active'))($scope);
				}
				if ($scope.elements[$scope.x + ':' + $scope.y]) {
					$scope.elements[$scope.x + ':' + $scope.y].addClass('active');
				} else {
					if ($scope.elements['1:1']) {
						$scope.x = $scope.y = 1;
						$scope.scrollX = 0;
						$scope.scrollY = 0;
						$($scope.scroller).css('margin', '0px');
						setTimeout(function() {
							$scope.invalidateItems();
							$scope.invalidateSelection();
							$scope.$apply();
						});
					}
				}
			};
			$scope.onClearFocus = function() {
				if ($element.attr('on-deactive')) {
					$parse($element.attr('on-deactive'))($scope);
				}
				if ($scope.elements[$scope.x + ':' + $scope.y]) {
					$scope.elements[$scope.x + ':' + $scope.y].removeClass('active');
				}
			};
			$scope.onKeyPressWrapper = function(code) {
				if (code === RemoteService.SCROLL_UP || code === RemoteService.SCROLL_DOWN) {
					$scope.onKeyPress(code);
				} else {
					if ($scope.pressedCount > 8) {
						$scope.throttledDown2(code);
					} else if ($scope.pressedCount > 0) {
						$scope.throttledDown3(code);
					} else if ($scope.pressedCount === 0) {
						$scope.onKeyPress(code);
					}
				}
			};

			$scope.onKeyPress = function(code) {
				if (!$scope.focused || $scope.lockScroll) {
					return;
				}
				$scope.pressedCount++;
				var checkSpan = false;
				var oldX = $scope.x;
				var oldY = $scope.y;
				// Remove old focus
				if ($scope.elements[$scope.x + ':' + $scope.y]) {
					$scope.elements[$scope.x + ':' + $scope.y].removeClass('active');
				}
				switch (code) {
					case RemoteService.KEY_LEFT:
						if ($attrs.whirligig && $attrs.whirligig === '1') {
							$scope.whirligigScroll = 'left';
						}
						if ($element.attr('on-left')) {
							$parse($element.attr('on-left'))($scope);
						} else if ($attrs.focusLeft && $attrs.focusLeft !== '') {
							setTimeout(function() {
								FocusManager.setFocusToElement($($attrs.focusLeft));
								return;
							}, 0);
							FocusManager.setFocusToElement($($attrs.focusLeft));
							return;
						} else {
							$scope.x--;
							if ($scope.x < 1) {
								if ($scope.loop === 'horizontal' || $scope.loop === 'both') {
									$scope.x = $scope.width;
									$scope.scrollX = $scope.x - $scope.containerWidth;
								} else {
									$scope.x = 1;
									if (FocusManager.getLeft($scope)) {
										return;
									}
								}
							} else {
								checkSpan = true;
							}
						}

						break;
					case RemoteService.KEY_RIGHT:
						if ($attrs.whirligig && $attrs.whirligig === '1') {
							$scope.whirligigScroll = 'right';
						}
						if ($element.attr('on-right')) {
							$parse($element.attr('on-right'))($scope);
						} else if ($attrs.focusRight && $attrs.focusRight !== '') {
							setTimeout(function() {
								FocusManager.setFocusToElement($($attrs.focusRight));
								return;
							}, 0);
							FocusManager.setFocusToElement($($attrs.focusRight));
							return;
						} else {
							$scope.x++;
							if ($scope.x > $scope.width || ($scope.y === $scope.height && $scope.containerWidth * ($scope.height - 1) + $scope.x > $scope.navGridDataLength)) {
								if ($scope.loop === 'horizontal' || $scope.loop === 'both') {
									$scope.x = 1;
									$scope.scrollX = 0;
								} else {
									$scope.x = $scope.width;
									if (FocusManager.getRight($scope)) {
										return;
									}
								}
							} else {
								checkSpan = true;
							}
						}

						break;
					case RemoteService.KEY_UP:
						if ($attrs.focusUp && $attrs.focusUp !== '') {
							setTimeout(function() {
								FocusManager.setFocusToElement($($attrs.focusUp));
								return;
							}, 0);
							FocusManager.setFocusToElement($($attrs.focusUp));
							return;
						} else if ($scope.y === 1 && $attrs.scrollLock === 'lock') {
							FocusManager.setFocusToElement($('.' + $element[0].lastElementChild.className + ' >a').eq(0));
							return;
						} else {
							$scope.y--;
							if ($scope.y < 1) {
								if ($scope.loop === 'vertical' || $scope.loop === 'both') {
									$scope.y = $scope.height;
									$scope.scrollY = $scope.y - $scope.containerHeight;
								} else {
									$scope.y = 1;
									if (FocusManager.getUp($scope)) {
										return;
									}
								}

							} else {
								checkSpan = true;
							}
						}

						break;
					case RemoteService.KEY_DOWN:
						if ($attrs.focusDown && $attrs.focusDown !== '') {
							setTimeout(function() {
								FocusManager.setFocusToElement($($attrs.focusDown));
								return;
							}, 0);
						} else if ($scope.y === $scope.navGridDataLength && $attrs.scrollLock === 'lock') {
							FocusManager.setFocusToElement($('.' + $element[0].lastElementChild.className + ' >a').eq($scope.navGridDataLength - 1));
							return;
						} else {
							$scope.y++;
							if ($scope.y > $scope.height || ($scope.x === $scope.width && $scope.containerHeight * ($scope.width - 1) + $scope.y > $scope.navGridDataLength)) {
								if ($scope.loop === 'vertical' || $scope.loop === 'both') {
									$scope.y = 1;
									$scope.scrollY = 0;
								} else {
									$scope.y = $scope.height;
									if (FocusManager.getDown($scope)) {
										return;
									}
								}
							} else {
								checkSpan = true;
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
				if (checkSpan) {
					if ($scope.elements[$scope.x + ':' + $scope.y] === $scope.elements[oldX + ':' + oldY]) {
						$scope.onKeyPress(code);
						return;
					}
				}

				var element = $($scope.elements[$scope.x + ':' + $scope.y]);
				if (element.offsetWidth > 0 || element.offsetHeight > 0) {
					$scope.onKeyPress(code);
				}

				// Scroll container

				if ($scope.layout === 'horizontal') {
					if ($scope.x + $scope.rightScrollMargin > $scope.containerWidth + $scope.scrollX) {
						$scope.scrollX++;
					}
					if ($scope.x - $scope.leftScrollMargin - 1 < $scope.scrollX) {
						$scope.scrollX--;
					}
				}
				if ($scope.layout === 'vertical') {
					if ($scope.y + $scope.rightScrollMargin > $scope.containerHeight + $scope.scrollY) {
						$scope.scrollY++;
					}
					if ($scope.y - $scope.leftScrollMargin - 1 < $scope.scrollY) {
						$scope.scrollY--;
					}
				}

				$scope.scrollY = Math.max($scope.scrollY, 0);
				$scope.scrollX = Math.max($scope.scrollX, 0);

				$scope.invalidateItems();

				// If key holded more than 8 presses than remove animation
				if ($scope.pressedCount > 8) {
					$($scope.scroller).css('transition', 'none');
				}

				//if ($scope.y > $scope.containerHeight || $scope.navGridDataLength > $scope.containerHeight) {
				if ($scope.navGridDataLength > $scope.containerHeight) {
					$($scope.scroller).css('margin-top', (-$scope.scrollY * $scope.elementHeight) + 'px');
				}
				if ($scope.navGridDataLength > $scope.containerWidth && !($attrs.whirligig && $attrs.whirligig === '1')) {
					$($scope.scroller).css('margin-left', (-$scope.scrollX * $scope.elementWidth) + 'px');
				} else if ($attrs.whirligig && $attrs.whirligig === '1') {

					if ($scope.whirligigScroll === 'left' && $scope.x === 4 && $scope.scrollX === 2) {
						$scope.scrollX = $scope.navGridDataOriginalLength + 2;
						$scope.x = $scope.scrollX + 2;
					}

					if ($scope.scrollX === 1 && $scope.x && $scope.whirligigScroll === 'left') {
						$scope.x = $scope.navGridDataOriginalLength + 3;
						$scope.scrollX = $scope.x - 2;
					}

					if ($scope.whirligigScroll === 'right' && $scope.scrollX > 2 && ($scope.scrollX - $scope.navGridDataOriginalLength) === 2) {
						$scope.x = 4;
						$scope.scrollX = 2;
					}

					if ($scope.whirligigScroll === 'right' && ($scope.x - $scope.navGridDataOriginalLength) === 5) {
						$scope.x = $scope.navGridDataOriginalLength;
						$scope.scrollX = $scope.x - 2;
					}
					$scope.invalidateItems();
					$($scope.scroller).css('margin-left', (-$scope.scrollX * $scope.elementWidth) + 'px');
				}

				// Limit index at the end of list, if on last row index on X doesn't exist move it to last item
				if ($scope.layout === 'horizontal') {
					if ($scope.x === $scope.width) {
						if ($scope.containerHeight * ($scope.width - 1) + $scope.y > $scope.navGridDataLength) {
							$scope.y = $scope.navGridDataLength - $scope.containerHeight * ($scope.width - 1);
						}
					}
				}
				if ($scope.layout === 'vertical') {
					if ($scope.y === $scope.height) {
						if ($scope.containerWidth * ($scope.height - 1) + $scope.x > $scope.navGridDataLength) {
							$scope.x = $scope.navGridDataLength - $scope.containerWidth * ($scope.height - 1);
						}
					}
				}
				// Set focus on new item
				$($scope.elements[$scope.x + ':' + $scope.y]).addClass('active');


				$scope.invalidateSelection();

				if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
					$scope.$apply();
				}
			};*/

			/*			$scope.invalidateSelection = function() {
				if (!$scope.elements[$scope.x + ':' + $scope.y] || !$scope.elements[$scope.x + ':' + $scope.y].scope()) {
					return;
				}
				$scope.selectedData = $($scope.elements[$scope.x + ':' + $scope.y]).scope().getData();
				$scope.selectedItem = $($scope.elements[$scope.x + ':' + $scope.y]).scope().getItem() * 1;
				var classes = $attrs.class.split(' ');
				for (var i in classes) {
					$scope.$emit(classes[i] + ':navGridChangePosition', $scope);
				}
				$scope.$emit('navGridChangePosition', $scope);
			};*/

			/*			$scope.invalidateItems = function() {
				if ($scope.navGridData) {
					if ($scope.layout === 'vertical') {
						$scope.startItem = ($scope.scrollY - 1) * $scope.containerWidth;
						$scope.currentItem = Math.max($scope.startItem + 1, 1) + $scope.x - 1 + ($scope.y - 1 - Math.max($scope.scrollY - 1, 0)) * $scope.containerWidth;
						$scope.navGridItems = $scope.navGridData.slice(Math.max($scope.startItem, 0), ($scope.scrollY + 1) * $scope.containerWidth + $scope.itemsLimit);
					}
					if ($scope.layout === 'horizontal') {
						$scope.navGridItems = $scope.navGridData.slice(Math.max(($scope.scrollX - 1) * $scope.containerHeight, 0), ($scope.scrollX + 1) * $scope.containerHeight + $scope.itemsLimit);
					}
				}
			};*/

			/*$scope.onKeyUpWrapper = function(code) {
				if (code === RemoteService.SCROLL_UP || code === RemoteService.SCROLL_DOWN) {
					$scope.onKeyUp(code);
				} else {
					$scope.throttledUp(code);
				}
			};
			$scope.onKeyUp = function(code) {
				if (!$scope.focused) {
					return;
				}
				$($scope.scroller).css('transition', '');
				$scope.pressedCount = 0;
			};

			$scope.$on('getFocusSelectedData', function(event, data, item) {
				$scope.selectedData = data;
				$scope.selectedItem = item;
				var classes = $attrs.class.split(' ');
				for (var i in classes) {
					$scope.$emit(classes[i] + ':navGridChangePosition', $scope);
				}
				$scope.$emit('navGridChangePosition', $scope);
			});


			$scope.$on('focusNavGridItemInNavGrid', function(event, element) {
				for (var i in $scope.elements) {
					if ($scope.elements[i] === element) {
						if ($scope.elements[$scope.x + ':' + $scope.y]) {
							$scope.elements[$scope.x + ':' + $scope.y].removeClass('active');
						}
						$scope.x = Number(i.split(':')[0]);
						$scope.y = Number(i.split(':')[1]);
						$scope.elements[$scope.x + ':' + $scope.y].addClass('active');
						$scope.$emit('navGridChangePosition', $scope);
					}
				}
			});

			// Bind to remote service and listen for key press
			$scope.throttledDown3 = $.throttle($scope.throttle * 10, true, $scope.onKeyPress);
			$scope.throttledDown2 = $.throttle($scope.throttle * 5, true, $scope.onKeyPress);
			$scope.throttledDown = $.throttle($scope.throttle, true, $scope.onKeyPress);
			$scope.throttledUp = $.throttle($scope.throttle, true, $scope.onKeyUp);

			RemoteService.bindKeyDown($scope.onKeyPressWrapper, $scope);
			RemoteService.bindKeyUp($scope.onKeyUpWrapper, $scope);

			if ($attrs.hasScroller && $attrs.hasScroller === 'true') {
				$scope.$watch('y', function() {
					$scope.$broadcast('scrollWork', $scope.y);
				});
			}
			$scope.$on('scrollUp', function(event) {
				$scope.onKeyPress(RemoteService.KEY_UP);
			});
			$scope.$on('scrollDown', function(event) {
				$scope.onKeyPress(RemoteService.KEY_DOWN);
			});
			$scope.$on('getItemLength', function(event) {
				$scope.$broadcast('returnItemLength', $scope.navGridDataLength, $scope.containerHeightInPixels, $scope.containerWidth);
			});

			$scope.$on('$destroy', function() {
				RemoteService.unbindKeyDown($scope.onKeyPressWrapper, $scope);
				RemoteService.unbindKeyUp($scope.onKeyUpWrapper, $scope);

				$scope.scroller = null;
				for (var i in $scope.elements) {
					$scope.elements[i].remove();

					$scope.elements[i] = null;

					$element.off();

					delete $scope.elements[i];
				}
			});*/
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
