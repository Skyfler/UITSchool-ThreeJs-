"use strict";
/**
 * Class Helper
 *
 * Required files:
 * 	modalWindow.js (if you need _showErrorNotification function)
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 *		1.1. name (optional) - name for class instance to show in console
 *		1.2. noId (optional) - if set to true then id won't be added to instance name
 */

// id counter that will be added to all instances that inherit Helper class (except those that pass noId = true)
var id = 0;

function Helper(options) {
	// Generates id for class instance
	function createUniqId() {
		var idString = '<#' + id.toString(16) + '>';
		id++;
		return idString;
	};

	this.NAME = (options.name || 'Helper') + (options.noId ? '' : createUniqId());
	this._listenerArr = [];
}

// Function to add event listeners and push them into _listenerArr array so they can be removed later even if they were set with anonymous functions
// Arguments:
// 	1. element (required) - html element (or object that can listen for events) to add event listener
// 	2. event (required) - string name of event
// 	3. handler (required) - function handler of event
// 	4. phase (optional) - phase of capturing event
Helper.prototype._addListener = function(element, event, handler, phase) {
	if (!phase) {
		phase = false;
	}

	// push all pararameters into array
	this._listenerArr.push({
		elem: element,
		event: event,
		handler: handler,
		phase: phase
	});
	var index = this._listenerArr.length - 1;

	// add event listener with parameters from array
	this._listenerArr[index].elem.addEventListener(
		this._listenerArr[index].event,
		this._listenerArr[index].handler,
		this._listenerArr[index].phase
	);
};

// Function to remove event listeners added with _addListener function
// Arguments:
// 	1. element (required) - html element (or object that can listen for events) which event listener attached to
// 	2. event (required) - string name of event
// 	3. handler (required) - function handler of event
// 	4. phase (optional) - phase of capturing event
Helper.prototype._removeListener = function(element, event, handler, phase) {
	if (!phase) {
		phase = false;
	}

	// find index of listener in the array
	var index = this._returnListenerIndexInArr(element, event, handler, phase);

	if (index >= 0) {
		// if listener is found in array then remove it from element with parameters from array and then from array
		this._listenerArr[index].elem.removeEventListener(
			this._listenerArr[index].event,
			this._listenerArr[index].handler,
			this._listenerArr[index].phase
		);
		this._listenerArr.splice(index, 1);
	} else {
		// else remove listener with passed parameters
		element.removeEventListener(event, handler, phase);
	}
};

// Finds index of listener in listeners array
// Arguments:
// 	1. element (required) - html element (or object that can listen for events) which event listener attached to
// 	2. event (required) - string name of event
// 	3. handler (required) - function handler of event
// 	4. phase (required) - phase of capturing event
Helper.prototype._returnListenerIndexInArr = function(element, event, handler, phase) {
	for (var i = this._listenerArr.length - 1; i >= 0; i--) {
		if (this._listenerArr[i].elem === element &&
			this._listenerArr[i].event === event &&
			this._listenerArr[i].handler === handler &&
			this._listenerArr[i].phase === phase) {
			return i;
		}
	}

	return -1;
};

// Function to completely destroy instance of class that inherited Helper
Helper.prototype.remove = function() {
	// remove all listeners
	for (var i = this._listenerArr.length - 1; i >= 0; i--) {
		this._removeListener(this._listenerArr[i].elem, this._listenerArr[i].event, this._listenerArr[i].handler);
	}

	// delete all object properties
	for (var key in this) {
		if (this.hasOwnProperty(key)) {
			if (typeof this[key] === 'object' && this[key].remove && this[key].remove !== document.documentElement.remove) {
				// if property contains another instance of class inherited from Helper then run remove function for it too
				this[key].remove();
			}

			delete this[key];
		}
	}

	// remove inherited prototype methods
	this.__proto__ = {};
};

// Shows error standart notification (needs ModalWindow class)
Helper.prototype._showErrorNotification = function() {
	if (typeof ModalWindow !== 'undefined') {
		new ModalWindow({
			modalClass: 'error_notification',
			modalInnerHTML: '<p>An Error Occurred!</p>' +
			'<p>Please Try Again Later.</p>'
		});
	} else {
		console.warn(this.NAME + ': ModalWindow class is not found!');
	}
};

// Simplified function to send custom events
// Arguments:
// 	1. elem (required) - html element (or object that can dispatch events) which will fire event
// 	2. eventName (required) - string name of event
// 	3. options (optional) - CustomEvent options object (see CustomEvent documentation)
Helper.prototype._sendCustomEvent = function(elem, eventName, options) {
	var widgetEvent = new CustomEvent(eventName, options);
	elem.dispatchEvent(widgetEvent);
};

// Preloads images from passed src (array)
// Arguments:
// 	1. imgSrcArr (required) - string url (or array of string urls) of image(s)
Helper.prototype._loadImages = function(imgSrcArr) {
	if (!imgSrcArr) return;

	// if passed string then create array with it as single item
	if (typeof imgSrcArr === 'string') {
		imgSrcArr = [imgSrcArr];
	}

	this._preloadedImages = [];

	// create Image for each url
	for (var i = 0; i < imgSrcArr.length; i++) {
		this._preloadedImages[i] = new Image();
		this._preloadedImages[i].src = imgSrcArr[i];
	}
};

// Checks window width
// Arguments:
// 	1. min (optional) - lowest limit to test
// 	2. max (optional) - highest limit to test
Helper.prototype._checkScreenWidth = function(min, max) {
	var windowWidth = window.innerWidth;

	if ((min !== undefined && min !== false) || (max !== undefined && max !== false)) {
		// if min or max is passed then test if current window width is between them
		if (min === undefined || min === false) {
			min = 0;
		}
		if (max === undefined || max === false) {
			max = windowWidth;
		}

		// return boolean
		return min <= windowWidth && windowWidth <= max;

	} else {
		// if no min and max were passed then return window width mode string
		var width = null;

		if (windowWidth >= 1200) {
			width = 'lg';
		} else if (windowWidth >= 992 && windowWidth < 1200) {
			width = 'md';
		} else if (windowWidth >= 768 && windowWidth < 992) {
			width = 'sm';
		} else if (windowWidth < 768) {
			width = 'xs';
		}

		return width;
	}
};

// Sets all possible css prefixes for element style (needs String prototype extension "capitalize")
// Arguments:
// 	1. elem (required) - element to set style
// 	2. prop (required) - css property
// 	3. value (required) - css property value
Helper.prototype._setVendorCss = function(elem, prop, value) {
	var propCap = prop.capitalize();
	elem.style["Webkit" + propCap] = value;
	elem.style["webkit" + propCap] = value;
	elem.style["-webkit-" + prop] = value;
	elem.style["Moz" + propCap] = value;
	elem.style["moz" + propCap] = value;
	elem.style["-moz-" + prop] = value;
	elem.style["ms" + propCap] = value;
	elem.style["-ms-" + prop] = value;
	elem.style["O" + propCap] = value;
	elem.style["o" + propCap] = value;
	elem.style["-o-" + prop] = value;
	elem.style[prop] = value;
};

// Simplified function to get cookie value
// Arguments:
// 	1. sKey (required) - cookie name
Helper.prototype._getCookie = function(sKey) {
	if (!sKey) { return null; }
	return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
};

// Try exporting class via webpack
try {
	module.exports = Helper;
} catch (err) {
	console.warn(err);
}

// Try requiring modalWindow via webpack
// moved after module.exports to prevent loop as ModalWindow requires Helper
try {
	var ModalWindow = require('./modalWindow');
} catch (err) {
	console.warn(err);
}

