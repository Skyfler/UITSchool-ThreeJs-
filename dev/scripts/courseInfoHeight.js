"use strict";

/**
 * Class CourseInfoHeight
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element which contains elements that will be watched (.page_slide_part_content and .page_slide_part_content)
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function CourseInfoHeight(options) {
	options.name = options.name || 'CourseInfoHeight';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;

	// bind class instance as "this" for event listener functions
	this._onResize = this._onResize.bind(this);
	this._loop = this._loop.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
CourseInfoHeight.prototype = Object.create(Helper.prototype);
CourseInfoHeight.prototype.constructor = CourseInfoHeight;

// Main initialisation function
CourseInfoHeight.prototype._init = function() {
	// search for elements to watch size
	this._resizeElem = this._elem.querySelector('#course_info_part_1 .page_slide_part_content');
	this._measureElem = this._elem.querySelector('#course_info_part_2 .page_slide_part_content');

	// calling _onResize first time manually
	this._onResize();
	// start listening for resize event on window
	this._addListener(window, 'resize', this._onResize);
	// start loop to watch for size change on elements
	requestAnimationFrame(this._loop);
};

// Invoked by resize event on window
// Arguments:
// 	1. e (required) - event object
CourseInfoHeight.prototype._onResize = function() {
	// adapt height of _resizeElem if window height >= 1200
	if (window.innerWidth >= 1200) {
		this._resize = true;
		this._measureElemHeight = this._measureElem.offsetHeight;
		this._resizeElem.style.height = this._measureElemHeight + 'px';

	} else if (this._resize && window.innerWidth < 1200) {
		this._resize = false;
		this._resizeElem.style.height = '';

	}

	// set|remove attribute [data-no-page-scroll-area="true"] if needed
	this._setPageScrollArea(this._resizeElem);
	this._setPageScrollArea(this._measureElem);
};

// Checks if height of measure elem has changed
CourseInfoHeight.prototype._checkMeasureElemHeight = function() {
	if (this._measureElemHeight !== this._measureElem.offsetHeight) {
		this._onResize();
	}
};

// Watches for size change on elements
CourseInfoHeight.prototype._loop = function() {
	// set|remove attribute [data-no-page-scroll-area="true"] if needed
	if (this._resizeElem && this._measureElem) {
		this._setPageScrollArea(this._resizeElem);
		this._setPageScrollArea(this._measureElem);
		this._checkMeasureElemHeight();
	}

	// continue loop
	requestAnimationFrame(this._loop);
};

// Sets|removes attribute [data-no-page-scroll-area="true"] if element has|doesn't have y scroll
CourseInfoHeight.prototype._setPageScrollArea = function(elem) {
	if (elem.scrollHeight > elem.offsetHeight && !elem.dataset.noPageScrollArea) {
		// if element has scroll and attribute is not set then set it
		elem.dataset.noPageScrollArea = true;
	} else if (elem.scrollHeight === elem.offsetHeight && elem.dataset.noPageScrollArea === "true") {
		// if element doesn't have scroll and attribute is set then remove it
		elem.removeAttribute('data-no-page-scroll-area');
	}
};

// Try exporting class via webpack
try {
	module.exports = CourseInfoHeight;
} catch (err) {
	console.warn(err);
}
