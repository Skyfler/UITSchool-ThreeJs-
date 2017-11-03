"use strict";

/**
 * Class ScrollToSlide
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	_smoothScroll.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 *		1.1. name (optional) - name for class instance to show in console
 *		1.2. scrollDuration (required) - duration of smooth scroll
 *		1.3... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
	var _smoothScroll = require('./smoothScroll');
} catch (err) {
	console.warn(err);
}

function ScrollToSlide(options) {
	options.name = options.name || 'ScrollToSlide';
	// run Helper constructor
	Helper.call(this, options);

	this._scrollDuration = options.scrollDuration || 0;

	// bind class instance as "this" for event listener functions
	this._onClick = this._onClick.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
ScrollToSlide.prototype = Object.create(Helper.prototype);
ScrollToSlide.prototype.constructor = ScrollToSlide;

// Main initialisation function
ScrollToSlide.prototype._init = function() {
	this._addListener(document, 'click', this._onClick);
};

// Invoked by click event
// Arguments:
// 	1. e (required) - event object
ScrollToSlide.prototype._onClick = function(e) {
	var target = e.target;
	var scrollBtn = target.closest('[data-slide]');
	if (!scrollBtn) return;
	var scrollTargetId = scrollBtn.dataset.slide;
	if (!scrollTargetId) return;
	var scrollTarget = document.querySelector('#' + scrollTargetId);
	if (!scrollTarget || this._checkScreenWidth() === 'lg') {
		return;
	}
	// if there is a an element on the page which index matches [data-slide] attribute from target and screen width mode is not lg (<1200, that means that ScrollScreenPage is inactive) then scrol pag eto that element
	e.preventDefault();
	_smoothScroll.scrollTo(
		_smoothScroll.getPageScrollElem(),
		_smoothScroll.getCoords(scrollTarget).top,
		this._scrollDuration
	);
};

// Try exporting class via webpack
try {
	module.exports = ScrollToSlide;
} catch (err) {
	console.warn(err);
}
