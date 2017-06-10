"use strict";

var Helper = require('./helper');
var Animation = require('./animation');

function ScrollScreenPage(options) {
	options.name = options.name || 'ScrollScreenPage';
	Helper.call(this, options);

	this._elem = options.elem;
	this._animationDuration = options.animationDuration || 300;
	this._pageSlideHeightString = options.pageSlideHeightString;
	this._slidePartsBreakpoint = options.slidePartsBreakpoint || 1200;

	this._onMouseWheel = this._onMouseWheel.bind(this);
	this._onResize = this._onResize.bind(this);
	this._onClick = this._onClick.bind(this);
	this._preventArrowsScroll = this._preventArrowsScroll.bind(this);

	this._init();
}

ScrollScreenPage.prototype = Object.create(Helper.prototype);
ScrollScreenPage.prototype.constructor = ScrollScreenPage;

ScrollScreenPage.prototype._init = function() {
	this._addListener(window, 'resize', this._onResize);

	if (this._checkScreenWidth() === 'xs' || this._checkScreenWidth() === 'sm'  || this._checkScreenWidth() === 'md') { return; }

	document.scrollTop = 0;
	document.body.scrollTop = 0;

	this._initialized = true;

	this._pageSlidesContainer = this._elem.querySelector('.page_slide_container');

	if (window.innerWidth >= this._slidePartsBreakpoint) {
		this._initWithoutParts();
	} else {
		this._initWithParts();
	}

	this._activeSlideIndex = 0;
	document.body.dataset.activeSlide = 0;

	this._calculateNewTop();
	this._setInitSlidesStyles();

	this._sendCustomEvent(this._elem, 'pageSlideChanged', {
		bubbles: true,
		detail: {
			activeSlideIndex: this._activeSlideIndex,
			activeSlideID: this._pageSlidesArr[this._activeSlideIndex].id,
			activeSlideElem: this._findParentSlideElem()
		}
	});

	this._addListener(window, 'wheel', this._onMouseWheel);
	this._addListener(document, 'click', this._onClick);
	/*Preventing scroll with arrows in FF*/
	this._addListener(window, 'scroll', this._preventArrowsScroll);
};

ScrollScreenPage.prototype._preventArrowsScroll = function() {
	document.scrollTop = 0;
	document.body.scrollTop = 0;
};

ScrollScreenPage.prototype._cancelScrollScreenPage = function() {
	this._resetInit();

	this._initialized = false;

	this._removeListener(window, 'wheel', this._onMouseWheel);
//	this._removeListener(window, 'resize', this._onResize);
	this._removeListener(document, 'click', this._onClick);
	this._removeListener(window, 'scroll', this._preventArrowsScroll);
};

ScrollScreenPage.prototype._initWithoutParts = function() {
	this._pageSlidesArr = Array.prototype.slice.call(this._elem.querySelectorAll('.page_slide'));
	this._slideCount = this._pageSlidesArr.length;
	this._slideParts = false;

	for (var i = 0; i < this._slideCount; i++) {
		this._pageSlidesArr[i].classList.add('slide_init');
	}
};

ScrollScreenPage.prototype._initWithParts = function() {
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

	this._slideCount = this._pageSlidesArr.length;
	this._slideParts = true;

	for (var i = 0; i < this._slideCount; i++) {
		this._pageSlidesArr[i].classList.add('slide_init');
	}
};

ScrollScreenPage.prototype._setInitSlidesStyles = function() {
	var newHeight = this._pageSlideHeightString ? eval(this._pageSlideHeightString) : window.innerHeight;
	this._pageSlidesContainer.style.height = newHeight + 'px';

	for (var i = 0; i < this._slideCount; i++) {
		this._pageSlidesArr[i].style.height = newHeight + 'px';
		this._pageSlidesArr[i].style.position = 'absolute';
		this._pageSlidesArr[i].style.left = '0px';
		this._pageSlidesArr[i].style.top = this._endSlideTopPositionArr[i] + 'px';
	}
};

ScrollScreenPage.prototype._resetInit = function() {
	this._pageSlidesContainer.style.height = '';

	for (var i = 0; i < this._slideCount; i++) {
		this._pageSlidesArr[i].style.height = '';
		this._pageSlidesArr[i].style.position = '';
		this._pageSlidesArr[i].style.left = '';
		this._pageSlidesArr[i].style.top = '';
		this._pageSlidesArr[i].style.opacity = '';
		this._pageSlidesArr[i].style.overflow = '';
		this._pageSlidesArr[i].style.marginTop = '';
		this._pageSlidesArr[i].classList.remove('slide_init');
	}
};

ScrollScreenPage.prototype._onMouseWheel = function(e) {
	if (!e.deltaY || this._scrollInProcess) return;

	if (e.deltaY > 0) {
		this._scrollPageDown();

	} else if (e.deltaY < 0) {
		this._scrollPageUp();

	}
};

ScrollScreenPage.prototype._onClick = function(e) {
	var target = e.target;

	this._scrollToTargetSlide(target);
};

ScrollScreenPage.prototype._scrollToTargetSlide = function(target) {
	var slideAnchor = target.closest('[data-slide]');
	if (!slideAnchor || this._scrollInProcess) return;

//	var targetSlideIndex = slideAnchor.dataset.slide;
//	if (!targetSlideIndex || targetSlideIndex === this._activeSlideIndex) return;

	var targetSlideId = slideAnchor.dataset.slide;
	if (!targetSlideId) return;

	var targetSlideElem = this._elem.querySelector('#' + targetSlideId);
	if (!targetSlideElem) return;

	var targetSlideIndex = this._pageSlidesArr.indexOf(targetSlideElem);
	if (targetSlideIndex === -1) {
		var targetSlideFirstPartElem = targetSlideElem.querySelector('#' + targetSlideId + '_part_1');
		if (!targetSlideFirstPartElem) return;

		targetSlideIndex = this._pageSlidesArr.indexOf(targetSlideFirstPartElem);
		if (targetSlideIndex === -1) return;
	}

//	if (!this._pageSlidesArr[targetSlideIndex]) return;

	if (targetSlideIndex === this._activeSlideIndex) return;

	this._lastActiveSlideIndex = this._activeSlideIndex;
	this._activeSlideIndex = targetSlideIndex;

	this._scrollPage();
};

ScrollScreenPage.prototype._onResize = function() {
	if ((this._checkScreenWidth() === 'xs' || this._checkScreenWidth() === 'sm'  || this._checkScreenWidth() === 'md')  && this._initialized) {
		this._cancelScrollScreenPage();

	} else if ((this._checkScreenWidth() === 'lg') && !this._initialized)  {
		this._init();

	} else if (this._initialized) {
		this._checkForBreakpoint();
		this._adpatSlideHeightPosition();

	}
};

ScrollScreenPage.prototype._adpatSlideHeightPosition = function() {
	var newHeight = this._pageSlideHeightString ? eval(this._pageSlideHeightString) : window.innerHeight;
	this._pageSlidesContainer.style.height = newHeight + 'px';

	this._calculateNewTop();

	for (var i = 0; i < this._slideCount; i++) {
		this._pageSlidesArr[i].style.height = newHeight + 'px';

		this._pageSlidesArr[i].style.top = this._endSlideTopPositionArr[i] + 'px';
	}
}

ScrollScreenPage.prototype._checkForBreakpoint = function() {
	var oldActiveSlide,
		newActiveSlide;

	if (window.innerWidth >= this._slidePartsBreakpoint && this._slideParts) {
		this._resetInit();
		oldActiveSlide = this._pageSlidesArr[this._activeSlideIndex];
		this._initWithoutParts();
		newActiveSlide = this._pageSlidesArr[this._activeSlideIndex];
		this._saveActiveSlide(oldActiveSlide, newActiveSlide);
		this._setInitSlidesStyles();
		document.body.dataset.activeSlide = this._activeSlideIndex;

	} else if (window.innerWidth < this._slidePartsBreakpoint && !this._slideParts) {
		this._resetInit();
		oldActiveSlide = this._pageSlidesArr[this._activeSlideIndex];
		this._initWithParts();
		newActiveSlide = this._pageSlidesArr[this._activeSlideIndex];
		this._saveActiveSlide(oldActiveSlide, newActiveSlide);
		this._setInitSlidesStyles();
		document.body.dataset.activeSlide = this._activeSlideIndex;

	}
};

ScrollScreenPage.prototype._saveActiveSlide = function(oldActiveSlide, newActiveSlide) {
	var newIndex = -1,
		slideParts,
		parentSlide;

	if (oldActiveSlide === newActiveSlide) {
		newIndex = this._activeSlideIndex;
	}

	for (var i = 0; i < this._slideCount && newIndex === -1; i++) {
		if (oldActiveSlide === this._pageSlidesArr[i]) {
			newIndex = i;
			continue;
		}

		slideParts = this._pageSlidesArr[i].querySelectorAll('.page_slide_part');
		for (var j = 0; j < slideParts.length && newIndex === -1; j++) {
			if (oldActiveSlide === slideParts[j]) {
				newIndex = i;
			}
		}
		if (newIndex !== -1) continue;

		parentSlide = this._pageSlidesArr[i].parentElement.closest('.page_slide');
		if (parentSlide && oldActiveSlide === parentSlide) {
			newIndex = Array.prototype.indexOf.call(this._elem.querySelectorAll('.page_slide'), parentSlide);
		}
	}

	if (newIndex === -1) {
		console.log(this.NAME + ': Old Active Slide is not found!');
	} else {
		this._activeSlideIndex = newIndex;
	}
};

ScrollScreenPage.prototype._scrollPage = function() {
	document.body.dataset.activeSlide = this._activeSlideIndex;

	this._scrollInProcess = true;

	this._currentSlideTopPositionArr = [];

	for (var i = 0; i < this._slideCount; i++) {
		this._currentSlideTopPositionArr[i] = this._pageSlidesArr[i].offsetTop;

		if ( i == this._lastActiveSlideIndex ) {
			this._pageSlidesArr[i].style.opacity = 1;
			this._pageSlidesArr[i].style.marginTop = -1 * this._pageSlidesArr[i].scrollTop + 'px';
			this._pageSlidesArr[i].style.overflow = 'visible';
		} else if ( i == this._activeSlideIndex ) {
			this._pageSlidesArr[i].style.opacity = 1;
			this._pageSlidesArr[i].scrollTop = 0;
			this._pageSlidesArr[i].style.overflow = 'visible';
		} else {
			this._pageSlidesArr[i].style.opacity = 0;
		}
	}

	this._calculateNewTop();

	if (this._currentAnimation) {
		this._currentAnimation.stop();
	}

	this._currentAnimation = new Animation(
		this._scrollPageDraw.bind(this),
		this._animationDuration,
		function() {
			this._scrollInProcess = false;
			delete this._currentAnimation;
			this._pageSlidesArr[this._activeSlideIndex].style.overflow = '';
			this._pageSlidesArr[this._lastActiveSlideIndex].style.marginTop = '';
			this._pageSlidesArr[this._lastActiveSlideIndex].style.opacity = 0;
			this._pageSlidesArr[this._lastActiveSlideIndex].style.overflow = '';
		}.bind(this)
	);

	this._sendCustomEvent(this._elem, 'pageSlideChanged', {
		bubbles: true,
		detail: {
			activeSlideIndex: this._activeSlideIndex,
			activeSlideID: this._pageSlidesArr[this._activeSlideIndex].id,
			activeSlideElem: this._findParentSlideElem()
		}
	});
};

ScrollScreenPage.prototype._findParentSlideElem = function() {
	return this._pageSlidesArr[this._activeSlideIndex].closest('.page_slide');
};

ScrollScreenPage.prototype._scrollPageDown = function() {
	if (this._activeSlideIndex === this._slideCount - 1) return;

	this._lastActiveSlideIndex = this._activeSlideIndex;
	this._activeSlideIndex++;

	this._scrollPage();
};

ScrollScreenPage.prototype._scrollPageUp = function() {
	if (this._activeSlideIndex === 0) return;

	this._lastActiveSlideIndex = this._activeSlideIndex;
	this._activeSlideIndex--;

	this._scrollPage();
};

ScrollScreenPage.prototype._calculateNewTop = function() {
	this._endSlideTopPositionArr = [];
	var top,
		height,
		pageSlideContent;

	for (var i = 0; i < this._slideCount; i++) {
		pageSlideContent = this._pageSlidesArr[i].querySelector('.page_slide_content');
		pageSlideContent = pageSlideContent ? pageSlideContent : this._pageSlidesArr[i].querySelector('.page_slide_part_content');
		height = pageSlideContent.offsetHeight;
		top = height > window.innerHeight ? height : window.innerHeight;

		if (i == this._activeSlideIndex) {
			this._endSlideTopPositionArr[i] = 0;

		} else if (i < this._activeSlideIndex) {
			this._endSlideTopPositionArr[i] = -1 * top;

		} else if (i > this._activeSlideIndex) {
			this._endSlideTopPositionArr[i] = top;

		}
	}
};

ScrollScreenPage.prototype._scrollPageDraw = function(timePassed) {
	var newTop;

	for (var i = 0; i < this._slideCount; i++) {
		newTop = ((this._endSlideTopPositionArr[i] - this._currentSlideTopPositionArr[i]) / this._animationDuration) * timePassed + this._currentSlideTopPositionArr[i];
		this._pageSlidesArr[i].style.top = newTop + 'px';
	}
};

module.exports = ScrollScreenPage;
