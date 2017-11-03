"use strict";

/**
 * Class CustomInputRange
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that contains ruler elem (.ruler) and thumb elem (.thumb)
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. min (required) - minimal value of custom input range
 *		1.4. max (required) - maximal value of custom input range
 *		1.5. initialValue (optional) - value that will be set as default upon custom input range initialisation
 *		1.6... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function CustomInputRange(options) {
	options.name = options.name || 'CustomInputRange';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;

	this._rulerElem = this._elem.querySelector('.ruler');
	this._thumbElem = this._elem.querySelector('.thumb');

	// check if min and max options were set and set them to default values if not
	this._min = isNaN(parseInt(options.min)) ? 0 : parseInt(options.min);
	this._max = isNaN(parseInt(options.max)) ? 10 : parseInt(options.max);
	// calculate how many percents of ruler width will each point of value have
	this._percentPerValue = 100 / (this._max - this._min);

	// check if initialValue was set and set it to min value if not
	var initialValue = isNaN(parseInt(options.initialValue)) ? this._min : parseInt(options.initialValue);
	this.setValue(initialValue);

	// bind class instance as "this" for event listener functions
	this._onMouseDown = this._onMouseDown.bind(this);
	this._onDocumentMouseMove = this._onDocumentMouseMove.bind(this);
	this._onDocumentMouseUp = this._onDocumentMouseUp.bind(this);

	// export class public methods into elem object
	this._revealPublicMethods();

	// prevent default browser drag event
	this._addListener(this._elem, 'dragstart', function(e) {e.preventDefault();});
	// start listening for bubbling mousedown and touchstart events
	this._addListener(this._elem, 'mousedown', this._onMouseDown);
	this._addListener(this._elem, 'touchstart', this._onMouseDown);
}

// Inherit prototype methods from Helper
CustomInputRange.prototype = Object.create(Helper.prototype);
CustomInputRange.prototype.constructor = CustomInputRange;

// Invoked by mousedown and touchstart events
// Arguments:
// 	1. e (required) - event object
CustomInputRange.prototype._onMouseDown = function(e) {
	// check if it's thumb element was selected and start dragging it if it is
	if (e.target.closest('.thumb')) {
		// mousedown and touchstart event objects have different properties for coordinates
		var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX;
		var clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;

		e.preventDefault();
		// start dragging thumb elem
		this._startDrag(clientX, clientY);
	}
};

// Prepares thumb elemet for dragging
CustomInputRange.prototype._startDrag = function(startClientX, startClientY) {
	// get offset coordinates of user's mouse|touch relatively to thumb elem
	this._thumbCoords = this._thumbElem.getBoundingClientRect();
	this._shiftX = startClientX - this._thumbCoords.left;
	this._shiftY = startClientY - this._thumbCoords.top;

	// get ruler coordinates
	this._rullerCoords = this._rulerElem.getBoundingClientRect();

	// call _onDocumentMouseMove manually before user starts dragging thumb
	// passing to it mouse x coordinate of mousedown|touchstart event
	this._onDocumentMouseMove({clientX: startClientX});
	// listen to user start dragging mouse|touch
	this._addListener(document, 'mousemove', this._onDocumentMouseMove);
	this._addListener(document, 'touchmove', this._onDocumentMouseMove);
	// listen to user release mouse|touch
	this._addListener(document, 'mouseup', this._onDocumentMouseUp);
	this._addListener(document, 'touchend', this._onDocumentMouseUp);
};

// Invoked by mousemove and touchmove events
// Arguments:
// 	1. e (required) - event object or object that contains clientX property of mouse x coordinate relative to window
CustomInputRange.prototype._onDocumentMouseMove = function(e) {
	var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX;
	// move tumb to new position
	this._moveTo(clientX);
};

// Invoked by mouseup and touchend events
// Arguments:
// 	1. e (required) - event object
CustomInputRange.prototype._onDocumentMouseUp = function(e) {
	// stop dragging thumb
	this._endDrag();
};

// Moves thumb to new position and sets accroding value of custom input range
// Arguments:
// 	1. clientX (required) - mouse|touch x coordinate relative to window
CustomInputRange.prototype._moveTo = function(clientX) {
	if (!clientX) return;
	// calculate tumbs left position relativelly to ruller
	var newLeft = clientX - this._shiftX - this._rullerCoords.left;

	// tumb can't leave ruler elem
	if (newLeft < 0) {
		newLeft = 0;
	}
	var rightEdge = this._rulerElem.clientWidth;
	if (newLeft > rightEdge) {
		newLeft = rightEdge;
	}

	// set new left of thumb in pixels
	this._pixelLeft = newLeft;
	this._thumbElem.style.left = newLeft + 'px';

	// calculate current custom input range value
	var newValue = this._positionToValue(newLeft);
	if (newValue !== this._value) {
		this._value = newValue;
		// set new value as attribute
		this._elem.setAttribute('data-value', this._value);

		// send signal that thumb was dragged and custom input range value has changed
		this._sendCustomEvent(this._elem, 'custominputrangeslide', {
			bubbles: true,
			detail: {
				value: this._value
			}
		});
	}
};

// Calculates left coordinate of thumb (percents) from value of custom input range
// Arguments:
// 	1. value (required) - value of custom input range
CustomInputRange.prototype._valueToPosition = function(value) {
	return this._percentPerValue * (value - this._min);
};

// Calculates value of custom input range from left coordinate of thumb (px)
// Arguments:
// 	1. left (required) - left coordinate of thumb (px)
CustomInputRange.prototype._positionToValue = function(left) {
	var pixelPerValue = this._rulerElem.clientWidth / (this._max - this._min);
	return Math.round(left / pixelPerValue) + this._min;
};

// Converts left coordinate of thumb from pixels to percents
// Arguments:
// 	1. left (required) - left coordinate of thumb (px)
CustomInputRange.prototype._pixelsToPercents = function(left) {
	return left * (100 / this._rulerElem.clientWidth);
};

// Stops dragging thumb
CustomInputRange.prototype._endDrag = function() {
	this._removeListener(document, 'mousemove', this._onDocumentMouseMove);
	this._removeListener(document, 'touchmove', this._onDocumentMouseMove);
	this._removeListener(document, 'mouseup', this._onDocumentMouseUp);
	this._removeListener(document, 'touchend', this._onDocumentMouseUp);

	// set thumb's left in percents
	this._thumbElem.style.left = this._pixelsToPercents(this._pixelLeft) + '%';

	// send signal that thumb was released
	this._afterValueIsSet();
};

// Sends signal that thumb was released (if it was dragged) and final custom input range value
CustomInputRange.prototype._afterValueIsSet = function() {
	this._sendCustomEvent(this._elem, 'custominputrangechange', {
		bubbles: true,
		detail: {
			value: this._value
		}
	});
};

// Public method to set custom input range value from outer code (gets exported into elem object)
// Arguments:
// 	1. value (required) - new value of custom input range
CustomInputRange.prototype.setValue = function(value) {
	value = parseInt(value);

	if (typeof value !== 'number') return;

	// value can't be lower than min or higher that max
	if (value > this._max) {
		value = this._max;
	} else if (value < this._min) {
		value = this._min;
	}

	// set new value and move thumb to according position
	this._value = value;
	this._elem.setAttribute('data-value', this._value);
	this._thumbElem.style.left = this._valueToPosition(value) + '%';
	this._pixelLeft = parseInt(getComputedStyle(this._thumbElem).left);

	// send signal that new value was set
	this._afterValueIsSet();
};

// Public method to get elem
CustomInputRange.prototype.getElem = function() {
	return this._elem;
};

// Exports setValue method into elem object
CustomInputRange.prototype._revealPublicMethods = function() {
	this._elem.setValue = this.setValue.bind(this);
};

// Try exporting class via webpack
try {
	module.exports = CustomInputRange;
} catch (err) {
	console.warn(err);
}
