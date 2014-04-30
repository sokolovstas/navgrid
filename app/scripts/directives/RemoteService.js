'use strict';

var local = angular.module('service.remote', []);

local.factory('RemoteService', function($rootScope) {

	var remote = {};

	var notifyListeners = function(eventType, event) {
		var scopes = [];
		for (var f = remote.listeners[eventType].length - 1; f >= 0; f--) {
			if (event.wheelDelta) {
				if (event.wheelDelta > 0) {
					remote.listeners[eventType][f].callback.call(event, remote.SCROLL_UP);
				} else {
					remote.listeners[eventType][f].callback.call(event, remote.SCROLL_DOWN);
				}
			} else {
				remote.listeners[eventType][f].callback.call(event, event.keyCode);
			}

		}
		if (event.preventDefault) {
			event.preventDefault();
		}
	};
	// activate remote service
	remote.init = function(platform) {
		// Notify all listeners function
		var i, len;
		sl.forEach(remote.keys[platform], function(key, value) {
			remote[key] = value;
		});

		// Notify about key down
		var onkeydownhandler = function(event) {
			console.log('onkeydownhandler');
			notifyListeners('keydown', event);
		};
		// Notify about key up
		var onkeyuphandler = function(event) {
			notifyListeners('keyup', event);
		};

		var onscrollhandler = function(event) {
			notifyListeners('keydown', event);
			notifyListeners('keyup', event);
		};
		// Set focus to catcher
		$('#remote_catcher').focus();
		$('#remote_catcher').css('display', 'none');

		// Add native listeners
		document.addEventListener('keydown', $.throttle(50, true, onkeydownhandler), true);
		document.addEventListener('keyup', $.throttle(50, true, onkeyuphandler), true);
		document.addEventListener('mousewheel', onscrollhandler, true);
		/*		document.addEventListener('keydown', onkeydownhandler, true);
		document.addEventListener('keyup', onkeyuphandler, true);
		document.addEventListener('mousewheel', onscrollhandler, true);*/
	};

	// Dictionary with listeners type and arrays fo listeners
	remote.listeners = {
		keydown: [],
		keyup: []
	};
	// Bind and unbind keys
	remote.bindKeyDown = function(callback, scope) {
		return remote.bindEvent('keydown', callback, scope);
	};
	remote.unbindKeyDown = function(callback, scope) {
		return remote.unbindEvent('keydown', callback, scope);
	};

	remote.bindKeyUp = function(callback, scope) {
		return remote.bindEvent('keyup', callback, scope);
	};
	remote.unbindKeyUp = function(callback, scope) {
		return remote.unbindEvent('keyup', callback, scope);
	};

	//Common bind and unbind function
	remote.bindEvent = function(event, callback, scope) {
		if (remote.unbindKeyDown(callback)) {
			console.warn('Listener in scope' + scope.$id + ' alerady exist and have been removed');
		}

		remote.listeners[event].push({
			callback: callback,
			scope: scope
		});

		return true;
	};
	remote.unbindEvent = function(event, callback, scope) {
		var index = -1;
		var c;
		for (c = remote.listeners[event].length - 1; c >= 0; c--) {
			if (scope) {
				if (remote.listeners[event][c].callback === callback && remote.listeners[event][c].scope === scope) {
					index = c;
					break;
				}
			} else {
				if (remote.listeners[event][c].callback === callback) {
					index = c;
					break;
				}
			}
		}
		if (index > -1) {
			remote.listeners[event].splice(index, 1);
			return true;
		} else {
			return false;
		}
	};

	//

	remote.triggerEvent = function(event) {
		var keyObject = {};
		keyObject.keyCode = event;
		notifyListeners('keydown', keyObject);
	};

	// Key codes

	remote.keys = {
		LG: {
			ENTER: 13,
			KEY_EXIT: null,
			BACK: 461,
			RED: 403,
			KEY_LEFT: 37,
			KEY_RIGHT: 39,
			KEY_UP: 38,
			KEY_DOWN: 40,
			KEY_PLAY: 415,
			KEY_STOP: 413,
			KEY_PAUSE: 19,
			KEY_REWIND: 412,
			KEY_FASTFORWARD: 417,
			KEY_MENU: 457,
			MICROPHONE: 1015,
			SCROLL_UP: 'SCROLLUP',
			SCROLL_DOWN: 'SCROLLDOWN'
		},
		SAMSUNG: {
			ENTER: 29443,
			KEY_EXIT: 45,
			BACK: 88,
			RED: 108,
			KEY_LEFT: 4,
			KEY_RIGHT: 5,
			KEY_UP: 29460,
			KEY_DOWN: 29461,
			KEY_PLAY: 71,
			KEY_STOP: 70,
			KEY_PAUSE: 74,
			KEY_REWIND: 69,
			KEY_FASTFORWARD: 72,
			KEY_MENU: 31,
			MICROPHONE: 0,
			SCROLL_UP: 29468,
			SCROLL_DOWN: 29469
		},
		PC: {
			KEY_LEFT: 37,
			KEY_RIGHT: 39,
			KEY_UP: 38,
			KEY_DOWN: 40,
			KEY_MENU: 36,
			BACK: 8,
			ENTER: 13,
			SCROLL_UP: 'SCROLLUP',
			SCROLL_DOWN: 'SCROLLDOWN'
		}
	};

	return remote;
});
