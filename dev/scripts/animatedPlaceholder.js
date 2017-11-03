"use strict";

/**
 * Class AnimatedPlaceholder
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element wich contains fake placeholder element (.placeholder_elem) and input element (.placeholder_target)
 * 		1.2. name (optional) - name for class instance to show in console
 *		1.3... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function AnimatedPlaceholder(options) {
	options.name = options.name || 'AnimatedPlaceholder';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;

	// bind class instance as "this" for event listener functions
	this._onFocus = this._onFocus.bind(this);
	this._onBlur = this._onBlur.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
AnimatedPlaceholder.prototype = Object.create(Helper.prototype);
AnimatedPlaceholder.prototype.constructor = AnimatedPlaceholder;

// Main initialisation function
AnimatedPlaceholder.prototype._init = function() {
	// search for fake placeholder elem
	this._palceholderElem = this._elem.querySelector('.placeholder_elem');
	if (!this._palceholderElem) {
		console.warn(this.NAME + ': Placeholder Elem is not Found!');
		return;
	}
	// search for input element or custom form element
	this._targetElem = this._elem.querySelector('.placeholder_target');
	if (!this._targetElem) {
		console.warn(this.NAME + ': Placeholder Target Elem is not Found!');
		return;
	}

	// start listening for bubbling focus and blur events
	// phase (4 arg) is set to true because focus and blur events can't be captured via bubbling in another case
	this._addListener(this._elem, 'focus', this._onFocus, true);
	this._addListener(this._elem, 'blur', this._onBlur, true);
};

// Invoked by focus event on input element
// Arguments:
// 	1. e (required) - event object
AnimatedPlaceholder.prototype._onFocus = function(e) {
	var target = e.target;
	if (!target || target !== this._targetElem) return;

	// .focus is for imitating focus on custom form elements
	this._elem.classList.add('focus');
	// remove placeholder
	if (!this._placeholderRemoved) {
		this._elem.classList.add('placeholder_removed');
		this._placeholderRemoved = true;
	}
};

// Invoked by blur event on input element
// Arguments:
// 	1. e (required) - event object
AnimatedPlaceholder.prototype._onBlur = function(e) {
	var target = e.target;
	if (!target || target !== this._targetElem) return;

	this._elem.classList.remove('focus');

	// if timer is already set then cancel it
	if (this._delay) {
		clearTimeout(this._delay);
	}
	// set delay timer to check if input has value
	// if check without delay value may be wrong on some input elements
	this._delay = setTimeout(function(){
		delete this._delay;
		this._onBlurAfterDelay(target);
	}.bind(this), 100);
};

// Checks if input element has any value after it lost focus
// Arguments:
// 	1. target (required) - target input element from _onBlur function
AnimatedPlaceholder.prototype._onBlurAfterDelay = function(target) {
	var customElem = target.closest('.custom_form_elem'),
		value;

	if (!customElem) {
		value = target.value;
	} else {
		value = customElem.dataset.value;
	}

	// if input has no value return placeholder
	if (!value) {
		this._elem.classList.remove('placeholder_removed');
		this._placeholderRemoved = false;
	}
};

// Try exporting class via webpack
try {
	module.exports = AnimatedPlaceholder;
} catch (err) {
	console.warn(err);
}
