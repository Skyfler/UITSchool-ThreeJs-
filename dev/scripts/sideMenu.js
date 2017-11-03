"use strict";

/**
 * Class SideMenu
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	animation.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that contains menu items (.side_menu_list_item) and slider element (.slider_elem)
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. animationDuration (required) - duration of animation of slider element
 *		1.4... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function SideMenu(options) {
	options.name = options.name || 'SideMenu';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;
	this._animationDuration = options.animationDuration || 500;

	// bind class instance as "this" for event listener functions
	this._onPageSlideChanged = this._onPageSlideChanged.bind(this);
	this._onResize = this._onResize.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
SideMenu.prototype = Object.create(Helper.prototype);
SideMenu.prototype.constructor = SideMenu;

// Main initialisation function
SideMenu.prototype._init = function() {
	this._listItemsArr = this._elem.querySelectorAll('.side_menu_list_item');
	this._listItemsCount = this._listItemsArr.length;
	this._sliderElem = this._elem.querySelector('.slider_elem');

	// start listening to page slide change signal
	this._addListener(document, 'pageSlideChanged', this._onPageSlideChanged);
	this._addListener(window, 'resize', this._onResize);
};

// Invoked by pageSlideChanged event
// Arguments:
// 	1. e (required) - event object
SideMenu.prototype._onPageSlideChanged = function(e) {
	var activeSlideID = e.detail.activeSlideID,
		activeSlideElem = e.detail.activeSlideElem;

	// try to find ID of active slide among list items' [data-slide] attribute
	for (var i = 0, newActiveListItem; i < this._listItemsCount && !newActiveListItem; i++) {
		if (this._listItemsArr[i].dataset.slide === activeSlideID && this._listItemsArr[i] !== this._activeListItem) {
			newActiveListItem = this._listItemsArr[i];
		}
	}

	// if list item representing active slide is not found then try to find ID of active slide's parent element among list items' [data-slide] attribute
	if (activeSlideElem && !newActiveListItem) {
		var activeParentSlideElemId = activeSlideElem.id;

		if (!activeParentSlideElemId) return;

		for (var i = 0, newActiveListItem; i < this._listItemsCount && !newActiveListItem; i++) {
			if (this._listItemsArr[i].dataset.slide === activeParentSlideElemId && this._listItemsArr[i] !== this._activeListItem) {
				newActiveListItem = this._listItemsArr[i];
			}
		}
	}

	// if list item was found then set it active
	if (newActiveListItem) {
		this._setActiveListItem(newActiveListItem);
	}
};

// Sets list item as active
// Arguments:
// 	1. activeListItem (required) - list item to set active
SideMenu.prototype._setActiveListItem = function(activeListItem) {
	// remove active class from previous active item
	if (this._activeListItem) {
		this._activeListItem.classList.remove('active');
	}
	// setting passed list item as active
	activeListItem.classList.add('active');
	this._activeListItem = activeListItem;

	// if window width is less then 1200 that means side menu is not visible
	if (this._checkScreenWidth() === 'xs' || this._checkScreenWidth() === 'sm'  || this._checkScreenWidth() === 'md') return;
	// animate slider elem
	this._controllSliderElem();
};

// Animates slider elem to position of active list item
SideMenu.prototype._controllSliderElem = function() {
	// get initial position and height of slider element
	var startTop = this._sliderElem.offsetTop,
		startHeight = this._sliderElem.offsetHeight;

	// get target position and height of slider element
	this._endTop = this._activeListItem.offsetTop;
	this._endHeight = this._activeListItem.offsetHeight;


	if (this._currentAnimation) {
		this._currentAnimation.stop();
	}

	// create new animation to move slider to target position and height
	this._currentAnimation = new Animation(
		function(timePassed) {
			// calculate timing function value for current moment of animation
			var timeMultiplier = Animation.quadEaseInOut(this._animationDuration, timePassed);
			// calculate current values of top and height
			var curTop = startTop + ((this._endTop - startTop) * timeMultiplier);
			var curHeight = startHeight + ((this._endHeight - startHeight) * timeMultiplier);

			this._sliderElem.style.top = curTop + 'px';
			this._sliderElem.style.height = curHeight + 'px';
		}.bind(this),
		this._animationDuration,
		function() {
			delete this._endTop;
			delete this._endHeight;
			delete this._currentAnimation;
		}.bind(this)
	);
};

// Invoked by resize event on window
// Arguments:
// 	1. e (required) - event object
SideMenu.prototype._onResize = function() {
	// if window width is less then 1200 that means side menu is not visible
	if (this._checkScreenWidth() === 'xs' || this._checkScreenWidth() === 'sm'  || this._checkScreenWidth() === 'md') return;

	// if no list item is set active then set active 1st list item
	if (!this._activeListItem) {
		this._setActiveListItem(this._listItemsArr[0]);
	}

	if (this._currentAnimation) {
		// if animation is in progress then recalculate target top and height of animation of slider elem
		this._endTop = this._activeListItem.offsetTop;
		this._endHeight = this._activeListItem.offsetHeight;

	} else {
		// else set target top and height to slider elem
		this._sliderElem.style.top = this._activeListItem.offsetTop + 'px';
		this._sliderElem.style.height = this._activeListItem.offsetHeight + 'px';

	}
};

// Try exporting class via webpack
try {
	module.exports = SideMenu;
} catch (err) {
	console.warn(err);
}
