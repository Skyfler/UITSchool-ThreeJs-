"use strict";

/**
 * Class OnlineBtnController
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element button
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function OnlineBtnController(options) {
	options.name = options.name || 'OnlineBtnController';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;

	// bind class instance as "this" for event listener functions
	this._onResize = this._onResize.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
OnlineBtnController.prototype = Object.create(Helper.prototype);
OnlineBtnController.prototype.constructor = OnlineBtnController;

// Main initialisation function
OnlineBtnController.prototype._init = function() {
	this._onResize();
	this._addListener(window, 'resize', this._onResize);
};

// Calculate coordinates for current angle
// Arguments:
// 	1. centerCircleXCoordinate (required) - x cordinate of center of the circle
// 	2. centerCircleYCoordinate (required) - y cordinate of center of the circle
// 	3. circleRadius (required) - radius (px) of circle path
// 	4. angleDegs (required) - angle to calculate position
OnlineBtnController.prototype._calculatePointOnCircleCoordinates = function(centerCircleXCoordinate, centerCircleYCoordinate, circleRadius, angleDegs) {
	var angleRads = angleDegs * (Math.PI/180);
	var x = centerCircleXCoordinate + circleRadius * Math.sin(angleRads);
	var y = centerCircleYCoordinate + circleRadius * Math.cos(angleRads);

	return {
		x: x,
		y: y
	};
};

// Invoked by resize event on window
OnlineBtnController.prototype._onResize = function() {
	// find all offset elements (same as in threeMainController-centerMain.js)
	var topOffset = document.querySelector('.top_panel').offsetHeight;
	var bottomOffset = document.querySelector('footer').offsetHeight;
	var leftMenu = document.querySelector('#carousel_menu_left');
	var leftOffset = leftMenu.offsetHeight > 0 ? leftMenu.offsetWidth : 0;
	var rightOffset = document.querySelector('#carousel_menu_right').offsetWidth;

	// calculate size of field on canvas where main backround circle will be drawn
	var height = window.innerHeight - topOffset - bottomOffset;
	var width = window.innerWidth - leftOffset - rightOffset;

	var angleDegs = 45;

	// get center coordinates of main background circle
	var centerCoords = {
		x: width / 2 + leftOffset,
		y: height / 2 + topOffset,
	};

	var radius = (width / 2) > (height / 2) ? (height / 2) : (width / 2);

	// find coordinates on main circle
	var circlePathCoords = this._calculatePointOnCircleCoordinates(centerCoords.x, centerCoords.y, radius - this._elem.offsetWidth * 0.33, angleDegs);

	this._elem.style.left = circlePathCoords.x - this._elem.offsetWidth / 2 + 'px';
	this._elem.style.top = circlePathCoords.y - this._elem.offsetHeight / 2 + 'px';
};

// Try exporting class via webpack
try {
	module.exports = OnlineBtnController;
} catch (err) {
	console.warn(err);
}
