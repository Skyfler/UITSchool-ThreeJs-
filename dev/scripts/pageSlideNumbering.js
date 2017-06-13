"use strict";

try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function PageSlideNumbering(options) {
	options.name = options.name || 'PageSlideNumbering';
	Helper.call(this, options);

	this._elem = options.elem;

	this._init();
}

PageSlideNumbering.prototype = Object.create(Helper.prototype);
PageSlideNumbering.prototype.constructor = PageSlideNumbering;

PageSlideNumbering.prototype._init = function() {
	this._initWithParts();

	this._loop();
};

PageSlideNumbering.prototype._initWithParts = function() {
	this._pageSlidesArr = [];
	var pageSlideArr = this._elem.querySelectorAll('.page_slide');
	var pageSlidePartArr;

	for (var i = 0; i < pageSlideArr.length; i++) {
		pageSlidePartArr = pageSlideArr[i].querySelectorAll('.page_slide_part');

		if (pageSlidePartArr.length > 0) {
			this._pageSlidesArr = this._pageSlidesArr.concat(Array.prototype.slice.call(pageSlidePartArr));
		} else {
			this._pageSlidesArr.push(pageSlideArr[i]);
		}
	}

	this._pageSlidesPageYOffsetArr = [];

	if (this._checkScreenWidth() !== 'lg') {
		this._setInit();
	}
};

PageSlideNumbering.prototype._loop = function() {
	if (this._checkScreenWidth() !== 'lg') {
		if (!this._initialized) {
			this._setInit();
		}

		var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

		this._recalculateSlidesPageYOffset(scrollTop);
		this._findCurrentActiveSlide(scrollTop);

	} else if (this._initialized) {
		this._cancelInit();

	}

	this._requestId = requestAnimationFrame(this._loop.bind(this));
};

PageSlideNumbering.prototype._recalculateSlidesPageYOffset = function(scrollTop) {
	for (var i = 0; i < this._pageSlidesArr.length; i++) {
		this._pageSlidesPageYOffsetArr[i] = this._pageSlidesArr[i].getBoundingClientRect().top + scrollTop;
	}
};

PageSlideNumbering.prototype._findCurrentActiveSlide = function(scrollTop) {
//	var nextSlideBounds = window.innerHeight / 2 + scrollTop;
	var nextSlideBounds = window.innerHeight - 54 + scrollTop;

	var expectedActiveSlideIndex,
		expectedActiveSlide;
	for (var i = 0, closestSmallerOffset; i < this._pageSlidesArr.length; i++) {
		if (this._pageSlidesPageYOffsetArr[i] < nextSlideBounds
			&& (!closestSmallerOffset || this._pageSlidesPageYOffsetArr[i] > closestSmallerOffset)
		   ) {
			closestSmallerOffset = this._pageSlidesPageYOffsetArr[i];
			expectedActiveSlide = this._pageSlidesArr;
			expectedActiveSlideIndex = i;
		}
	}

	if (parseInt(document.body.dataset.activeSlide) !== expectedActiveSlideIndex) {
//		console.log(this.NAME + ': new Active Slide Found. Index = ' + expectedActiveSlideIndex);
		document.body.dataset.activeSlide = expectedActiveSlideIndex;
		this._expectedActiveSlide = expectedActiveSlideIndex;
		this._expectedActiveSlideIndex = expectedActiveSlide;
	}
};

PageSlideNumbering.prototype._setInit = function() {
//	console.log(this.NAME + ': Active!');
	this._initialized = true;

//	for (var i = 0; i < this._pageSlidesArr.length; i++) {
//		this._pageSlidesArr[i].classList.add('slide_init');
//	}
};

PageSlideNumbering.prototype._cancelInit = function() {
//	console.log(this.NAME + ': Cancel!');
	this._initialized = false;

//	for (var i = 0; i < this._pageSlidesArr.length; i++) {
//		this._pageSlidesArr[i].classList.remove('slide_init');
//	}
};

try {
	module.exports = PageSlideNumbering;
} catch (err) {
	console.warn(err);
}
