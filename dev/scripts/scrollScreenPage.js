"use strict";

/**
 * Class ScrollScreenPage
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	animation.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that contains page slide container (.page_slide_container) with page slides (.page_slide)
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. animationDuration (required) - animation duration of slide change
 *		1.4. pageSlideHeightString (optional) - js code string, if set then it will be evaluated with eval() for calculating height of page slides (must return positive number)
 *		1.5. widthCancelModesArr (required) - array of screen width modes ('xs', 'sm', 'md', 'lg') during which ScrollScreenPage instance will be inactive
 *		1.6. widthActiveModesArr (required) - array of screen width modes ('xs', 'sm', 'md', 'lg') during which ScrollScreenPage instance will be active
 *		1.7. slidePartsBreakpoint (required) - screen width breakpoint (px) before which page slides (.page_slide) will be also split into page slide parts (.page_slide_part) if needed and before which page slides (.page_slide) won't be splitted
 *		1.8... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function ScrollScreenPage(options) {
	options.name = options.name || 'ScrollScreenPage';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;
	this._animationDuration = options.animationDuration || 300;
	this._pageSlideHeightString = options.pageSlideHeightString;
	this._widthCancelModesArr = options.widthCancelModesArr;
	this._widthActiveModesArr = options.widthActiveModesArr;
	this._slidePartsBreakpoint = options.slidePartsBreakpoint || 1200;

	// bind class instance as "this" for event listener functions
	this._onMouseWheel = this._onMouseWheel.bind(this);
	this._onMouseMove = this._onMouseMove.bind(this);
	this._onResize = this._onResize.bind(this);
	this._onClick = this._onClick.bind(this);
	this._preventArrowsScroll = this._preventArrowsScroll.bind(this);
	this._onTouchStart = this._onTouchStart.bind(this);
	this._onTouchMove = this._onTouchMove.bind(this);
	this._onTouchEnd = this._onTouchEnd.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
ScrollScreenPage.prototype = Object.create(Helper.prototype);
ScrollScreenPage.prototype.constructor = ScrollScreenPage;

// Main initialisation function
ScrollScreenPage.prototype._init = function() {
	// start listening to resize event
	this._addListener(window, 'resize', this._onResize);

	// if current screen width mode is in _widthCancelModesArr then do nothing
	if (this._widthCancelModesArr.indexOf(this._checkScreenWidth()) !== -1) { return; }

	document.scrollTop = 0;
	document.body.scrollTop = 0;

	this._initialized = true;
	this._noPageScrollArea = false;
	this._onFirstSlideIntr = false;

	this._pageSlidesContainer = this._elem.querySelector('.page_slide_container');

	// check for page slide parts breakpoint and initialise page slides
	if (window.innerWidth >= this._slidePartsBreakpoint) {
		this._initWithoutParts();
	} else {
		this._initWithParts();
	}

	// set initial active slide as 0
	this._activeSlideIndex = 0;
	document.body.dataset.activeSlide = 0;

	// calculate and set positions for all page slides
	this._calculateNewTop();
	this._setInitSlidesStyles();

	// send signal that active slide have been set
	this._sendCustomEvent(this._elem, 'pageSlideChanged', {
		bubbles: true,
		detail: {
			activeSlideIndex: this._activeSlideIndex,
			activeSlideID: this._pageSlidesArr[this._activeSlideIndex].id,
			activeSlideElem: this._findParentSlideElem()
		}
	});

	// start listening for user user input to change slide
	this._addListener(window, 'wheel', this._onMouseWheel);
	this._addListener(document, 'touchstart', this._onTouchStart);
	this._addListener(document, 'mousemove', this._onMouseMove);
	this._addListener(document, 'click', this._onClick);
	// prevent scroll with arrows in FF
	this._addListener(window, 'scroll', this._preventArrowsScroll);
};

// Prevents scroll with arrows if FF
ScrollScreenPage.prototype._preventArrowsScroll = function() {
	document.scrollTop = 0;
	document.body.scrollTop = 0;
};

// Prevents ScrollScreenPage instance from scrolling page slides and removes styles set by it
ScrollScreenPage.prototype._cancelScrollScreenPage = function() {
	// reset page slides' styles
	this._resetInit();

	// set ScrollScreenPage instance inactive
	this._initialized = false;
	this._noPageScrollArea = false;

	// stop listening to user input
	this._removeListener(window, 'wheel', this._onMouseWheel);
	this._removeListener(document, 'mousemove', this._onMouseMove);
	this._removeListener(document, 'touchstart', this._onTouchStart);
	this._removeListener(document, 'click', this._onClick);
	this._removeListener(window, 'scroll', this._preventArrowsScroll);
};

// Initialises ScrollScreenPage instance without counting page slide parts
ScrollScreenPage.prototype._initWithoutParts = function() {
	this._pageSlidesArr = Array.prototype.slice.call(this._elem.querySelectorAll('.page_slide'));
	this._slideCount = this._pageSlidesArr.length;
	this._slideParts = false;

	for (var i = 0; i < this._slideCount; i++) {
		this._pageSlidesArr[i].classList.add('slide_init');
	}
};

// Initialises ScrollScreenPage instance without counting page slide parts
ScrollScreenPage.prototype._initWithParts = function() {
	this._pageSlidesArr = [];
	var pageSlideArr = this._elem.querySelectorAll('.page_slide');
	var pageSlidePartArr;

	for (var i = 0; i < pageSlideArr.length; i++) {
		pageSlidePartArr = pageSlideArr[i].querySelectorAll('.page_slide_part');

		if (pageSlidePartArr.length > 0) {
			// if page slide contains page slide parts add them to _pageSlidesArr instead of it
			// Array.prototype.slice.call is to transform array-like collection to array
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

// Set initial styles for found page slides
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

// Removes styles set by ScrollScreenPage instance from page slides
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

// Invoked by mousemove event
// Arguments:
// 	1. e (required) - event object
ScrollScreenPage.prototype._onMouseMove = function(e) {
	var target = e.target;
	if (!target || !target.closest) return;

	// if event target has [data-no-page-scroll-area="true"] attribute then prevent change of page slide
	var noPageScrollArea = target.closest('[data-no-page-scroll-area="true"]');
	if (noPageScrollArea && !this._noPageScrollArea) {
		this._noPageScrollArea = true;
	} else if (!noPageScrollArea && this._noPageScrollArea) {
		this._noPageScrollArea = false;
	}
};

// Invoked by mousewheel event
// Arguments:
// 	1. e (required) - event object
ScrollScreenPage.prototype._onMouseWheel = function(e) {
	if (!e.deltaY || this._scrollInProcess) return;

	if (this._noPageScrollArea || this._firstSlideIntro) return;

	// change page slide if needed
	if (e.deltaY > 0) {
		this._scrollPageDown();

	} else if (e.deltaY < 0) {
		this._scrollPageUp();

	}
};

// Invoked by touchstart event
// Arguments:
// 	1. e (required) - event object
ScrollScreenPage.prototype._onTouchStart = function(e) {
	// prepare for dragging page slide
	this._startDrag(e);
};

// Invoked by touchmove event
// Arguments:
// 	1. e (required) - event object
ScrollScreenPage.prototype._onTouchMove = function(e) {
	// change page slide
	this._onTouchMoveDrag(e);
};

// Invoked by touchend event
// Arguments:
// 	1. e (required) - event object
ScrollScreenPage.prototype._onTouchEnd = function(e) {
	// stop dragging page slide
	this._onTouchEndDrag(e);
};

// Prepares for dragging page slide
// Arguments:
// 	1. e (required) - event object from touchstart event
ScrollScreenPage.prototype._startDrag = function(e) {
	var target = e.target;
	if (!target || !target.closest || this._firstSlideIntro) return;

	// event target has [data-no-page-scroll-area="true"] attribute then do nothing
	var noPageScrollArea = target.closest('[data-no-page-scroll-area="true"]');
	if (noPageScrollArea) { return }

	// stop listening for new touches
	this._removeListener(document, 'touchstart', this._onTouchStart);

	// remember starting touch y coordinate
	var clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;
	this._prevCursorYPosition = clientY + (window.pageYOffset || document.documentElement.scrollTop);
	this._totalLength = 0;

	this._addListener(document, 'touchmove', this._onTouchMove);
	this._addListener(document, 'touchend', this._onTouchEnd);
};

// Changes page slide
// Arguments:
// 	1. e (required) - event object from touchmove event
ScrollScreenPage.prototype._onTouchMoveDrag = function(e) {
	// get current touch y position
	var clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;
	var currentcursorYPosition = clientY + (window.pageYOffset || document.documentElement.scrollTop);
	var yPositionDeleta = currentcursorYPosition - this._prevCursorYPosition;

	// calculate direction of move
	if ((this._totalLength > 0 && yPositionDeleta < 0) ||
	   (this._totalLength < 0 && yPositionDeleta > 0)) {
		this._totalLength = yPositionDeleta;
	} else {
		this._totalLength += yPositionDeleta;
	}

	// if user moved touch farther them 50 px in current direction then change slide
	if (!this._scrollInProcess && Math.abs(this._totalLength) > 50) {
		if (yPositionDeleta > 0) {
			// if direction of move is up then change page slide to previous
			this._scrollPageUp();

		} else if (yPositionDeleta < 0) {
			// if direction of move is down then change page slide to next
			this._scrollPageDown();

		}

		this._totalLength = 0;
	}

	this._prevCursorYPosition = currentcursorYPosition;
};

// Stops page slide dragging
// Arguments:
// 	1. e (required) - event object from touchend event
ScrollScreenPage.prototype._onTouchEndDrag = function(e) {
	// stop listening to current touch
	this._removeListener(document, 'touchmove', this._onTouchMove);
	this._removeListener(document, 'touchend', this._onTouchEnd);

	// start listening for new touch
	this._addListener(document, 'touchstart', this._onTouchStart);
};

// Invoked by click event
// Arguments:
// 	1. e (required) - event object
ScrollScreenPage.prototype._onClick = function(e) {
	var target = e.target;

	this._scrollToTargetSlide(target);
};

// Changes page slide if target has [data-slide] attribute
// Arguments:
// 	1. target (required) - target from click event object
ScrollScreenPage.prototype._scrollToTargetSlide = function(target) {
	var slideAnchor = target.closest('[data-slide]');
	if (!slideAnchor || this._scrollInProcess) return;

	var targetSlideId = slideAnchor.dataset.slide;
	if (!targetSlideId) return;

	var targetSlideElem = this._elem.querySelector('#' + targetSlideId);
	if (!targetSlideElem) return;

	// if there is a page slide on the page which index matches [data-slide] attribute from target then make it active
	var targetSlideIndex = this._pageSlidesArr.indexOf(targetSlideElem);
	if (targetSlideIndex === -1) {
		var targetSlideFirstPartElem = targetSlideElem.querySelector('#' + targetSlideId + '_part_1');
		if (!targetSlideFirstPartElem) return;

		targetSlideIndex = this._pageSlidesArr.indexOf(targetSlideFirstPartElem);
		if (targetSlideIndex === -1) return;
	}

	// if page slide has not been changed then do nothing
	if (targetSlideIndex === this._activeSlideIndex) return;

	this._lastActiveSlideIndex = this._activeSlideIndex;
	this._activeSlideIndex = targetSlideIndex;

	// scroll to new active page slide
	this._scrollPage();
};

// Invoked by resize event on window
ScrollScreenPage.prototype._onResize = function() {
	if (this._widthCancelModesArr.indexOf(this._checkScreenWidth()) !== -1  && this._initialized) {
		// if page slides are initialised and current screen mode is in _widthCancelModesArr then cancel page slides
		this._cancelScrollScreenPage();

	} else if (this._widthActiveModesArr.indexOf(this._checkScreenWidth()) !== -1 && !this._initialized)  {
		// else if page slides are not initialised and current screen mode is in _widthActiveModesArr then initialise page slides
		this._init();

	} else if (this._initialized) {
		// else if page slides are initialised and no ned to cancel them then check for page side parts breakpoint and recalculate page slides' height
		this._checkForBreakpoint();
		this._adpatSlideHeightPosition();

	}
};

// Recalculates height of all initilised page slides
ScrollScreenPage.prototype._adpatSlideHeightPosition = function() {
	// calculate height for all initilised page slides
	var newHeight = this._pageSlideHeightString ? eval(this._pageSlideHeightString) : window.innerHeight;
	this._pageSlidesContainer.style.height = newHeight + 'px';

	// calculate new top coordinates for all initilised page slides
	this._calculateNewTop();

	// set new top and height
	for (var i = 0; i < this._slideCount; i++) {
		this._pageSlidesArr[i].style.height = newHeight + 'px';

		this._pageSlidesArr[i].style.top = this._endSlideTopPositionArr[i] + 'px';
	}
}

// Checks for page slide parts breakpoint
ScrollScreenPage.prototype._checkForBreakpoint = function() {
	var oldActiveSlide,
		newActiveSlide;

	if (window.innerWidth >= this._slidePartsBreakpoint && this._slideParts) {
		// if window width is higher then page slide parts breakpoint and ScrollScreenPage instance is initialised with page slide parts then reinitilaise it without page slide parts
		// reset page slide styles
		this._resetInit();
		// get last active page slide
		oldActiveSlide = this._pageSlidesArr[this._activeSlideIndex];
		// initialise without parts
		this._initWithoutParts();
		// get new active page slide
		newActiveSlide = this._pageSlidesArr[this._activeSlideIndex];
		// try to preserve last active slide
		this._saveActiveSlide(oldActiveSlide, newActiveSlide);
		// set page slide styles
		this._setInitSlidesStyles();
		document.body.dataset.activeSlide = this._activeSlideIndex;

	} else if (window.innerWidth < this._slidePartsBreakpoint && !this._slideParts) {
		// if window width is lower then page slide parts breakpoint and ScrollScreenPage instance is initialised without page slide parts then reinitilaise it with page slide parts
		// reset page slide styles
		this._resetInit();
		// get last active page slide
		oldActiveSlide = this._pageSlidesArr[this._activeSlideIndex];
		// initialise with parts
		this._initWithParts();
		// get new active page slide
		newActiveSlide = this._pageSlidesArr[this._activeSlideIndex];
		// try to preserve last active slide
		this._saveActiveSlide(oldActiveSlide, newActiveSlide);
		// set page slide styles
		this._setInitSlidesStyles();
		document.body.dataset.activeSlide = this._activeSlideIndex;

	}
};

// Searches for last active page slide in array of current page sldies and sets it as active
// Arguments:
// 	1. oldActiveSlide (required) - old active page slide element
// 	2. newActiveSlide (required) - new active page slide element
ScrollScreenPage.prototype._saveActiveSlide = function(oldActiveSlide, newActiveSlide) {
	var newIndex = -1,
		slideParts,
		parentSlide;

	// if old and new active page slides are the same element then set it as active
	if (oldActiveSlide === newActiveSlide) {
		newIndex = this._activeSlideIndex;
	}

	// if old and new active page slides are not the same element then loop throgh page slides array to look for old acive slide
	for (var i = 0; i < this._slideCount && newIndex === -1; i++) {
		// if old active slide is found then set it as active
		if (oldActiveSlide === this._pageSlidesArr[i]) {
			newIndex = i;
			continue;
		}

		// if page slide from array has page slide parts then loop through them to look for old acive slide
		slideParts = this._pageSlidesArr[i].querySelectorAll('.page_slide_part');
		for (var j = 0; j < slideParts.length && newIndex === -1; j++) {
			// if old active slide is found among page slide parts of page slide from array then set it as active
			if (oldActiveSlide === slideParts[j]) {
				newIndex = i;
			}
		}
		if (newIndex !== -1) continue;

		// if page slide from array is page slide part of another not initialised page slide then check if this initialised page slide is old active slide
		parentSlide = this._pageSlidesArr[i].parentElement.closest('.page_slide');
		if (parentSlide && oldActiveSlide === parentSlide) {
			newIndex = Array.prototype.indexOf.call(this._elem.querySelectorAll('.page_slide'), parentSlide);
		}
	}

	// set new active slide index if found
	if (newIndex === -1) {
		console.log(this.NAME + ': Old Active Slide is not found!');
	} else {
		this._activeSlideIndex = newIndex;
	}
};

// Scrolls page slides to current active page slide
ScrollScreenPage.prototype._scrollPage = function() {
	// set to true to prevent change slide while animation in progress
	this._scrollInProcess = true;

	/* Костыль (-_-) BEGIN */
	// if active page slide is #course_start_date then delay scroll animation (for sectionStartDateBgController.js)
	if (!this._setDelay && this._pageSlidesArr[this._lastActiveSlideIndex].matches('#course_start_date')) {
		// set to true so nex time _scrollPage is called animation won't be delayed again
		this._setDelay = true;
		// plan new call to _scrollPage
		setTimeout(this._scrollPage.bind(this), 500);

		// send signal that page slide is supposted to be changing now
		this._sendCustomEvent(this._elem, 'pageSlideChanged', {
			bubbles: true,
			detail: {
				activeSlideIndex: this._activeSlideIndex,
				activeSlideID: this._pageSlidesArr[this._activeSlideIndex].id,
				activeSlideElem: this._findParentSlideElem(),
				lastActiveSlideIndex: this._lastActiveSlideIndex
			}
		});
		return;
	} else if (this._setDelay) {
		delete this._setDelay;
	}
	/* Костыль (-_-) END */

	document.body.dataset.activeSlide = this._activeSlideIndex;

	this._currentSlideTopPositionArr = [];

	// move all page slides to positions for animation
	for (var i = 0; i < this._slideCount; i++) {
		this._currentSlideTopPositionArr[i] = this._pageSlidesArr[i].offsetTop;

		if ( i == this._lastActiveSlideIndex ) {
			// prepare last active slide to move out of the window
			this._pageSlidesArr[i].style.opacity = 1;
			this._pageSlidesArr[i].style.marginTop = -1 * this._pageSlidesArr[i].scrollTop + 'px';
			this._pageSlidesArr[i].style.overflow = 'visible';
		} else if ( i == this._activeSlideIndex ) {
			// prepare new active slide to move into the window
			this._pageSlidesArr[i].style.opacity = 1;
			this._pageSlidesArr[i].scrollTop = 0;
			this._pageSlidesArr[i].style.overflow = 'visible';
		} else {
			// hide all other page slides
			this._pageSlidesArr[i].style.opacity = 0;
		}
	}

	// recalculate top coordinates for all slides
	this._calculateNewTop();

	// if animation is in progress then stop it
	if (this._currentAnimation) {
		this._currentAnimation.stop();
	}

	// create new animation to change active page slide
	this._currentAnimation = new Animation(
		this._scrollPageDraw.bind(this),
		this._animationDuration,
		function() {
			// set to false to allow change page slides again
			this._scrollInProcess = false;

			delete this._currentAnimation;
			this._pageSlidesArr[this._activeSlideIndex].style.overflow = '';
			this._pageSlidesArr[this._lastActiveSlideIndex].style.marginTop = '';
			this._pageSlidesArr[this._lastActiveSlideIndex].style.opacity = 0;
			this._pageSlidesArr[this._lastActiveSlideIndex].style.overflow = '';

			// send signal that page slide animation is over
			this._sendCustomEvent(this._elem, 'pageSlideChangedAnimationEnd', {
				bubbles: true,
				detail: {
					activeSlideIndex: this._activeSlideIndex,
					activeSlideID: this._pageSlidesArr[this._activeSlideIndex].id,
					activeSlideElem: this._findParentSlideElem()
				}
			});
		}.bind(this)
	);

	// send signal that page slide is changing now
	this._sendCustomEvent(this._elem, 'pageSlideChanged', {
		bubbles: true,
		detail: {
			activeSlideIndex: this._activeSlideIndex,
			activeSlideID: this._pageSlidesArr[this._activeSlideIndex].id,
			activeSlideElem: this._findParentSlideElem(),
			lastActiveSlideIndex: this._lastActiveSlideIndex
		}
	});
};

// Returns closest .page_slide elem of currenc active slide
ScrollScreenPage.prototype._findParentSlideElem = function() {
	return this._pageSlidesArr[this._activeSlideIndex].closest('.page_slide');
};

// Scrolls to next page slide if possible
ScrollScreenPage.prototype._scrollPageDown = function() {
	// if current page slide is last then do nothing
	if (this._activeSlideIndex === this._slideCount - 1) return;

	this._lastActiveSlideIndex = this._activeSlideIndex;
	this._activeSlideIndex++;

	this._scrollPage();
};

// Scrolls to previous page slide if possible
ScrollScreenPage.prototype._scrollPageUp = function() {
	// if current page slide is first then do nothing
	if (this._activeSlideIndex === 0) return;

	this._lastActiveSlideIndex = this._activeSlideIndex;
	this._activeSlideIndex--;

	this._scrollPage();
};

// Calculates top coordinates for all initialised page slides
ScrollScreenPage.prototype._calculateNewTop = function() {
	this._endSlideTopPositionArr = [];
	var top,
		height,
		pageSlideContent;

	for (var i = 0; i < this._slideCount; i++) {
		// find content elem of page slide
		pageSlideContent = this._pageSlidesArr[i].querySelector('.page_slide_content');
		pageSlideContent = pageSlideContent ? pageSlideContent : this._pageSlidesArr[i].querySelector('.page_slide_part_content');
		// new top will be window height or content height (whichever is bigger)
		height = pageSlideContent.offsetHeight;
		top = height > window.innerHeight ? height : window.innerHeight;

		if (i == this._activeSlideIndex) {
			// if page slide is active then it's top = 0
			this._endSlideTopPositionArr[i] = 0;

		} else if (i < this._activeSlideIndex) {
			// if page slide is positioned before active slide then it will be hidden over the top border of the window
			this._endSlideTopPositionArr[i] = -1 * top;

		} else if (i > this._activeSlideIndex) {
			// if page slide is positioned after active slide then it will be hidden under the bottom border of the window
			this._endSlideTopPositionArr[i] = top;

		}
	}
};

// Draw function for Aniamtion that animates change of active slide
// Arguments:
// 	1. timePassed (required) - time (in miliseconds) since animation has started
ScrollScreenPage.prototype._scrollPageDraw = function(timePassed) {
	// calculate timing function value for current miment of animation
	var timeMultiplier = Animation.quadEaseInOut(this._animationDuration, timePassed),
		newTop;

	// calculate top for current moment for each slide and set it
	for (var i = 0; i < this._slideCount; i++) {
		newTop = this._currentSlideTopPositionArr[i] + (this._endSlideTopPositionArr[i] - this._currentSlideTopPositionArr[i]) * timeMultiplier;
		this._pageSlidesArr[i].style.top = newTop + 'px';
	}
};

// Try exporting class via webpack
try {
	module.exports = ScrollScreenPage;
} catch (err) {
	console.warn(err);
}
