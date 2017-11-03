"use strict";

/**
 * Class CustomSelect
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that contains button (.title) that holds current value of custom select and list (.option_list) that holds list items represinting select options
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function CustomSelect(options) {
	options.name = options.name || 'CustomSelect';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;
	this._titleElem = this._elem.querySelector('.title');
	this._listElem = this._elem.querySelector('.option_list');
	// remember default text from .title
	this._defaultText = this._titleElem.innerHTML;
	// remember if custom select supposted to be required (depends on .required)
	this._required = this._elem.classList.contains('required');
	this._isOpen = false;

	// bind class instance as "this" for event listener functions
	this._onClick = this._onClick.bind(this);
	this._onDocumentClick = this._onDocumentClick.bind(this);
	this._onResize = this._onResize.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
CustomSelect.prototype = Object.create(Helper.prototype);
CustomSelect.prototype.constructor = CustomSelect;

// Main initialisation function
CustomSelect.prototype._init = function() {
	this._elem.dataset.value = '';

	// export class public methods into elem object
	this._revealPublicMethods();
	// sets default selected option
	this._setDefaultBySelectedAttr();

	// start listening for bubbling click event
	this._addListener(this._elem, 'click', this._onClick);
};

// Invoked by resize event on window
CustomSelect.prototype._onResize = function() {
	// set max height of options list to prevent it from go beyond window
	this._listElem.style.maxHeight = window.innerHeight - this._listElem.getBoundingClientRect().top + 'px';
};

// Invoked by click event
// Arguments:
// 	1. event (required) - event object
CustomSelect.prototype._onClick = function(event) {
	event.preventDefault();

	if (event.target === this._titleElem) {
		// if click was on .title than open|close custom select
		this._toggle();
	} else if (event.target.classList.contains('option')) {
		// if click was on option than set option's value as custom select's value
		this._setValue(event.target.textContent, event.target.dataset.value);
		this._elem.classList.add('option_selected');
		this._close();
	}
};

// Invoked by click event on document
// Arguments:
// 	1. event (required) - event object
CustomSelect.prototype._onDocumentClick = function(event) {
	// if click was not on custom select than close it
	if (!this._elem.contains(event.target)) this._close();
};

// Sets new value to custom select
// Arguments:
// 	1. title (required) - option's text content
// 	1. value (required) - options's attribute [data-value]
CustomSelect.prototype._setValue = function(title, value) {
	// set new title to .title ad new value to elems [data-value] attribute
	this._titleElem.innerHTML = title;
	this._elem.dataset.value = title;
	this._value = value;

	// send signal that custom select's value was changed
	this._sendCustomEvent(this._elem, 'customselect', {
		bubbles: true,
		detail: {
			title: title,
			value: value
		}
	});
};

// Public method to get elem
CustomSelect.prototype.getElem = function() {
	return this._elem;
};

// Opens|closes custom select
CustomSelect.prototype._toggle = function() {
	if (this._isOpen) {
		this._removeListener(window, 'resize', this._onResize);
		this._close();
	} else {
		this._open();
		this._onResize();
		this._addListener(window, 'resize', this._onResize);
	}
};

// Opens custom select
CustomSelect.prototype._open = function() {
	this._elem.classList.add('open');
	// start listening to clicks outside custom select
	this._addListener(document, 'click', this._onDocumentClick);
	this._isOpen = true;
	// send signal that custom select was opened
	this._sendCustomEvent(this._elem, 'customselectopenclose', {
		bubbles: true,
		detail: {
			open: true
		}
	});
};

// Closes custom select
CustomSelect.prototype._close = function() {
	this._elem.classList.remove('open');
	// stop listening to clicks outside custom select
	this._removeListener(document, 'click', this._onDocumentClick);
	this._isOpen = false;
	// send signal that custom select was closed
	this._sendCustomEvent(this._elem, 'customselectopenclose', {
		bubbles: true,
		detail: {
			open: false
		}
	});
};

// Finds all options of options list
CustomSelect.prototype._getOptionElems = function() {
	return this._elem.querySelectorAll('.option');
};

// Public method to select custom select option from outer code (gets exported into elem object)
// Arguments:
// 	1. option (required) - object that can contain:
//		1.1 index (optional) - index of option in options list (if present than option.value is ignored)
//		1.2 value (optional) - [data-value] attribute of option
CustomSelect.prototype.setOption = function(option) {
	if (!option) return;

	var optionSetSuccess = false;

	if (option.index !== undefined && typeof option.index === 'number') {
		// if option.index is present than set option by index
		optionSetSuccess = this._setOptionByIndex(option.index);

	} else if (option.value) {
		// if option.index is not present and option.value is present than set option by value
		optionSetSuccess = this._setOptionByValue(option.value);
	}

	// if value was successfully changed than imitate focus and blur events
	if (optionSetSuccess) {
		this._sendCustomEvent(this._titleElem, 'focus', {bubbles: true});
		this._sendCustomEvent(this._titleElem, 'blur', {bubbles: true});
	}

	return optionSetSuccess;
};

// Selects option by index
// Arguments:
// 	1. optionIndex (required) - index of option in options list
CustomSelect.prototype._setOptionByIndex = function(optionIndex) {
	var optionElemArr = this._getOptionElems();

	optionIndex = parseInt(optionIndex);

	// if options list has option in optionIndex that select it
	if (optionElemArr[optionIndex]) {
		var option = optionElemArr[optionIndex];

		this._setValue(option.textContent, option.dataset.value);
		this._elem.classList.add('option_selected');

		return true;
	} else {
		return false;
	}
};

// Selects option by [data-value] attribute
// Arguments:
// 	1. optionValue (required) - [data-value] attribute of option
CustomSelect.prototype._setOptionByValue = function(optionValue) {
	var optionElemArr = this._getOptionElems();

	// search for first option with [data-value] = optionValue and select it if it was found
	for (var i = 0; i < optionElemArr.length; i++) {
		if (optionElemArr[i].dataset.value === optionValue) {
			var option = optionElemArr[i];

			this._setValue(option.textContent, option.dataset.value);
			this._elem.classList.add('option_selected');

			return true;
		}
	}

	return false;
};

// Exports setOption and resetToDefault methods into elem object
CustomSelect.prototype._revealPublicMethods = function() {
	this._elem.setOption = this.setOption.bind(this);
	this._elem.resetToDefault = this.resetToDefault.bind(this);
};

// Resets custom select to state when no options are selected
CustomSelect.prototype.resetToDefault = function() {
	this._elem.classList.remove('option_selected');
	this._titleElem.innerHTML = this._defaultText;
	this._elem.dataset.value = '';

	// imitate focus and blur events
	this._sendCustomEvent(this._titleElem, 'focus', {bubbles: true});
	this._sendCustomEvent(this._titleElem, 'blur', {bubbles: true});
};

// Sets default option by [data-selected] attribute
CustomSelect.prototype._setDefaultBySelectedAttr = function() {
	var optionElemArr = this._getOptionElems();

	// search for first option with [data-selected] present and select it if it was found
	for (var i = 0; i < optionElemArr.length; i++) {
		if (optionElemArr[i].getAttribute('data-selected') !== null) {
			var option = optionElemArr[i];

			this._setValue(option.textContent, option.dataset.value);
			this._elem.classList.add('option_selected');

			return;
		}
	}
};

// Try exporting class via webpack
try {
	module.exports = CustomSelect;
} catch (err) {
	console.warn(err);
}
