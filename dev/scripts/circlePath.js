"use strict";

/**
 * Class CirclePath
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	animation.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that will be animated
 *		1.2. name (optional) - name for class instance to show in console
 * 		1.3. startAngle (required) - angle to start animation from
 * 		1.4. endAngle (required) - angle up to which animate
 * 		1.5. radius (required) - radius (px) of circle path
 * 		1.6. centerAnchor (required) - html element or coordinates that will be center of circle path
 * 		1.7. animationDuration (required) - duration of animation
 * 		1.8. reversable (optional) - if set to true then animation will be reversed on 2, 4, 6, etc. runs
 * 		1.9. checkOverflow (optional) - if set to true then animation will be paused when mouse is over element
 *		1.10... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function CirclePath(options) {
	options.name = options.name || 'CirclePath';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;
	this._startAngle = options.startAngle;
	this._endAngle = options.endAngle;
	this._radius = options.radius;
	this._centerAnchor = options.centerAnchor;
	this._animationDuration = options.animationDuration;
	this._reversable = !!options.reversable;
	this._checkOverflow = options.checkOverflow || false;

	// bind class instance as "this" for event listener functions
	this._onMouseOver = this._onMouseOver.bind(this);
	this._onMouseOut = this._onMouseOut.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
CirclePath.prototype = Object.create(Helper.prototype);
CirclePath.prototype.constructor = CirclePath;

// Reassigned remove function from Helper
CirclePath.prototype.remove = function() {
	// if animation in progress then stop it
	if (this._animation) {
		this._animation.stop();
		delete this._animation;
	}

	this._elem.style.left = '';
	this._elem.style.top = '';

	// call remove function from Helper
	Helper.prototype.remove.apply(this, arguments);
};

// Main initialisation function
CirclePath.prototype._init = function() {
	this._firstLoop = true;
	// start looped animation
	this._loop();

	// start listening for bubbling mouseover and mouseout events
	this._addListener(this._elem, 'mouseover', this._onMouseOver);
	this._addListener(this._elem, 'mouseout', this._onMouseOut);
};

// Starts looped animation
CirclePath.prototype._loop = function() {
	this._animation = new Animation(
		function(timePassed) {
			// calculate timing function progress of animation
			var timeMuliplier;
			if (this._firstLoop && !this._reversable) {
				timeMuliplier = Animation.linear(this._animationDuration, timePassed);
			} else if (!this._firstLoop && !this._reversable) {
				timeMuliplier = Animation.linear(this._animationDuration, timePassed);
			} else {
				timeMuliplier = Animation.quadEaseInOut(this._animationDuration, timePassed);
			}

			// calculate current angle on circle path
			var curAngle;
			if (this._animationReversed) {
				curAngle = this._endAngle - (this._endAngle - this._startAngle) * timeMuliplier;
			} else {
				curAngle = this._startAngle + (this._endAngle - this._startAngle) * timeMuliplier;
			}

			// set element position according to calculated angle
			this._setPositionOnCircle(curAngle);
		}.bind(this),
		this._animationDuration,
		function() {
			// reverse animation if needed
			if (this._reversable) {
				this._animationReversed = !this._animationReversed;
			}

			delete this._firstLoop;
			// continue loop
			this._loop();
		}.bind(this)
	);
};

// Set element's position on circle path
// Arguments:
// 	1. angleDegs (required) - angle to calculate position
CirclePath.prototype._setPositionOnCircle = function(angleDegs) {
	var anchorIsElem = false;
	// check if anchor is html element
	if (this._centerAnchor.offsetTop !== undefined &&
		this._centerAnchor.offsetLeft !== undefined &&
		this._centerAnchor.offsetWidth !== undefined &&
		this._centerAnchor.offsetHeight !== undefined) {
		anchorIsElem = true;
	}

	var centerCoords = {};

	if (anchorIsElem) {
		// if anchor is html element than center coords will be it's center
		centerCoords.x = this._centerAnchor.offsetLeft + this._centerAnchor.offsetWidth / 2;
		centerCoords.y = this._centerAnchor.offsetTop + this._centerAnchor.offsetHeight / 2;

	} else {
		centerCoords.x = this._centerAnchor.x;
		centerCoords.y = this._centerAnchor.y;

	}

	// calculate position
	var circlePathCoords = this._calculatePointOnCircleCoordinates(centerCoords.x, centerCoords.y, this._radius, angleDegs);

	this._elem.style.left = circlePathCoords.x - this._elem.offsetWidth / 2 + 'px';
	this._elem.style.top = circlePathCoords.y - this._elem.offsetHeight / 2 + 'px';
};

// Calculate coordinates for current angle
// Arguments:
// 	1. centerCircleXCoordinate (required) - x cordinate of center of the circle
// 	2. centerCircleYCoordinate (required) - y cordinate of center of the circle
// 	3. circleRadius (required) - radius (px) of circle path
// 	4. angleDegs (required) - angle to calculate position
CirclePath.prototype._calculatePointOnCircleCoordinates = function(centerCircleXCoordinate, centerCircleYCoordinate, circleRadius, angleDegs) {
	var angleRads = angleDegs * (Math.PI/180);
	var x = centerCircleXCoordinate + circleRadius * Math.sin(angleRads);
	var y = centerCircleYCoordinate + circleRadius * Math.cos(angleRads);

	return {
		x: x,
		y: y
	};
};

// Pauses current animation
CirclePath.prototype.pauseAnimation = function() {
	this._animation.pause();
};

// Resumes current animation
CirclePath.prototype.startAnimation = function() {
	this._animation.play();
};

// Invoked by mouseover event
// Arguments:
// 	1. e (required) - event object
CirclePath.prototype._onMouseOver = function(e) {
	var target = e.target;
	var relTarget = e.relatedTarget;

	var _1 = this._elem.contains(target);
	var _2 = this._elem.contains(relTarget);
	var _3 = this._checkOverflow ? !this._overflowCheck(e.clientX, e.clientY) : _2;
	var _4 = (_1 && _3);

	if (_4) {
		return;
	}

	// if element conatins target element and relTarget element, _checkOverflow is set to true and mouse coordinates are inside element than send signal to stop animation
	this._sendCustomEvent(this._elem, 'circleMouseOver', {bubbles: true, detail: {self: this}});
};

// Invoked by mouseout event
// Arguments:
// 	1. e (required) - event object
CirclePath.prototype._onMouseOut = function(e) {
	var target = e.target;
	var relTarget = e.relatedTarget;

	var _1 = this._elem.contains(target);
	var _2 = this._elem.contains(relTarget);
	var _3 = this._checkOverflow ? this._overflowCheck(e.clientX, e.clientY) : _2;
	var _4 = (_1 && _3);

	if (_4) {
		return;
	}

	// if element conatins target element and relTarget element, _checkOverflow is set to true and mouse coordinates are inside element than send signal to resume animation
	this._sendCustomEvent(this._elem, 'circleMouseOut', {bubbles: true, detail: {self: this}});
};


// Checks if mouse coords are inside element
CirclePath.prototype._overflowCheck = function(clientX, clientY) {
	var rect = this._elem.getBoundingClientRect();

	var check = false;

	if (
		clientX >= rect.left &&
		clientX <= rect.right &&
		clientY >= rect.top &&
		clientY <= rect.bottom
	) {
		check = true;
	}

	return check;
};

// Try exporting class via webpack
try {
	module.exports = CirclePath;
} catch (err) {
	console.warn(err);
}
