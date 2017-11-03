"use strict";

/**
 * Class DropdownGroup
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	dropdown.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that contains dropdown collapsing container (selector in options.dropdownContainerSelector) and one or more buttons (selector in options.openBtnSelector) that will be toggling it's state
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. dropdownSelector (required) - selector that will be used to find all dropdowns in elem
 *		1.4. dropdownOptions (required) - object with options from Dropdown class (dropdown.js) that will be applied to all dropdowns inside elem (options sendEventsOnToggle, listenToCloseSignal and elem will be ignored as they are set internally by DropdownGroup)
 *		1.5... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
	var Dropdown = require('./dropdown.js');
} catch (err) {
	console.warn(err);
}

function DropdownGroup(options) {
	options.name = options.name || 'Dropdown-DropdownGroup';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;
	this._dropdownSelector = options.dropdownSelector;
	this._dropdownOptions = options.dropdownOptions;

	// bind class instance as "this" for event listener functions
	this._onDropdownToggle = this._onDropdownToggle.bind(this);

	// initialise all dropdowns
	this._createDropdowns();

	// start listening for bubbling dropdowntoggle event
	this._addListener(this._elem, 'dropdowntoggle', this._onDropdownToggle);
}

// Inherit prototype methods from Helper
DropdownGroup.prototype = Object.create(Helper.prototype);
DropdownGroup.prototype.constructor = DropdownGroup;

// Reassigned remove function from Helper
DropdownGroup.prototype.remove = function() {
	// cancel all dropdowns
	if (this._dropdownArr && this._dropdownArr.length > 0) {
		for (var i = 0; i < this._dropdownArr.length; i++) {
			this._dropdownArr[i].remove();
		}
	}

	// call remove function from Helper
	Helper.prototype.remove.apply(this, arguments);
};

// Initialises all dropdowns
DropdownGroup.prototype._createDropdowns = function() {
	var dropdownElemArr = this._elem.querySelectorAll(this._dropdownSelector);

	// copy object with dropdown options
	var dropdownOptions = JSON.parse(JSON.stringify(this._dropdownOptions));

	dropdownOptions.sendEventsOnToggle = true;
	dropdownOptions.listenToCloseSignal = true;

	// initialise all dropdowns
	this._dropdownArr = [];
	for (var i = 0; i < dropdownElemArr.length; i++) {
		dropdownOptions.elem = dropdownElemArr[i];
		this._dropdownArr[i] = new Dropdown(dropdownOptions);
	}
};

// Invoked by dropdowntoggle event
// Arguments:
// 	1. e (required) - event object
DropdownGroup.prototype._onDropdownToggle = function(e) {
	var target = e.target;

	if (target === this._opnedDropdownElem && e.detail.state === 'closed') {
		delete this._opnedDropdownElem;

	} else if (e.detail.state === 'open') {
		// if one of dropdowns is already opened and now onother one has opened then close the first one
		if (this._opnedDropdownElem) {
			this._closeCurrentDropdown();
		}

		this._opnedDropdownElem = target;
	}
};

// Sends signal to close cureentelly opened dropdown
DropdownGroup.prototype._closeCurrentDropdown = function() {
	this._sendCustomEvent(this._elem, 'signaltoclosedropdown', {
		bubbles: true,
		detail: {
			targetDropdownElem: this._opnedDropdownElem
		}
	});
};

// Try exporting class via webpack
try {
	module.exports = DropdownGroup;
} catch (err) {
	console.warn(err);
}
