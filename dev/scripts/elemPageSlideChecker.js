"use strict";

try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function elemPageSlideChecker(options) {
	options.name = options.name || 'elemPageSlideChecker';
	Helper.call(this, options);

	this._elem = options.elem;
	this._pageScrollerElem = options.pageScrollerElem;

	this._init();
}

elemPageSlideChecker.prototype = Object.create(Helper.prototype);
elemPageSlideChecker.prototype.constructor = elemPageSlideChecker;

elemPageSlideChecker.prototype._init = function() {
	this._initWithParts();

	this._loop();
};

elemPageSlideChecker.prototype._initWithParts = function() {
	this._pageSlidesArr = [];
	var pageSlideArr = this._pageScrollerElem.querySelectorAll('.page_slide');
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

elemPageSlideChecker.prototype._loop = function() {
	if (this._checkScreenWidth() !== 'lg') {
		if (!this._initialized) {
			this._setInit();
		}

		var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

		this._recalculateSlidesPageYOffset(scrollTop);
		this._findCurrentActiveSlide(scrollTop);

	} else if (this._initialized) {
		this._cancelInit();
		this._elem.removeAttribute('data-over-slide');

	}

	this._requestId = requestAnimationFrame(this._loop.bind(this));
};

elemPageSlideChecker.prototype._recalculateSlidesPageYOffset = function(scrollTop) {
	for (var i = 0; i < this._pageSlidesArr.length; i++) {
		this._pageSlidesPageYOffsetArr[i] = this._pageSlidesArr[i].getBoundingClientRect().top + scrollTop;
	}
};

elemPageSlideChecker.prototype._findCurrentActiveSlide = function(scrollTop) {
//	var nextSlideBounds = window.innerHeight / 2 + scrollTop;
//	var nextSlideBounds = window.innerHeight - 54 + scrollTop;

	var elemCenterY = this._elem.getBoundingClientRect().top + this._elem.offsetHeight / 2 + scrollTop;

	var expectedActiveSlideIndex,
		expectedActiveSlide;
	for (var i = 0, closestSmallerOffset; i < this._pageSlidesArr.length; i++) {
		if (this._pageSlidesPageYOffsetArr[i] < elemCenterY
			&& (!closestSmallerOffset || this._pageSlidesPageYOffsetArr[i] > closestSmallerOffset)
		   ) {
			closestSmallerOffset = this._pageSlidesPageYOffsetArr[i];
			expectedActiveSlide = this._pageSlidesArr;
			expectedActiveSlideIndex = i;
		}
	}

	if (parseInt(this._elem.dataset.overSlide) !== expectedActiveSlideIndex) {
//		console.log(this.NAME + ': new Active Slide Found. Index = ' + expectedActiveSlideIndex);
		this._elem.dataset.overSlide = expectedActiveSlideIndex;
		this._expectedActiveSlide = expectedActiveSlideIndex;
		this._expectedActiveSlideIndex = expectedActiveSlide;
	}
};

elemPageSlideChecker.prototype._setInit = function() {
//	console.log(this.NAME + ': Active!');
	this._initialized = true;

//	for (var i = 0; i < this._pageSlidesArr.length; i++) {
//		this._pageSlidesArr[i].classList.add('slide_init');
//	}
};

elemPageSlideChecker.prototype._cancelInit = function() {
//	console.log(this.NAME + ': Cancel!');
	this._initialized = false;

//	for (var i = 0; i < this._pageSlidesArr.length; i++) {
//		this._pageSlidesArr[i].classList.remove('slide_init');
//	}
};

try {
	module.exports = elemPageSlideChecker;
} catch (err) {
	console.warn(err);
}
