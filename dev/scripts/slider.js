"use strict";

/**
 * Class Slider
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that contains overflow container (.overflow_hidden_container) with slides container (.overflow_block)
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. delay (optional) - delay (in miliseconds) of automatic slide change (0 no automatic slide change)
 *		1.4. pauseOnHover (optional) - if set to true then slider stops automatic slide change when hovered
 *		1.5... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function Slider(options) {
	options.name = options.name || 'Slider';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;
	this._overflowContainer = this._elem.querySelector('.overflow_hidden_container');
	this._overflowBlock = this._overflowContainer.querySelector('.overflow_block');
	this._moveDelay = options.delay || 0;

	// bind class instance as "this" for event listener functions
	this._onClick = this._onClick.bind(this);
	this._onCornerTransitionEnd = this._onCornerTransitionEnd.bind(this);
	this._onMiddleTransitionEnd = this._onMiddleTransitionEnd.bind(this);
	this._onMouseOver = this._onMouseOver.bind(this);
	this._onMouseOut = this._onMouseOut.bind(this);
	this._onMouseDown = this._onMouseDown.bind(this);
	this._onMouseUp = this._onMouseUp.bind(this);
	this._onDragStart = this._onDragStart.bind(this);
	this._onMouseMoveDrag = this._onMouseMoveDrag.bind(this);

	// run main initialisation function
	this._initSlider();

	// start listening for controlls
	this._addListener(this._elem, 'click', this._onClick);
	if (options.pauseOnHover) {
		this._addListener(this._elem, 'mouseover', this._onMouseOver);
		this._addListener(this._elem, 'mouseout', this._onMouseOut);
	}
}

// Inherit prototype methods from Helper
Slider.prototype = Object.create(Helper.prototype);
Slider.prototype.constructor = Slider;

// Main initialisation function
Slider.prototype._initSlider = function() {
	// find all slides
	var slidesArr = this._overflowBlock.querySelectorAll('[data-component="slide"]');
	if (0 === slidesArr.length) return;

	this._slidesCount = slidesArr.length;
	// set active slide index = 1
	this._currSlide = 1;

	// add a copy of the first slide at the end and a copy of the last slide to at beggining of the slide container
	var firstSlide = slidesArr[0];
	var lastSlide = slidesArr[slidesArr.length - 1];
	this._overflowBlock.insertBefore(lastSlide.cloneNode(true), this._overflowBlock.firstChild);
	this._overflowBlock.appendChild(firstSlide.cloneNode(true));

	// find all slides again and remove selected class
	this._slidesArr = Array.prototype.slice.call(this._overflowBlock.querySelectorAll('[data-component="slide"]'));
	for (var i = 0; i < this._slidesArr.length; i++) {
		this._slidesArr[i].style.width = 100 / (this._slidesCount + 2) + '%';
		this._slidesArr[i].classList.remove('selected');
	}
	// set styles and active class for slide with index 1 to be active
	this._slidesArr[1].classList.add('selected');
	this._overflowBlock.style.width = 100 * (this._slidesCount + 2) + '%';
	this._overflowBlock.style.left = '-100%';

	// if delay was set, then plan to automatically change slide
	if (0 !== this._moveDelay) this._moveOverTime();

	// start reacting for dragging
	this._moveOnSwipe();
};

// Invoked by click event
// Arguments:
// 	1. e (required) - event object
Slider.prototype._onClick = function(e) {
	var target = e.target;
	// change active slide if needed
	this._controlSlider(target, e);
};

// Checks if active slides needs to be changed and changes it
// Arguments:
// 	1. target (required) - slider controll element
// 	2. e (optional) - event object from click event
Slider.prototype._controlSlider = function(target, e) {
	// slide controll must have [data-component="slider_control"] attribute
	var control = target.closest('[data-component="slider_control"]');
	if (control) {
		e.preventDefault();
		// if slider slides change animation is in proggress then do nothing
		if (this._isMoving) return;

		// if timer for automatic change is set then clear it
		if (this._moveTimer) {
			clearTimeout(this._moveTimer);
		}
		switch (control.dataset.action) {
			case 'forward':
				// if controll has [data-action="forward"] atribute then change to next slide
				this._moveSlideForward();
				break;
			case 'back':
				// if controll has [data-action="back"] atribute then change to pevious slide
				this._moveSlideBack();
				break;
		}

		// if delay was set, then plan to automatically change slide
		if (0 !== this._moveDelay) this._moveOverTime();
	}
};

// Invoked by mouseover event
Slider.prototype._onMouseOver = function() {
	// if timer for automatic change is set then clear it
	if (this._moveTimer) {
		clearTimeout(this._moveTimer);
	}
};

// Invoked by mouseover event
Slider.prototype._onMouseOut = function() {
	// if delay was set, then plan to automatically change slide
	if (0 !== this._moveDelay) this._moveOverTime();
};

// Changes active slide to the slide which index is higher on increment value
// Arguments:
// 	1. increment (optional) - value to add to index of current active slide
Slider.prototype._moveSlideForward = function(increment) {
	// if increment was not set then set as 1
	increment = (increment === undefined) ? 1 : increment;
	// remove zero transition duration value
	this._overflowBlock.style.transitionDuration = '';
	// set to true to prevent change slide until current animation is over
	this._isMoving = true;

	this._slidesArr[this._currSlide].classList.remove('selected');

	this._currSlide += increment;
	this._slidesArr[this._currSlide].classList.add('selected');

	// move slider to new active slide
	this._overflowBlock.style.left = -100 * this._currSlide + '%';

	if (this._currSlide > this._slidesCount) {
		// if current slide index is more than original slides count then change active slide to slide with index 1 after animation will be over
		this._currSlide = 1;
		this._slidesArr[this._currSlide].classList.add('selected');
		// after animation will be over move to new active slide without transition
		this._addListener(this._elem, 'transitionend', this._onCornerTransitionEnd);
	} else {
		this._addListener(this._elem, 'transitionend', this._onMiddleTransitionEnd);
	}
};

// Changes active slide to the slide which index is smaller on increment value
// Arguments:
// 	1. decrement (optional) - value to substract from index of current active slide
Slider.prototype._moveSlideBack = function(decrement) {
	// if increment was not set then set as 1
	decrement = (decrement === undefined) ? 1 : decrement;
	// remove zero transition duration value
	this._overflowBlock.style.transitionDuration = '';
	this._isMoving = true;

	this._slidesArr[this._currSlide].classList.remove('selected');

	this._currSlide -= decrement;
	this._slidesArr[this._currSlide].classList.add('selected');

	// move slider to new active slide
	this._overflowBlock.style.left = -100 * this._currSlide + '%';

	if (0 === this._currSlide) {
		// if current slide index is 0 (it's last clonned slide) then change active slide to last original slide after animation will be over
		this._currSlide = this._slidesCount;
		this._slidesArr[this._currSlide].classList.add('selected');
		// after animation will be over move to new active slide without transition
		this._addListener(this._elem, 'transitionend', this._onCornerTransitionEnd);
	} else {
		this._addListener(this._elem, 'transitionend', this._onMiddleTransitionEnd);
	}
};

// Invoked by ontransitionend event
// Arguments:
// 	1. e (required) - event object
Slider.prototype._onMiddleTransitionEnd = function(e) {
	if (e.target !== this._overflowBlock) return;

	this._removeListener(this._elem, 'transitionend', this._onMiddleTransitionEnd);
	// set to true to allow next slide change
	this._isMoving = false;
};

// Invoked by ontransitionend event
// Arguments:
// 	1. e (required) - event object
Slider.prototype._onCornerTransitionEnd = function(e) {
	if (e.target !== this._overflowBlock) return;

	this._removeListener(this._elem, 'transitionend', this._onCornerTransitionEnd);

	// set transition duration to 0 to make next slide change instant
	this._overflowBlock.style.transitionDuration = '0s';
	// set styles for new active slide
	this._overflowBlock.style.left = -100 * (this._currSlide) + '%';
	this._slidesArr[this._slidesCount+1].classList.remove('selected');
	this._slidesArr[0].classList.remove('selected');
	// set to true to allow next slide change
	this._isMoving = false;
};

// Start reacting for slider dragging
Slider.prototype._moveOnSwipe = function() {
	this._addListener(this._elem, 'mousedown', this._onMouseDown);
	this._addListener(this._elem, 'touchstart', this._onMouseDown);
	this._addListener(this._elem, 'dragstart', this._onDragStart);
};

// Prevent native browser drag event
Slider.prototype._onDragStart = function(e) {
	e.preventDefault();
};

// Invoked by mousedown and touchstart events
// Arguments:
// 	1. e (required) - event object
Slider.prototype._onMouseDown = function(e) {
	var target = e.target;
	if (!target) {
		return;
	}
	var control = target.closest('[data-component="slider_control"]');
	if (!control) {
		// target is controll then prepare for dragging
		this._startDrag(e);
	}
};

// Invoked by mouseup and touchend events
// Arguments:
// 	1. e (required) - event object
Slider.prototype._onMouseUp = function(e) {
	this._stopDrag(e);
};

// Prepares slider for dragging slides
// Arguments:
// 	1. e (required) - event object from mousedown or touchstart events
Slider.prototype._startDrag = function(e) {
	// stop reacting for transitions and stop listening for additional touches
	this._removeListener(this._elem, 'transitionend', this._onCornerTransitionEnd);
	this._removeListener(this._elem, 'transitionend', this._onMiddleTransitionEnd);
	this._removeListener(this._elem, 'mousedown', this._onMouseDown);
	this._removeListener(this._elem, 'touchstart', this._onMouseDown);

	// set to false because all animations will be stopped
	this._isMoving = false;
	// set transition duration to 0 so slides will be dragged after mouse|touch without delay
	this._overflowBlock.style.transitionDuration = '0s';

	// remember starting coordinates of mouse|touch
	var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX;
	var clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;
	this._startCursorXPosition = clientX + (window.pageXOffset || document.documentElement.scrollLeft);
	this._startCursorYPosition = clientY + (window.pageYOffset || document.documentElement.scrollTop);

	// remember current left offset of slides container
	this._overflowStartLeft = this._overflowBlock.offsetLeft;

	// start listening for user dragging
	this._addListener(document, 'mousemove', this._onMouseMoveDrag);
	this._addListener(document, 'touchmove', this._onMouseMoveDrag);
	this._addListener(document, 'mouseup', this._onMouseUp);
	this._addListener(document, 'touchend', this._onMouseUp);
};

// Stopps dragging and scroll slider to current active slide
// Arguments:
// 	1. e (required) - event object from mouseup or touchend events
Slider.prototype._stopDrag = function(e) {
	// stop listening for user dragging
	this._removeListener(document, 'mousemove', this._onMouseMoveDrag);
	this._removeListener(document, 'touchmove', this._onMouseMoveDrag);
	this._removeListener(document, 'mouseup', this._onMouseUp);
	this._removeListener(document, 'touchend', this._onMouseUp);

	// transforms curent left offset of slides container into percents
	var pxLeft = getComputedStyle(this._overflowBlock).left;
	var pxIntLeft = parseInt(pxLeft);
	var percentLeft = this._pixelsToPercents(pxIntLeft);
	this._overflowBlock.style.left = percentLeft + '%';

	// get current mouse|touch coordinates
	var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX;
	var clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;

	// if current mouse|touch coordinates are the same as the coordinates from _startDrag then it was just a click (maybe on active element) so there is no need to prevent default, in another case prevent default
	if (this._startCursorXPosition !== clientX || this._startCursorYPosition !== clientY) {
		e.preventDefault();
	}

	// start listening for new mousedown|touchstart events
	this._addListener(this._elem, 'mousedown', this._onMouseDown);
	this._addListener(this._elem, 'touchstart', this._onMouseDown);

	// get slide element that is currently in the center of the slider
	var newCenterSlide = this._getCenterListItem();
	var diff;
	if (!newCenterSlide) {
		console.warn(this.NAME + ': Center slide is not found!');
		diff = 0;

	} else {
		// get index of current centered slide element
		var newCenterSlideIndex = this._slidesArr.indexOf(newCenterSlide);

		if (newCenterSlideIndex === -1) {
			console.warn(this.NAME + ': Center slide is not in slides Array!');
			diff = 0;

		} else {
			// get index difference between current active slide and centered slide
			diff = newCenterSlideIndex - this._currSlide;
		}
	}

	if (diff >= 0) {
		// if difference is positive number then use _moveSlideForward to scroll to new center slide position
		var overflowLeft = getComputedStyle(this._overflowBlock).left;
		var overflowLeftInt = parseInt(overflowLeft);
		var percentLeft = this._pixelsToPercents(overflowLeftInt);
		if ((diff === 0) && (parseInt(percentLeft * 10) % 100 === 0)) {
			// if difference is 0 and current offset (in precents) of slides container is divided by 100 without reminder then slide was not dragged and there will be no transition so do nothing
		} else {
			this._moveSlideForward(diff);
		}

	} else {
		// if difference is positive number then use _moveSlideForward to scroll to new center slide position
		this._moveSlideBack(-diff);
	}
};

// Translates slides container left offset from pixels to percents
// Arguments:
// 	1. left (required) - slides container left offset (px)
Slider.prototype._pixelsToPercents = function(left) {
	return left * (100 / this._overflowContainer.clientWidth);
};

// Drags slides inside slider
// Arguments:
// 	1. e (required) - event object from mousemove or touchmove events
Slider.prototype._onMouseMoveDrag = function(e) {
	// get current x coordinate of mouse|touch
	var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX;

	// get difference between current and remebered mouse position
	var currentcursorXPosition = clientX + (window.pageXOffset || document.documentElement.scrollLeft);
	var xPositionDeleta = currentcursorXPosition - this._startCursorXPosition;

	// set new left offset to slides container
	var newLeft = this._overflowStartLeft + xPositionDeleta;
	this._overflowBlock.style.left = newLeft + 'px';

	// get slide element that is currently in the center of the slider
	var newCenterSlide = this._getCenterListItem();
	if (!newCenterSlide) {
//		console.warn(this.NAME + ': Center slide is not found!');
	} else {
		// get index of current centered slide element
		var newCenterSlideIndex = this._slidesArr.indexOf(newCenterSlide);

		if (newCenterSlideIndex === -1) {
//			console.warn(this.NAME + ': Center slide is not in slides Array!');
		} else {
			if (newCenterSlideIndex > this._slidesCount) {
				// if slides dragged farther then original slides then move slider container offset to first original slide element
				var percentLeft = this._pixelsToPercents(newLeft);
				newLeft = Math.abs(percentLeft) % 100;
				this._overflowBlock.style.left = -newLeft + '%';

				this._startCursorXPosition = currentcursorXPosition;
				this._overflowStartLeft = this._overflowBlock.offsetLeft;

			} else if (newCenterSlideIndex === 0) {
				// if slides dragged to first (cloned last) slide element then move slider container offset to last original slide elemtn
				var percentLeft = this._pixelsToPercents(newLeft);
				newLeft = Math.abs(percentLeft) + (this._slidesCount * 100);
				this._overflowBlock.style.left = -newLeft + '%';

				this._startCursorXPosition = currentcursorXPosition;
				this._overflowStartLeft = this._overflowBlock.offsetLeft;

			}
		}
	}
};

// Finds slide element that supposted to be at the center of slider at the moment
Slider.prototype._getCenterListItem = function() {
	// find center coordinate of slider
	var clientRect = this._overflowContainer.getBoundingClientRect();
	var overflowContainerCenter = {
		x: clientRect.left + this._overflowContainer.offsetWidth / 2,
		y: clientRect.top + this._overflowContainer.offsetHeight / 2
	}

	// center cooridnate must no be outside of the screen
	if (overflowContainerCenter.x < 0) {
		overflowContainerCenter.x = 0;
	} else if (overflowContainerCenter.x > window.innerWidth - 1) {
		overflowContainerCenter.x = window.innerWidth - 1;
	}
	if (overflowContainerCenter.y < 0) {
		overflowContainerCenter.y = 0;
	} else if (overflowContainerCenter.y > window.innerHeight - 1) {
		overflowContainerCenter.y = window.innerHeight - 1;
	}

	// get element at the center point
	var centerElement = document.elementFromPoint(overflowContainerCenter.x, overflowContainerCenter.y);

	// return closest slide element
	return centerElement.closest('[data-component="slide"]');
};

// Sets timer to change active slide after delay
Slider.prototype._moveOverTime = function () {
	this._moveTimer = setTimeout(function() {
		if (!this._elem) return;
		if (!this._isMoving) {
			this._moveSlideForward();
		}
		this._moveOverTime();
	}.bind(this), this._moveDelay);
};

// Try exporting class via webpack
try {
	module.exports = Slider;
} catch (err) {
	console.warn(err);
}
