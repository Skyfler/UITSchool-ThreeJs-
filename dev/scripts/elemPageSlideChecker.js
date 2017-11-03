"use strict";

/**
 * Class ElemPageSlideChecker
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that will be checked on which page slide it is situated
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. pageScrollerElem (required) - html element container of page slides
 *		1.4... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function ElemPageSlideChecker(options) {
	options.name = options.name || 'ElemPageSlideChecker';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;
	this._pageScrollerElem = options.pageScrollerElem;

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
ElemPageSlideChecker.prototype = Object.create(Helper.prototype);
ElemPageSlideChecker.prototype.constructor = ElemPageSlideChecker;

// Main initialisation function
ElemPageSlideChecker.prototype._init = function() {
	this._initWithParts();

	// start loop
	this._loop();
};

// Finds all page slides and page slide parts
ElemPageSlideChecker.prototype._initWithParts = function() {
	this._pageSlidesArr = [];
	var pageSlideArr = this._pageScrollerElem.querySelectorAll('.page_slide');
	var pageSlidePartArr;

	for (var i = 0; i < pageSlideArr.length; i++) {
		pageSlidePartArr = pageSlideArr[i].querySelectorAll('.page_slide_part');

		if (pageSlidePartArr.length > 0) {
			// if page slide contains page slide parts add them to _pageSlidesArr instead of it
			// Array.prototype.slice.call is to transform array-like collection to array
			this._pageSlidesArr = this._pageSlidesArr.concat(Array.prototype.slice.call(pageSlidePartArr));
		} else {
			// else add page slide to _pageSlidesArr
			this._pageSlidesArr.push(pageSlideArr[i]);
		}
	}

	this._pageSlidesPageYOffsetArr = [];

	if (this._checkScreenWidth() === 'md') {
		this._setInit();
	}
};

// Loop to check over which page slide this._elem is currentelly situated
ElemPageSlideChecker.prototype._loop = function() {
	if (this._checkScreenWidth() === 'md') {
		// if screen width is 1200 or more (lg mode) and ElemPageSlideChecker instance is inactive then activate it
		// if screen width is less then 992 (xs or sm mode) then side contact buttons are hidden
		if (!this._initialized) {
			this._setInit();
		}

		var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

		// calculate top offsets of all page slides
		this._recalculateSlidesPageYOffset(scrollTop);
		// find over which page slide this._elem is currentelly situated
		this._findCurrentActiveSlide(scrollTop);

	} else if (this._initialized) {
		// if screen width is in xs (<768), sm ([768, 991]) or lg (>1200) mode then deactivate it
		this._cancelInit();
		this._elem.removeAttribute('data-over-slide');

	}

	// continue loop
	this._requestId = requestAnimationFrame(this._loop.bind(this));
};

// Recalculates top offsets from document of all page slides
ElemPageSlideChecker.prototype._recalculateSlidesPageYOffset = function(scrollTop) {
	for (var i = 0; i < this._pageSlidesArr.length; i++) {
		this._pageSlidesPageYOffsetArr[i] = this._pageSlidesArr[i].getBoundingClientRect().top + scrollTop;
	}
};

// Test which page slide is currentely under this._elem
ElemPageSlideChecker.prototype._findCurrentActiveSlide = function(scrollTop) {
	// get center y coordinate of this._elem
	var elemCenterY = this._elem.getBoundingClientRect().top + this._elem.offsetHeight / 2 + scrollTop;

	var expectedActiveSlideIndex,
		expectedActiveSlide;
	// find page slide which document offset top will be closest and smaller to elemCenterY, that is suposted to be the page slide which is currentely under this._elem
	for (var i = 0, closestSmallerOffset; i < this._pageSlidesArr.length; i++) {
		if (this._pageSlidesPageYOffsetArr[i] < elemCenterY
			&& (!closestSmallerOffset || this._pageSlidesPageYOffsetArr[i] > closestSmallerOffset)
		   ) {
			closestSmallerOffset = this._pageSlidesPageYOffsetArr[i];
			expectedActiveSlide = this._pageSlidesArr;
			expectedActiveSlideIndex = i;
		}
	}

	// set new index of page slide in [data-over-slide] attribute if needed
	if (parseInt(this._elem.dataset.overSlide) !== expectedActiveSlideIndex) {
		this._elem.dataset.overSlide = expectedActiveSlideIndex;
		this._expectedActiveSlide = expectedActiveSlideIndex;
		this._expectedActiveSlideIndex = expectedActiveSlide;
	}
};

// Sets ElemPageSlideChecker instance active
ElemPageSlideChecker.prototype._setInit = function() {
	this._initialized = true;
};

// Sets ElemPageSlideChecker instance inactive
ElemPageSlideChecker.prototype._cancelInit = function() {
	this._initialized = false;
};

// Try exporting class via webpack
try {
	module.exports = ElemPageSlideChecker;
} catch (err) {
	console.warn(err);
}
