"use strict";

/**
 * Class FooterCirclesController
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	circlePath.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that conains all element that supposted to be animated circles (.vk_container, .right_panel_btn.call, .right_panel_btn.right_panel_btn_2.mail, .right_panel_btn.right_panel_btn_2.message)
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
	var CirclePath = require('./circlePath');
} catch (err) {
	console.warn(err);
}

function FooterCirclesController(options) {
	options.name = options.name || 'FooterCirclesController';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;

	// bind class instance as "this" for event listener functions
	this._onCircleMouseOver = this._onCircleMouseOver.bind(this);
	this._onCircleMouseOut = this._onCircleMouseOut.bind(this);
	this._onResize = this._onResize.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
FooterCirclesController.prototype = Object.create(Helper.prototype);
FooterCirclesController.prototype.constructor = FooterCirclesController;

// Reassigned remove function from Helper
FooterCirclesController.prototype.remove = function() {
	// cancel all CirclePath instanses
	this._removeCircles();

	// call remove function from Helper
	Helper.prototype.remove.apply(this, arguments);
};

// Cancels all CirclePath instances
FooterCirclesController.prototype._removeCircles = function() {
	this._initializedSize = false;

	// stop listening to circleMouseOver and circleMouseOut from CirclePath instances
	this._removeListener(this._elem, 'circleMouseOver', this._onCircleMouseOver);
	this._removeListener(this._elem, 'circleMouseOut', this._onCircleMouseOut);

	// call remove function for each CirclePath instance
	if (this._circles && this._circles.length > 0) {
		for (var i = 0; i < this._circles.length; i++) {
			this._circles[i].remove();
		}
	}

	this._circles = [];
	this._hoveredCircles = [];
};

// Main initialisation function
FooterCirclesController.prototype._init = function() {
	// check screen width mode
	this._mode = this._checkScreenWidth();

	this._circles = [];
	this._hoveredCircles = [];

	this._addListener(window, 'resize', this._onResize);

	if (this._mode === 'xs') {
		// if screen width is < 768 (xs mode) then do nothing
		return;

	} else if (this._mode === 'sm' || this._mode === 'md') {
		// if screen width is between 768 and 1200 (sm and md mode)
		this._createSmMdCircles();

	} else if (this._mode === 'lg') {
		// if screen width is more than 1200 (lg mode)
		this._createLgCircles();

	}

	// start listening to circleMouseOver and circleMouseOut from CirclePath instances
	this._addListener(this._elem, 'circleMouseOver', this._onCircleMouseOver);
	this._addListener(this._elem, 'circleMouseOut', this._onCircleMouseOut);
};

// Initialise all CirclePath instances in lg mode
FooterCirclesController.prototype._createLgCircles = function() {
	this._animationState = 'playing';
	this._initializedSize = 'lg';

	this._circles.push( new CirclePath({
		elem: this._elem.querySelector('.vk_container'),
		centerAnchor: this._elem.querySelector('.right_panel .title'),
		animationDuration: 6000,
		radius: 215,
		startAngle: -90,
		endAngle: -100,
		reversable: true,
		checkOverflow: true
	}) );

	this._circles.push( new CirclePath({
		elem: this._elem.querySelector('.right_panel_btn.call'),
		centerAnchor: this._elem.querySelector('.right_panel .title'),
		animationDuration: 5000,
		radius: 124,
		startAngle: -80,
		endAngle: -120,
		reversable: true
	}) );

	this._circles.push( new CirclePath({
		elem: this._elem.querySelector('.right_panel_btn.right_panel_btn_2.mail'),
		centerAnchor: this._elem.querySelector('.vk_container'),
		animationDuration: 10000,
		radius: 50,
		startAngle: 540,
		endAngle: 180
	}) );

	this._circles.push( new CirclePath({
		elem: this._elem.querySelector('.right_panel_btn.right_panel_btn_2.message'),
		centerAnchor: this._elem.querySelector('.vk_container'),
		animationDuration: 10000,
		radius: 50,
		startAngle: 360,
		endAngle: 0
	}) );
};

// Initialise all CirclePath instances in sm or md mode
FooterCirclesController.prototype._createSmMdCircles = function() {
	this._animationState = 'playing';
	this._initializedSize = 'smmd';

	this._circles.push( new CirclePath({
		elem: this._elem.querySelector('.vk_container'),
		centerAnchor: this._elem.querySelector('.right_panel .title'),
		animationDuration: 6000,
		radius: 181,
		startAngle: -90,
		endAngle: -100,
		reversable: true,
		checkOverflow: true
	}) );

	this._circles.push( new CirclePath({
		elem: this._elem.querySelector('.right_panel_btn.call'),
		centerAnchor: this._elem.querySelector('.right_panel .title'),
		animationDuration: 5000,
		radius: 103,
		startAngle: -80,
		endAngle: -120,
		reversable: true
	}) );

	this._circles.push( new CirclePath({
		elem: this._elem.querySelector('.right_panel_btn.right_panel_btn_2.mail'),
		centerAnchor: this._elem.querySelector('.vk_container'),
		animationDuration: 10000,
		radius: 50,
		startAngle: 540,
		endAngle: 180
	}) );

	this._circles.push( new CirclePath({
		elem: this._elem.querySelector('.right_panel_btn.right_panel_btn_2.message'),
		centerAnchor: this._elem.querySelector('.vk_container'),
		animationDuration: 10000,
		radius: 50,
		startAngle: 360,
		endAngle: 0
	}) );
};

// Invoked by circleMouseOver event from CirclePath instances
// Arguments:
// 	1. e (required) - event object that contains CirclePath instance in the e.detail.self
FooterCirclesController.prototype._onCircleMouseOver = function(e) {
	var index = this._hoveredCircles.indexOf(e.detail.self);
	if (index === -1) {
		// if hovered CirclePath instance is not in the _hoveredCircles then add it there
		this._hoveredCircles.push(e.detail.self);
	}

	this._checkForHoveredCircles();
};

// Invoked by circleMouseOut event from CirclePath instances
// Arguments:
// 	1. e (required) - event object that contains CirclePath instance in the e.detail.self
FooterCirclesController.prototype._onCircleMouseOut = function(e) {
	var index = this._hoveredCircles.indexOf(e.detail.self);
	if (index === -1) {

	} else {
		// if CirclePath instance that lost hover is in the _hoveredCircles then remove it from there
		this._hoveredCircles.splice(index, 1);
	}

	this._checkForHoveredCircles();
};

// Stops|restarts CirclePath instances animations
FooterCirclesController.prototype._checkForHoveredCircles = function() {
	if (this._hoveredCircles.length === 0 && this._animationState === 'paused') {
		// if there are none hovered CirclePath instances and timer to start animations is already set then disable it
		if (this._animationStartDelay) {
			clearTimeout(this._animationStartDelay);
		}
		// set timer to start CirclePath instances animations
		this._animationStartDelay = setTimeout(function() {
			delete this._animationStartDelay;
			this._startAnimations();
		}.bind(this), 1000);

	} else if (this._hoveredCircles.length > 0) {
		if (this._animationStartDelay) {
			// if there are any hovered CirclePath instances and timer to start animations is set then disable it
			clearTimeout(this._animationStartDelay);
			delete this._animationStartDelay;

		} else if (this._animationState === 'playing') {
			// else pause CirclePath instances animations
			this._pauseAnimations();

		}

	}
};

// Pauses all CirclePath instances animations
FooterCirclesController.prototype._pauseAnimations = function() {
	for (var i = 0; i < this._circles.length; i++) {
		this._circles[i].pauseAnimation();
	}

	this._animationState = 'paused';
};

// Resumes all CirclePath instances animations
FooterCirclesController.prototype._startAnimations = function() {
	for (var i = 0; i < this._circles.length; i++) {
		this._circles[i].startAnimation();
	}

	this._animationState = 'playing';
};

// Invoked by resize event on window
// Arguments:
// 	1. e (required) - event object
FooterCirclesController.prototype._onResize = function(e) {
	// check screen width mode
	this._mode = this._checkScreenWidth();

	if ((this._mode === 'sm' || this._mode === 'md') && this._initializedSize !== 'smmd') {
		// if screen width mode is sm or md (between 768 and 1200) and CirclePath instances are not initialised with the _createSmMdCircles then reinitialise them with _createSmMdCircles
		if (this._circles.length > 0) {
			this._removeCircles();
		}

		this._createSmMdCircles();

		// start listening to circleMouseOver and circleMouseOut from CirclePath instances
		this._addListener(this._elem, 'circleMouseOver', this._onCircleMouseOver);
		this._addListener(this._elem, 'circleMouseOut', this._onCircleMouseOut);

	} else if (this._mode === 'lg' && this._initializedSize !== 'lg') {
		// if screen width mode is lg (more than 1200) and CirclePath instances are not initialised with the _createLgCircles then reinitialise them with _createLgCircles
		if (this._circles.length > 0) {
			this._removeCircles();
		}

		this._createLgCircles();

		// start listening to circleMouseOver and circleMouseOut from CirclePath instances
		this._addListener(this._elem, 'circleMouseOver', this._onCircleMouseOver);
		this._addListener(this._elem, 'circleMouseOut', this._onCircleMouseOut);

	} else if ((this._mode === 'xs') && this._circles.length > 0) {
		// if screen width mode is xs (less then 768) the disable all CirclePath instances
		this._removeCircles();

	}
};

// Try exporting class via webpack
try {
	module.exports = FooterCirclesController;
} catch (err) {
	console.warn(err);
}
