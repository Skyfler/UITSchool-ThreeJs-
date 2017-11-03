"use strict";

/**
 * Class Menu
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	animation.js
 * 	img/icon_menu_closed.png
 * 	img/icon_menu_open.png
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that contains left menu column (#carousel_menu_left) and right menu column (#carousel_menu_right)
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. animationDuration (required) - animation duration of menu toggling
 *		1.4. openBtnSelector (required) - selector that will be used to test if user clicked on element that toggles menu state
 *		1.5. offsetElem (optional) - html element which width will be considered when hiding menu
 *		1.6... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function Menu(options) {
	options.name = options.name || 'Menu';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;
	this._animationDuration = options.animationDuration || 500;
	this._openBtnSelector = options.openBtnSelector;
	this._offsetElem = options.offsetElem;

	// bind class instance as "this" for event listener functions
	this._onClick = this._onClick.bind(this);
	this._onResize = this._onResize.bind(this);

	// run main initialisation function
	this._init(options);
}

// Inherit prototype methods from Helper
Menu.prototype = Object.create(Helper.prototype);
Menu.prototype.constructor = Menu;

// Main initialisation function
Menu.prototype._init = function(options) {
	this._dropdownContainer = this._elem.querySelector(options.dropdownContainerSelector);

	var offset = this._offsetElem ? this._offsetElem.offsetWidth : 0;

	// preload images
	this._loadImages(['img/icon_menu_closed.png', 'img/icon_menu_open.png']);

	// hide menu outside window
	this._dropdownContainer.style.right = -1 * ((this._dropdownContainer.offsetWidth + window.innerWidth - this._elem.getBoundingClientRect().right) - offset) + 'px';
	this._state = 'closed';

	// start listening for bubbling click event and resize event on window
	this._addListener(this._elem, 'click', this._onClick);
	this._addListener(window, 'resize', this._onResize);
};

// Invoked by click event
// Arguments:
// 	1. e (required) - event object
Menu.prototype._onClick = function(e) {
	var target = e.target;
	if (!target) return;

	var dropdownToggle = target.closest(this._openBtnSelector);
	if (!dropdownToggle) return;
	// if click was on element which supposted to toggle menu state then toggle it
	if (this._state === 'closed') {
		this._openMenu();

	} else if (this._state === 'open') {
		this._closeMenu();

	}
};

// Opens menu
Menu.prototype._openMenu = function() {
	// set target right coordinate
	this._endRight = 0;
	// animate menu to target right coordinate
	this._toggleMenu();

	if (this._elem.classList.contains('closed')) {
		this._elem.classList.remove('closed');
	}
	this._elem.classList.add('open');

	this._state = 'open';
};

// Closes menu
Menu.prototype._closeMenu = function() {
	var offset = this._offsetElem ? this._offsetElem.offsetWidth : 0;

	// set target right coordinate
	this._endRight = -1 * ((this._dropdownContainer.offsetWidth + window.innerWidth - this._elem.getBoundingClientRect().right) - offset);
	// animate menu to target right coordinate
	this._toggleMenu();

	if (this._elem.classList.contains('open')) {
		this._elem.classList.remove('open');
	}
	this._elem.classList.add('closed');

	this._state = 'closed';
};

// Animates menu to target right coordinate
Menu.prototype._toggleMenu = function() {
	// get starting right coordinate
	var startRight = parseFloat(getComputedStyle(this._dropdownContainer).right);

	// if animation is currentely in progress then stop it
	if (this._currentAnimation) {
		this._currentAnimation.stop();
	}

	// start new animation from starting right coordinate to target right coordinate
	this._currentAnimation = new Animation(
		function(timePassed){
			// calculate current right coordinate and set it to _dropdownContainer
			var timeMultiplier = Animation.quadEaseInOut(this._animationDuration, timePassed);
			var curRight = startRight + ((this._endRight - startRight) * (timeMultiplier));

			this._dropdownContainer.style.right = curRight + 'px';
		}.bind(this),
		this._animationDuration,
		function() {
			delete this._endRight;
			delete this._currentAnimation;
		}.bind(this)
	);
};

// Invoked by resize event on window
// Arguments:
// 	1. e (required) - event object
Menu.prototype._onResize = function() {
	if (this._currentAnimation) {
		// if animation is in progress then recalculate target right coordinate
		if (this._state === 'closed') {
			var offset = this._offsetElem ? this._offsetElem.offsetWidth : 0;
			this._endRight = -1 * ((this._dropdownContainer.offsetWidth + window.innerWidth - this._elem.getBoundingClientRect().right) - offset);

		} else if (this._state === 'open') {
			this._endRight = 0;

		}

	} else {
		// else set new rigth coordinate to _dropdownContainer
		if (this._state === 'closed') {
			var offset = this._offsetElem ? this._offsetElem.offsetWidth : 0;
			this._dropdownContainer.style.right = -1 * ((this._dropdownContainer.offsetWidth + window.innerWidth - this._elem.getBoundingClientRect().right) - offset) + 'px';

		} else if (this._state === 'open') {
			this._dropdownContainer.style.right = 0;

		}

	}
};

// Try exporting class via webpack
try {
	module.exports = Menu;
} catch (err) {
	console.warn(err);
}
