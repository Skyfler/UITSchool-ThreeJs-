"use strict";

/**
 * Class Dropdown
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that contains dropdown collapsing container (selector in options.dropdownContainerSelector) and one or more buttons (selector in options.openBtnSelector) that will be toggling it's state
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. cancelDropdownOnGreaterThan (optional) - if set to number and screen width (px) equals or greater then it then dropdown will be inactive
 *		1.4. horizontal (optional) - if set to true then dropdown will be horizontal (change width instead of height)
 *		1.5. dropdownContainerSelector (required) - selector of dropdown collapsing container which size will be changed and which contains content container (selector in options.dropdownBarSelector)
 *		1.6. dropdownBarSelector (required) - selector of content container inside dropdown collapsing container wich offset height|width will be applied to dropdown collapsing container
 *		1.7. transitionDuration (required) - transition duration (seconds) of width|height
 *		1.8. openBtnSelector (required) - selector that will be used to test if user clicked on element that toggles dropdown state
 *		1.9. calcuateDropdownSizeCodeString (optional) - js code string, if set then it will be evaluated with eval() for calculating dropdown size in open state (must return positive number)
 *		1.10. sendEventsOnToggle (optional) - if set to true then dropdown will be sending dropdowntoggle event when dropdown is toggled
 *		1.11. closeOnResize (optional) - if set to true then dropdown will automaticly close itself on window resize
 *		1.12. listenToCloseSignal (optional) - if set to true then dropdown will listen to bubbling signaltoclosedropdown event on document
 *		1.13... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function Dropdown(options) {
	options.name = options.name || 'Dropdown';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;
	if (options.cancelDropdownOnGreaterThan) {
		this._cancelDropdownOnGreaterThan = options.cancelDropdownOnGreaterThan;
	}
	this._horizontal = options.horizontal ? true : false;
	this._dropdownContainer = this._elem.querySelector(options.dropdownContainerSelector);
	this._dropdownBar = this._dropdownContainer.querySelector(options.dropdownBarSelector);
	this._transitionDuration = options.transitionDuration || 0.5;
	this._openBtnSelector = options.openBtnSelector;
	this._calcuateDropdownSizeCodeString = options.calcuateDropdownSizeCodeString || false;
	// check for dropdown initial state (if .open present)
	if (this._elem.classList.contains('open')) {
		this._state = 'open';
	} else {
		this._state = 'closed';
	}

	this._sendEventsOnToggle = options.sendEventsOnToggle;
	// check if dropdown supposted to be incative on current screen width
	this._canceled = this._checkForMaxSizeLimit();

	// init dropdown with initial width|height
	this._horizontal ? this._initWidth() : this._initHeight();

	// bind class instance as "this" for event listener functions
	this._onClick = this._onClick.bind(this);
	this._onSignalToCloseDropdown = this._onSignalToCloseDropdown.bind(this);
	this._watchForMaxSize = this._watchForMaxSize.bind(this);

	// start listening for bubbling click event
	this._addListener(this._elem, 'click', this._onClick);

	if (options.closeOnResize) {
		// start listening for resize event on window to close dropdown automatically
		this._addListener(window, 'resize', this._onSignalToCloseDropdown);
	}
	if (options.listenToCloseSignal) {
		// start listening for bubbling signaltoclosedropdown event on document
		this._addListener(document, 'signaltoclosedropdown', this._onSignalToCloseDropdown);
	}
	if (this._cancelDropdownOnGreaterThan) {
		// start listening for resize event on window to activate|deactivate dropdown if breakpoint was set
		this._addListener(window, 'resize', this._watchForMaxSize);
	}
}

// Inherit prototype methods from Helper
Dropdown.prototype = Object.create(Helper.prototype);
Dropdown.prototype.constructor = Dropdown;

// Initialasies dropdown with initial height
Dropdown.prototype._initHeight = function() {
	if (this._canceled) return;
	this._dropdownContainer.style.height = this._checkHeight() + 'px';
};

// Initialasies dropdown with initial width
Dropdown.prototype._initWidth = function() {
	if (this._canceled) return;
	this._dropdownContainer.style.width = this._checkWidth() + 'px';
};

// Removes height from _dropdownContainer
Dropdown.prototype._removeHeight = function() {
	this._dropdownContainer.style.height = '';
};

// Removes width from _dropdownContainer
Dropdown.prototype._removeWidth = function() {
	this._dropdownContainer.style.width = '';
};

// Invoked by click event
// Arguments:
// 	1. e (required) - event object
Dropdown.prototype._onClick = function(e) {
	var target = e.target;

	// prevent default action if needed
	this._preventDefaultCheck(e);
	if (this._canceled) return;
	// test if dropdown should be change state
	this._toggleDropdown(target, e);

	return target;
};

// Returns _dropdownContainer supposted height for current state
Dropdown.prototype._checkHeight = function() {
	if (this._state === 'closed') {
		return 0;
	} else if (this._state === 'open') {
		return this._calcuateDropdownSizeCodeString ? eval(this._calcuateDropdownSizeCodeString) : this._dropdownBar.offsetHeight;
	}
};

// Returns _dropdownContainer supposted width for current state
Dropdown.prototype._checkWidth = function() {
	if (this._state === 'closed') {
		return 0;
	} else if (this._state === 'open') {
		return this._calcuateDropdownSizeCodeString ? eval(this._calcuateDropdownSizeCodeString) : this._dropdownBar.offsetWidth;
	}
};

// Tests if dropdown state should be changed
// Arguments:
// 	1. target (optional) - target of click event
// 	2. e (optional) - click event object
Dropdown.prototype._toggleDropdown = function(target, e) {
	var dropdownToggle;

	if (target) {
		// if target present then _toggleDropdown was called by click event and need to be tested is it supposted to toggle dropdown state
		dropdownToggle = target.closest(this._openBtnSelector);
	} else {
		// if target not present then toggle dropdown state
		dropdownToggle = true;
	}

	if (dropdownToggle) {
		if (e) {
			// if e present then _toggleDropdown was called by click event and default action must be canceled
			e.preventDefault();
		}

		if (this._state === 'closed') {
			this._openDropdown();
		} else {
			this._closeDropdown();
		}

		// send signal that dropdown change state if needed
		if (this._sendEventsOnToggle) {
			this._sendCustomEvent(this._elem, 'dropdowntoggle', {
				bubbles: true,
				detail: {
					state: this._state
				}
			});
		}

		return true;
	}

	return false;
};

// Opens dropdown
Dropdown.prototype._openDropdown = function() {
	this._state = 'open';
	this._elem.classList.add('open');
	this._elem.classList.remove('closed');

	// if dropdown still in process of closing, cancel _closeTimer
	if (this._closeTimer) {
		clearTimeout(this._closeTimer);
		delete this._closeTimer;
	}

	if (this._horizontal) {
		// change dropdown width
		this._changeDropdownWidth(this._checkWidth(), function(){
			// set timer to remove transition
			this._openTimer = setTimeout(function(){
				if (!this._elem || !this._dropdownContainer) return;
				delete this._openTimer;
				// remove transition to dropdown collapsing container
				this._removeTransition(this._dropdownContainer);
			}.bind(this), this._transitionDuration * 1000);
		}.bind(this));

	} else {
		// change dropdown height
		this._changeDropdownHeight(this._checkHeight(), function(){
			// set timer to remove transition
			this._openTimer = setTimeout(function(){
				if (!this._elem || !this._dropdownContainer) return;
				delete this._openTimer;
				// remove transition to dropdown collapsing container
				this._removeTransition(this._dropdownContainer);
			}.bind(this), this._transitionDuration * 1000);
		}.bind(this));

	}
};

// Closes dropdown
Dropdown.prototype._closeDropdown = function() {
	this._state = 'closed';
	this._elem.classList.remove('open');

	// if dropdown still in process of opening, cancel _openTimer
	if (this._openTimer) {
		clearTimeout(this._openTimer);
		delete this._openTimer;
	}

	if (this._horizontal) {
		// change dropdown width
		this._changeDropdownWidth(this._checkWidth(), function(){
			// set timer to remove transition
			this._closeTimer = setTimeout(function(){
				if (!this._elem || !this._dropdownContainer) return;
				delete this._closeTimer;
				// remove transition to dropdown collapsing container
				this._removeTransition(this._dropdownContainer);
				this._elem.classList.add('closed');
			}.bind(this), this._transitionDuration * 1000);
		}.bind(this));

	} else {
		// change dropdown height
		this._changeDropdownHeight(this._checkHeight(), function(){
			// set timer to remove transition
			this._closeTimer = setTimeout(function(){
				if (!this._elem || !this._dropdownContainer) return;
				delete this._closeTimer;
				// remove transition to dropdown collapsing container
				this._removeTransition(this._dropdownContainer);
				this._elem.classList.add('closed');
			}.bind(this), this._transitionDuration * 1000);
		}.bind(this));

	}
};

// Changes dropdown collapsing container height
// Arguments:
// 	1. newHeight (required) - new height value to set to dropdown
// 	2. callback (required) - function to call after height is set
Dropdown.prototype._changeDropdownHeight = function(newHeight, callback) {
	// set transition to dropdown collapsing container
	this._addTransition(this._dropdownContainer);
	this._dropdownContainer.style.height = newHeight + 'px';
	callback();
};

// Changes dropdown collapsing container width
// Arguments:
// 	1. newWidth (required) - new width value to set to dropdown
// 	2. callback (required) - function to call after width is set
Dropdown.prototype._changeDropdownWidth = function(newWidth, callback) {
	// set transition to dropdown collapsing container
	this._addTransition(this._dropdownContainer);
	this._dropdownContainer.style.width = newWidth + 'px';
	callback();
};

// Adds transition to elem
// Arguments:
// 	1. elem (required) - html element to add transition to
Dropdown.prototype._addTransition = function(elem) {
	elem.style.transitionProperty = this._horizontal ? 'width' : 'height';
	elem.style.transitionTiminFunction = 'ease';
	elem.style.transitionDelay = 0 + 's';
	elem.style.transitionDuration = this._transitionDuration + 's';
};

// Removes transition from elem
// Arguments:
// 	1. elem (required) - html element to remove transition from
Dropdown.prototype._removeTransition = function(elem) {
	elem.style.transitionProperty = '';
	elem.style.transitionTiminFunction = '';
	elem.style.transitionDelay = '';
	elem.style.transitionDuration = '';
};

// Prevent default action if needed
// Arguments:
// 	1. e (required) - event object
Dropdown.prototype._preventDefaultCheck = function(e) {
	// target element (of click event) has [data-preventDefaultUntil] then test is window inner width lower then [data-preventDefaultUntil] value
	if (e.target.hasAttribute('data-preventDefaultUntil') &&
		window.innerWidth < e.target.getAttribute('data-preventDefaultUntil')) {
		e.preventDefault();
	}
};

// Invoked by signaltoclosedropdown event on document or resize event on window
// Arguments:
// 	1. e (required) - event object
Dropdown.prototype._onSignalToCloseDropdown = function(e) {
	var check = false;

	if (e.type === 'signaltoclosedropdown') {
		// will be used to test if this dropdown element matches this selector
		var targetDropdownSelector = e.detail.targetDropdownSelector;
		// will be used to test if this dropdown element is the same html element as e.detail.targetDropdownElem
		var targetDropdownElem = e.detail.targetDropdownElem;

		// if invoked by signaltoclosedropdown then test if this dropdown should react to event
		if (
			(targetDropdownSelector && this._elem.matches(targetDropdownSelector)) ||
			(targetDropdownElem && this._elem === targetDropdownElem)
		) {
			check = true;
		}
	} else if (e.type === 'resize') {
		check = true;
	}

	if (check && this._state === 'open') {
		this._toggleDropdown();
	}
};

// Tests if window width height then breakpoint (if set)
Dropdown.prototype._checkForMaxSizeLimit = function() {
	return this._cancelDropdownOnGreaterThan && window.innerWidth > this._cancelDropdownOnGreaterThan
};

// Invoked by resize event, checks if dropdown should be active|incative on current window width
Dropdown.prototype._watchForMaxSize = function() {
	if (this._canceled && !this._checkForMaxSizeLimit()) {
		// if dropdown inactive and window width lower then breakpoint then activate it
		this._canceled = false;
		if (this._horizontal) {
			this._initWidth();
		} else {
			this._initHeight();
		}
	} else if (!this._canceled && this._checkForMaxSizeLimit()) {
		// if dropdown active and window width heiger then breakpoint then deactivate it
		this._canceled = true;
		this._removeHeight();
		this._removeWidth();
	}

};

// Try exporting class via webpack
try {
	module.exports = Dropdown;
} catch (err) {
	console.warn(err);
}
