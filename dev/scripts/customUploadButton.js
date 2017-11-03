"use strict";

/**
 * Class CustomUploadButton
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that contains title element (.input) that holds current file name and hidden input type file (input[type="file"])
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function CustomUploadButton(options) {
	options.name = options.name || 'CustomUploadButton';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;

	this._visibleInput = this._elem.querySelector('.input');
	this._hiddenInput = this._elem.querySelector('input[type="file"]');

	// default text content of title elem
	this._defaultValue = this._visibleInput.textContent;
	// reset value of hidden input
	this._hiddenInput.value = '';

	// bind class instance as "this" for event listener functions
	this._onChange = this._onChange.bind(this);

	// start listening for bubbling change event
	this._addListener(this._elem, 'change', this._onChange);
}

// Inherit prototype methods from Helper
CustomUploadButton.prototype = Object.create(Helper.prototype);
CustomUploadButton.prototype.constructor = CustomUploadButton;

// Invoked by change event
// Arguments:
// 	1. e (required) - event object
CustomUploadButton.prototype._onChange = function(e) {
	var target = e.target;

	// if vent target is not hidden nput then do nothing
	if (target !== this._hiddenInput) return;

	var fileName;

	if (this._hiddenInput.value === '') {
		// if hidden input contains no files then set default text to title elem
		fileName = this._defaultValue;
	} else {
		// if hidden input contains file then set it's name to title elem
		var valArr = this._hiddenInput.value.split('\\');
		fileName = valArr[valArr.length - 1];
	}
	this._visibleInput.innerHTML = fileName;
};

// Public method to remove value from hidden input
CustomUploadButton.prototype.resetToDefault = function() {
	this._hiddenInput.value = '';
	this._visibleInput.textContent = this._defaultValue;
};

// Public method to get elem
CustomUploadButton.prototype.getElem = function() {
	return this._elem;
};

// Try exporting class via webpack
try {
	module.exports = CustomUploadButton;
} catch (err) {
	console.warn(err);
}
