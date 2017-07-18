"use strict";

try {
	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function SectionStartDateBgController(options) {
	options.name = options.name || 'SectionStartDateBgController';
	Helper.call(this, options);

	this._elem = options.elem;

	this._onPageSlideChanged = this._onPageSlideChanged.bind(this);
	this._onPageSlideChangedAnimationEnd = this._onPageSlideChangedAnimationEnd.bind(this);

	this._init();
}

SectionStartDateBgController.prototype = Object.create(Helper.prototype);
SectionStartDateBgController.prototype.constructor = SectionStartDateBgController;

SectionStartDateBgController.prototype._init = function() {

	this._addListener(document, 'pageSlideChanged', this._onPageSlideChanged);
	this._addListener(document, 'pageSlideChangedAnimationEnd', this._onPageSlideChangedAnimationEnd);
};

SectionStartDateBgController.prototype._onPageSlideChanged = function(e) {
	var activeSlideID = e.detail.activeSlideID,
		activeSlideElem = e.detail.activeSlideElem;

	if (this._bgElemsDisplayed) {
		this._elem.classList.remove('bg_elem_display');
		this._bgElemsDisplayed = false;
	}
};

SectionStartDateBgController.prototype._onPageSlideChangedAnimationEnd = function(e) {
	var activeSlideID = e.detail.activeSlideID,
		activeSlideElem = e.detail.activeSlideElem;

	if (!this._bgElemsDisplayed && activeSlideElem.contains(this._elem)) {
		this._elem.classList.add('bg_elem_display');
		this._bgElemsDisplayed = true;
	}
};

SectionStartDateBgController.prototype._onResize = function() {
	if (['lg'].indexOf(this._checkScreenWidth())) {
		this._elem.classList.remove('bg_elem_display');
	}
};

try {
	module.exports = SectionStartDateBgController;
} catch (err) {
	console.warn(err);
}
