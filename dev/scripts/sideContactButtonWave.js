"use strict";

/**
 * Class SideContactButtonWave
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	animation.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 *		1.1. name (optional) - name for class instance to show in console
 *		1.2. elemsArr (required) - array of html elements for wave animation
 *		1.3. containerElem (required) - container of elements from elemsArr
 *		1.4. delay (required) - delay (miliseconds) before restarting wave animation
 *		1.5. activeDuration (required) - duration (miliseconds) of each element of elemsArr being active
 *		1.6. maxOffset (required) - max offset (px) to which container elem can lag during scroll
 *		1.7. offsetAnimationDuration (required) - duration of lag animation of container element
 *		1.8... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function SideContactButtonWave(options) {
	options.name = options.name || 'SideContactButtonWave';
	// run Helper constructor
	Helper.call(this, options);

	this._elemsArr = options.elemsArr;
	this._containerElem = options.containerElem;
	this._delay = options.delay || 2000;
	this._activeDuration = options.activeDuration || 500;
	this._maxOffset = options.maxOffset || 50;
	this._offsetAnimationDuration = options.offsetAnimationDuration || 400;

	// bind class instance as "this" for event listener functions
	this._onMouseOver = this._onMouseOver.bind(this);
	this._onMouseOut = this._onMouseOut.bind(this);
	this._onWindowScroll = this._onWindowScroll.bind(this);
	this._onPageSlideChanged = this._onPageSlideChanged.bind(this);
	this._onPageSlideChangedAnimationEnd = this._onPageSlideChangedAnimationEnd.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
SideContactButtonWave.prototype = Object.create(Helper.prototype);
SideContactButtonWave.prototype.constructor = SideContactButtonWave;

// Main initialisation function
SideContactButtonWave.prototype._init = function() {
	this._startWave();
	this._scrollingDelay();

	// start listening to hover on wave animation element to pause wave animation
	for (var i = 0; i < this._elemsArr.length; i++) {
		this._addListener(this._elemsArr[i], 'mouseover', this._onMouseOver);
		this._addListener(this._elemsArr[i], 'mouseout', this._onMouseOut);
	}
};

// Starts wave animation loop
SideContactButtonWave.prototype._startWave = function() {
	this._setActiveClass(
		// set active class to element
		// slice(0) is to transform array-like collection to array
		this._elemsArr.slice(0),
		function() {
			// restart wave animation it is finished
			this._timer = setTimeout(
				function() {
					delete this._timer;

					if (!this._paused) {
						this._startWave();
					}
				}.bind(this),
				this._delay
			)
		}.bind(this)
	);
};

// Sets active class to wave animation elements in loop
// Arguments:
// 	1. elemsArr (required) - array with elements to set active class
// 	2. callback (optional) - function that will be called after no elements from elemsArr are left
SideContactButtonWave.prototype._setActiveClass = function(elemsArr, callback) {
	// if no elements were passed in elemsArr array then run callback
	if (elemsArr.length === 0) {
		if (callback) {
			callback();
		}
		return;
	}

	// set first element active
	var elem = elemsArr[0];
	elem.classList.add('active');

	// plan to remove active class from first element and call _setActiveClass again
	this._timer = setTimeout(function() {
		elem.classList.remove('active');
		delete this._timer;

		if (!this._paused) {
			// call _setActiveClass with elemsArr where first element is removed
			this._setActiveClass(elemsArr.slice(1), callback);
		}
	}.bind(this), this._activeDuration);
};

// Invoked by mouseover event
SideContactButtonWave.prototype._onMouseOver = function() {
	// pause wave animation
	this._paused = true;
};

// Invoked by mouseout event
SideContactButtonWave.prototype._onMouseOut = function() {
	// resume wave animation after delay
	this._paused = false;

	if (!this._timer) {
		this._timer = setTimeout(
			function() {
				delete this._timer;

				if (!this._paused) {
					this._startWave();
				}
			}.bind(this),
			this._delay
		)
	}
};

// Starts listening to scroll and page slide change to imitate lagging of container elem
SideContactButtonWave.prototype._scrollingDelay = function() {
	this._addListener(window, 'scroll', this._onWindowScroll);
	this._addListener(document, 'pageSlideChanged', this._onPageSlideChanged);
	this._addListener(document, 'pageSlideChangedAnimationEnd', this._onPageSlideChangedAnimationEnd);

	this._currentInOffset = 0
	this._currentOutOffset = 0
	this._scrolled = 0;
	// remember initial y scroll of the page
	this._lastScrollTop = window.pageYOffset !== undefined ? window.pageYOffset : document.documentElement.scrollTop;
};

// Invoked by scroll event on window
SideContactButtonWave.prototype._onWindowScroll = function() {
	// get current page y scroll
	var currentScrollTop = window.pageYOffset !== undefined ? window.pageYOffset : document.documentElement.scrollTop;
	// calculate total scroll distance
	var scrolled = this._scrolled + (currentScrollTop - this._lastScrollTop) * 0.3;

	// if absolute of scrolled is smaller then absolute of _scrolled, that means that user started scrolling in the oposite direction thus stop lag aniamtion
	if (Math.abs(this._scrolled) > Math.abs(scrolled)) {
		scrolled = scrolled - this._scrolled;
		if (this._animationOutTimer) {
			clearTimeout(this._animationOutTimer);
			delete this._timer;
		}

		if (this._animation) {
			if (this._animation.stop) {
				this._animation.stop();
			}
			delete this._animation;
			if (this._animationOut) {
				delete this._animationOut;
			}
		}
	}

	// absolute of _scrolled can not be higher then max offset
	this._scrolled = Math.abs(scrolled) > this._maxOffset ? this._maxOffset * scrolled / Math.abs(scrolled) : scrolled;

	if (this._animationOut && this._animation) {
		if (this._animation.stop) {
			this._animation.stop();
		}
		delete this._animationOut;
		delete this._animation;
	}

	// create new lagging animation
	if (!this._animation) {
		this._animation = new Animation(
			function(timePassed) {
				// calculate timing function value for current moment of animation
				var timeMultiplier = Animation.quadEaseOut(this._offsetAnimationDuration, timePassed);

				// calculate lag offset of container element
				this._currentInOffset = (-this._scrolled - this._currentOutOffset) * timeMultiplier - this._currentOutOffset;
				this._containerElem.style.transform = 'translateY(' + this._currentInOffset + 'px)';
			}.bind(this),
			this._offsetAnimationDuration,
			function() {
				// counter to check if scrolling is stopped
				var scrollStoppedCounter = 0;
				// remember current page y scroll
				var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
				this._currentOutOffset = this._currentInOffset;

				// plan to start backward lag animation
				this._animationOutTimer = setTimeout(
					function onTimeout() {
						delete this._animationOutTimer;
						// get current page y scroll
						var currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

						if (scrollStoppedCounter === 10) {
							// if onTimeout was called 10 times in a row with page y scroll staying the same, we assume that scroll is stopped
							this._scrolled = 0;
							this._currentOutOffset = this._currentInOffset;
							var duration = 400;

							this._animationOut = true;

							// create new animation of backward algging
							this._animation = new Animation(
								function(timePassed) {
									// calculate timing function value for current moment of animation
									var timeMultiplier = Animation.quadEaseOut(duration, timePassed);

									// calculate lag offset of container element
									this._currentOutOffset = this._currentInOffset - (this._currentInOffset * timeMultiplier);
									this._containerElem.style.transform = 'translateY(' + this._currentOutOffset + 'px)';
								}.bind(this),
								duration,
								function() {
									this._containerElem.style.transform = '';
									this._currentInOffset = 0;
									delete this._animation;
									delete this._animationOut;
								}.bind(this)
							);

							return;

						} else if (scrollTop === currentScrollTop) {
							// if remembered page y offset and current page y offset are equal then increment counter
							scrollStoppedCounter++;
						} else {
							// if remembered page y offset and current page y offset are different that means that scroll is probaly is still in progress
							// reset counter
							scrollStoppedCounter = 0;
							// remember current page y scroll
							scrollTop = currentScrollTop;
						}

						// plan onTimeout again untill scroll stops
						this._animationOutTimer = setTimeout(onTimeout.bind(this), 9);
					}.bind(this),
					9
				);

			}.bind(this)
		)
	}

	this._lastScrollTop = currentScrollTop;
};

// Invoked by pageSlideChanged event
// Arguments:
// 	1. e (required) - event object
SideContactButtonWave.prototype._onPageSlideChanged = function(e) {
	// get direction of changed page slides
	this._animationDirection = (e.detail.activeSlideIndex - e.detail.lastActiveSlideIndex) / Math.abs(e.detail.activeSlideIndex - e.detail.lastActiveSlideIndex);

	if (this._animation) {
		if (this._animation.stop) {
			this._animation.stop();
		}
		delete this._animation;
	}

	this._currentInOffset = this._currentOutOffset;

	// create new lag amination
	this._animation = new Animation(
		function(timePassed) {
			// calculate timing function value for current moment of animation
			var timeMultiplier = Animation.quadEaseOut(this._offsetAnimationDuration, timePassed);

			// calculate lag offset of container element
			this._currentInOffset = ((this._maxOffset * -this._animationDirection - this._currentOutOffset) * timeMultiplier) + this._currentOutOffset;
			this._containerElem.style.transform = 'translateY(' + this._currentInOffset + 'px)';
		}.bind(this),
		this._offsetAnimationDuration,
		function() {
			this._currentOutOffset = 0;
			delete this._animation;
		}.bind(this)
	)
};

// Invoked by pageSlideChangedAnimationEnd event
SideContactButtonWave.prototype._onPageSlideChangedAnimationEnd = function() {
	if (this._animation) {
		if (this._animation.stop) {
			this._animation.stop();
		}
		delete this._animation;
	}

	this._currentOutOffset = this._currentInOffset;

	// create new backward lag amination
	this._animation = new Animation(
		function(timePassed) {
			// calculate timing function value for current moment of animation
			var timeMultiplier = Animation.quadEaseOut(this._offsetAnimationDuration, timePassed);

			// calculate lag offset of container element
			this._currentOutOffset = this._currentInOffset - (this._currentInOffset * timeMultiplier);
			this._containerElem.style.transform = 'translateY(' + this._currentOutOffset + 'px)';
		}.bind(this),
		this._offsetAnimationDuration,
		function() {
			this._containerElem.style.transform = '';
			this._currentInOffset = 0;
			delete this._animation;
		}.bind(this)
	)
};

// Try exporting class via webpack
try {
	module.exports = SideContactButtonWave;
} catch (err) {
	console.warn(err);
}
