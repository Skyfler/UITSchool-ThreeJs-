"use strict";

/**
 * Class BeforeLeaveModalController
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	animation.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element modal window
 *		1.2. name (optional) - name for class instance to show in console
 * 		1.3. animatedItemsApperanceStartOffset (optional) - starting value of right offset of items that need to be animated
 * 		1.4. animatedItemsApperanceDelay (optional) - delay (misileconds) before next item animated
 * 		1.5. animatedItemsApperanceDuration (optional) - animation duration (misileconds) of animated items
 *		1.6... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function BeforeLeaveModalController(options) {
	options.name = options.name || 'BeforeLeaveModalController';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;
	this._animatedItemsApperanceStartOffset = options.animatedItemsApperanceStartOffset || -100;
	this._animatedItemsApperanceDelay = options.animatedItemsApperanceDelay || 400;
	this._animatedItemsApperanceDuration = options.animatedItemsApperanceDuration || 400;

	// bind class instance as "this" for event listener functions
	this._onClick = this._onClick.bind(this);
	this._onMouseOut = this._onMouseOut.bind(this);
	this._onMouseMove = this._onMouseMove.bind(this);
	this._onTransitionEnd = this._onTransitionEnd.bind(this);

	// run main initialisation function
	this._init(options);
}

// Inherit prototype methods from Helper
BeforeLeaveModalController.prototype = Object.create(Helper.prototype);
BeforeLeaveModalController.prototype.constructor = BeforeLeaveModalController;

// Main initialisation function
BeforeLeaveModalController.prototype._init = function() {
	// find all animated elements
	this._animateItemsArr = this._elem.querySelectorAll('.animated_item');
	if (this._elem.classList.contains('open')) {
		this._state = 'open';
	} else {
		this._state = 'closed';
	}

	// start listening for bubbling mouseout event when document loading complete
	this._checkDocReady(function(){
		this._addListener(document, 'mouseout', this._onMouseOut);
	}.bind(this));

	// start listening for bubbling click and mousemove events
	this._addListener(document, 'click', this._onClick);
	this._addListener(document, 'mousemove', this._onMouseMove);
};

// Keeps checking if document is loaded, then calls callback function
// Arguments:
// 	1. callback (required) - function to call when document loading complete
BeforeLeaveModalController.prototype._checkDocReady = function(callback) {
	/in/.test(document.readyState) ? setTimeout(function() {this._checkDocReady(callback)}.bind(this), 9) : callback();
};

// Prepares animated element to be animated
BeforeLeaveModalController.prototype._preOpenInit = function() {
	this._animateItemsStartingPositionArr = [];
	this._animateItemsStartingPositionTypeArr = [];

	var position,
		initalOffset;

	for (var i = 0; i < this._animateItemsArr.length; i++) {
		// get initial position value of animated item
		position = getComputedStyle(this._animateItemsArr[i]).position;
		this._animateItemsStartingPositionTypeArr[i] = position;

		if (this._animateItemsStartingPositionTypeArr[i] === 'absolute') {
			this._animateItemsArr[i].style.position = 'absolute';
		} else {
			this._animateItemsArr[i].style.position = 'relative';
		}

		// get initial right value of animated item
		initalOffset = parseFloat(getComputedStyle(this._animateItemsArr[i]).right);
		this._animateItemsStartingPositionArr[i] = initalOffset;

		this._animateItemsArr[i].style.opacity = 0;
		this._animateItemsArr[i].style.right = this._animateItemsStartingPositionArr[i] + this._animatedItemsApperanceStartOffset + 'px';
		this._animateItemsArr[i].style.left = 'auto';
	}
};

// Opens or closes modal window
BeforeLeaveModalController.prototype._toggle = function() {
	if (this._state === 'open') {
		this._state = 'closed';
		this._elem.classList.remove('open');

	} else if (this._state === 'closed') {
		// wait until modal window transition is over to start animate animated items
		this._addListener(this._elem, 'transitionend', this._onTransitionEnd);
		this._preOpenInit();
		this._state = 'open';
		this._elem.classList.add('open');
		// set true to prevent opening modal for the second time on this page
		this._preventOpen = true;

	}
};

// Invoked by transitionend event
// Arguments:
// 	1. e (required) - event object
BeforeLeaveModalController.prototype._onTransitionEnd = function(e) {
	var target = e.target;
	var property = e.propertyName
	if (target !== this._elem || property !== 'transform') return;

	this._removeListener(this._elem, 'transitionend', this._onTransitionEnd);
	this._showAnimatedItems();
};

// Start animating animated items
BeforeLeaveModalController.prototype._showAnimatedItems = function() {
	this._animateItemsAnimated = [];

	this._showAnimatedItem(0);
};

// Animate particular animated item
// Arguments:
// 	1. index (optional) - index of animated item in _animateItemsArr
BeforeLeaveModalController.prototype._showAnimatedItem = function(index) {
	// if there is no animated item in _animateItemsArr on position index then stop
	if (!this._animateItemsArr[index]) {
		delete this._animateItemsAnimated;
		return;
	}

	this._animateItemsAnimated[index] = true;

	var startAnimationPosition = this._animateItemsStartingPositionArr[index] + this._animatedItemsApperanceStartOffset;

	// create animation for animated item
	new Animation(
		function(timePassed) {
			// calculate timing function progress of animation
			var timeMultiplier = Animation.linear(this._animatedItemsApperanceDuration, timePassed),
				right = startAnimationPosition - this._animatedItemsApperanceStartOffset * timeMultiplier;

			this._animateItemsArr[index].style.right = right + 'px';
			this._animateItemsArr[index].style.opacity = timeMultiplier;

			// if passed time is more than delay start animating next item
			if (timePassed >= this._animatedItemsApperanceDelay && this._animateItemsAnimated && !this._animateItemsAnimated[index + 1]) {
				this._showAnimatedItem(index + 1);
			}
		}.bind(this),
		this._animatedItemsApperanceDuration,
		function() {
			// reset styles of animated item
			this._animateItemsArr[index].style.position = '';
			this._animateItemsArr[index].style.opacity = '';
			this._animateItemsArr[index].style.right = '';
			this._animateItemsArr[index].style.left = '';
			// if delay is longer than animation duration then plan animating next item after (delay - animateion duration) miliseconds
			if (this._animatedItemsApperanceDelay > this._animatedItemsApperanceDuration) {
				setTimeout(
					this._showAnimatedItem.bind(this)(index + 1),
					this._animatedItemsApperanceDelay - this._animatedItemsApperanceDuration
				);
			}
		}.bind(this)
	);
};

// Invoked by click event
// Arguments:
// 	1. e (required) - event object
BeforeLeaveModalController.prototype._onClick = function(e) {
	var target = e.target;
	if (!target) return;
	target = target.closest('[data-action]');
	if (!target) return;

	var action = target.dataset.action;
	if (!action) return;
	// if click was on the element that has [data-action="close_modal"] attribute or it's child and modal is open then close modal
	if (action === 'close_modal' && this._state === 'open') {
		this._toggle();
	}
};

// Invoked by mousemove event
// Arguments:
// 	1. e (required) - event object
BeforeLeaveModalController.prototype._onMouseMove = function(e) {
	this._winCoords = {
		x: e.clientX,
		y: e.clientY
	};
};

// Invoked by mouseout event
// Arguments:
// 	1. e (required) - event object
BeforeLeaveModalController.prototype._onMouseOut = function(e) {
	var left = e.target;
	var entered = e.relatedTarget;

	// if mouse has left browser window and was close (<50 px) to top border before that, modal is closed and wasn't opened before than open it
	if (entered === null && this._state === 'closed' && !this._preventOpen && this._winCoords.y < 50) {
		this._toggle();
	}
};

// Try exporting class via webpack
try {
	module.exports = BeforeLeaveModalController;
} catch (err) {
	console.warn(err);
}
