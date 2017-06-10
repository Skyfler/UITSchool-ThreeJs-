"use strict";

var Helper = require('./helper');
var Animation = require('./animation');

function CirclePath(options) {
	options.name = options.name || 'CirclePath';
	Helper.call(this, options);

	this._elem = options.elem;
	this._startAngle = options.startAngle;
	this._endAngle = options.endAngle;
	this._radius = options.radius;
	this._centerAnchor = options.centerAnchor;
	this._animationDuration = options.animationDuration;
	this._reversable = !!options.reversable;
	this._checkOverflow = options.checkOverflow || false;

	this._onMouseOver = this._onMouseOver.bind(this);
	this._onMouseOut = this._onMouseOut.bind(this);

	this._init();
}

CirclePath.prototype = Object.create(Helper.prototype);
CirclePath.prototype.constructor = CirclePath;

CirclePath.prototype.remove = function() {
	if (this._animation) {
		this._animation.stop();
	}

	this._elem.style.left = '';
	this._elem.style.top = '';

	Helper.prototype.remove.apply(this, arguments);
};

CirclePath.prototype._init = function() {
	this._firstLoop = true;
//	this._setPositionOnCircle(this._startAngle);
	this._loop();

	this._addListener(this._elem, 'mouseover', this._onMouseOver);
	this._addListener(this._elem, 'mouseout', this._onMouseOut);
};

CirclePath.prototype._loop = function() {
	this._animation = new Animation(
		function(timePassed) {
			var timeMuliplier;

			if (this._firstLoop && !this._reversable) {
				timeMuliplier = Animation.linear(this._animationDuration, timePassed);

			} else if (!this._firstLoop && !this._reversable) {
				timeMuliplier = Animation.linear(this._animationDuration, timePassed);

			} else {
				timeMuliplier = Animation.quadEaseInOut(this._animationDuration, timePassed);

			}

			var curAngle;
			if (this._animationReversed) {
				curAngle = this._endAngle - (this._endAngle - this._startAngle) * timeMuliplier;
			} else {
				curAngle = this._startAngle + (this._endAngle - this._startAngle) * timeMuliplier;
			}

			this._setPositionOnCircle(curAngle);
		}.bind(this),
		this._animationDuration,
		function() {
			if (this._reversable) {
				this._animationReversed = !this._animationReversed;
			}

			delete this._firstLoop;
			this._loop();
		}.bind(this)
	);
};

CirclePath.prototype._setPositionOnCircle = function(angleDegs) {
	var anchorIsElem = false;
	if (this._centerAnchor.offsetTop !== undefined &&
		this._centerAnchor.offsetLeft !== undefined &&
		this._centerAnchor.offsetWidth !== undefined &&
		this._centerAnchor.offsetHeight !== undefined) {
		anchorIsElem = true;
	}

	var centerCoords = {};

	if (anchorIsElem) {
		centerCoords.x = this._centerAnchor.offsetLeft + this._centerAnchor.offsetWidth / 2;
		centerCoords.y = this._centerAnchor.offsetTop + this._centerAnchor.offsetHeight / 2;

	} else {
		centerCoords.x = this._centerAnchor.x;
		centerCoords.y = this._centerAnchor.y;

	}

	var circlePathCoords = this._calculatePointOnCircleCoordinates(centerCoords.x, centerCoords.y, this._radius, angleDegs);

	this._elem.style.left = circlePathCoords.x - this._elem.offsetWidth / 2 + 'px';
	this._elem.style.top = circlePathCoords.y - this._elem.offsetHeight / 2 + 'px';
};

CirclePath.prototype._calculatePointOnCircleCoordinates = function(centerCircleXCoordinate, centerCircleYCoordinate, circleRadius, angleDegs) {
	var angleRads = angleDegs * (Math.PI/180);
	var x = centerCircleXCoordinate + circleRadius * Math.sin(angleRads);
	var y = centerCircleYCoordinate + circleRadius * Math.cos(angleRads);

	return {
		x: x,
		y: y
	};
};

CirclePath.prototype.pauseAnimation = function() {
	this._animation.pause();
};

CirclePath.prototype.startAnimation = function() {
	this._animation.play();
};

CirclePath.prototype._onMouseOver = function(e) {
	var target = e.target;
	var relTarget = e.relatedTarget;

	var _1 = this._elem.contains(target);
	var _2 = this._elem.contains(relTarget);
//	var _3 = this._overflowCheck(e.clientX, e.clientY);
	var _4 = this._checkOverflow ? !this._overflowCheck(e.clientX, e.clientY) : _2;
	var _5 = (_1 && _4);

	if (_5) {
		return;
	}

	this._sendCustomEvent(this._elem, 'circleMouseOver', {bubbles: true, detail: {self: this}});
};

CirclePath.prototype._onMouseOut = function(e) {
	var target = e.target;
	var relTarget = e.relatedTarget;

	var _1 = this._elem.contains(target);
	var _2 = this._elem.contains(relTarget);
//	var _3 = this._overflowCheck(e.clientX, e.clientY);
	var _4 = this._checkOverflow ? this._overflowCheck(e.clientX, e.clientY) : _2;
	var _5 = (_1 && _4);

	if (_5) {
		return;
	}

	this._sendCustomEvent(this._elem, 'circleMouseOut', {bubbles: true, detail: {self: this}});
};

CirclePath.prototype._overflowCheck = function(clientX, clientY) {
//	var hiddenElems = [],
//		check = false,
//		noElemsLeft = false,
//		elem;
//
//	while (!check && !noElemsLeft) {
//		elem = document.elementFromPoint(clientX, clientY);
//		if (elem === this._elem) {
//			check = true;
//
//		} else if (elem == null || elem === document.documentElement) {
//			noElemsLeft = true;
//
//		} else {
//			hiddenElems.push(elem);
//			elem.style.display = 'none';
//		}
//	}
//
//	for (var i = 0; i < hiddenElems.length; i++) {
//		hiddenElems[i].style.display = '';
//	}

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

module.exports = CirclePath;
