"use strict";

/**
 * Class SectionStartDateBgController
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element (#course_start_date page slide)
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function SectionStartDateBgController(options) {
	options.name = options.name || 'SectionStartDateBgController';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;

	// bind class instance as "this" for event listener functions
	this._onPageSlideChanged = this._onPageSlideChanged.bind(this);
	this._onPageSlideChangedAnimationEnd = this._onPageSlideChangedAnimationEnd.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
SectionStartDateBgController.prototype = Object.create(Helper.prototype);
SectionStartDateBgController.prototype.constructor = SectionStartDateBgController;

// Main initialisation function
SectionStartDateBgController.prototype._init = function() {
	// start listening to page slide animation signals
	this._addListener(document, 'pageSlideChanged', this._onPageSlideChanged);
	this._addListener(document, 'pageSlideChangedAnimationEnd', this._onPageSlideChangedAnimationEnd);
};

// Invoked by pageSlideChanged event
// Arguments:
// 	1. e (required) - event object
SectionStartDateBgController.prototype._onPageSlideChanged = function(e) {
	var activeSlideID = e.detail.activeSlideID,
		activeSlideElem = e.detail.activeSlideElem;

	// if #course_start_date page slide has class 'bg_elem_display' (backround text is shown) then remove it
	if (this._bgElemsDisplayed) {
		this._elem.classList.remove('bg_elem_display');
		this._bgElemsDisplayed = false;
	}
};

// Invoked by pageSlideChangedAnimationEnd event
// Arguments:
// 	1. e (required) - event object
SectionStartDateBgController.prototype._onPageSlideChangedAnimationEnd = function(e) {
	var activeSlideID = e.detail.activeSlideID,
		activeSlideElem = e.detail.activeSlideElem;

	// if current active page slide is #course_start_date and it doen't have class 'bg_elem_display' (backround text is not shown), then add it
	if (!this._bgElemsDisplayed && activeSlideElem.contains(this._elem)) {
		this._elem.classList.add('bg_elem_display');
		this._bgElemsDisplayed = true;
	}
};

// Invoked by resize event on window
SectionStartDateBgController.prototype._onResize = function() {
	// remove class 'bg_elem_display' (backround text) if screen width mode is not lg (<1200, that means that ScrollScreenPage is inactive)
	if (['lg'].indexOf(this._checkScreenWidth())) {
		this._elem.classList.remove('bg_elem_display');
	}
};

// Try exporting class via webpack
try {
	module.exports = SectionStartDateBgController;
} catch (err) {
	console.warn(err);
}
