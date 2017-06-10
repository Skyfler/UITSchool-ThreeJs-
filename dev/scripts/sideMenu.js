"use strict";

var Helper = require('./helper');
var Animation = require('./animation');

function SideMenu(options) {
	options.name = options.name || 'SideMenu';
	Helper.call(this, options);

	this._elem = options.elem;
	this._animationDuration = options.animationDuration || 500;

	this._onPageSlideChanged = this._onPageSlideChanged.bind(this);
	this._onResize = this._onResize.bind(this);

	this._init();
}

SideMenu.prototype = Object.create(Helper.prototype);
SideMenu.prototype.constructor = SideMenu;

SideMenu.prototype._init = function() {
	this._listItemsArr = this._elem.querySelectorAll('.side_menu_list_item');
	this._listItemsCount = this._listItemsArr.length;
	this._sliderElem = this._elem.querySelector('.slider_elem');

	this._addListener(document, 'pageSlideChanged', this._onPageSlideChanged);
	this._addListener(window, 'resize', this._onResize);
};

SideMenu.prototype._onPageSlideChanged = function(e) {
	var activeSlideID = e.detail.activeSlideID,
		activeSlideElem = e.detail.activeSlideElem;

	for (var i = 0, newActiveListItem; i < this._listItemsCount && !newActiveListItem; i++) {
		if (this._listItemsArr[i].dataset.slide === activeSlideID && this._listItemsArr[i] !== this._activeListItem) {
			newActiveListItem = this._listItemsArr[i];
		}
	}

	if (activeSlideElem && !newActiveListItem) {
		var activeParentSlideElemId = activeSlideElem.id;

		if (!activeParentSlideElemId) return;

		for (var i = 0, newActiveListItem; i < this._listItemsCount && !newActiveListItem; i++) {
			if (this._listItemsArr[i].dataset.slide === activeParentSlideElemId && this._listItemsArr[i] !== this._activeListItem) {
				newActiveListItem = this._listItemsArr[i];
			}
		}
	}

	if (newActiveListItem) {
		this._setActiveListItem(newActiveListItem);
	}
};

SideMenu.prototype._setActiveListItem = function(activeListItem) {
	if (this._activeListItem) {
		this._activeListItem.classList.remove('active');
	}
	activeListItem.classList.add('active');
	this._activeListItem = activeListItem;

	if (this._checkScreenWidth() === 'xs' || this._checkScreenWidth() === 'sm'  || this._checkScreenWidth() === 'md') return;
	this._controllSliderElem();
};

SideMenu.prototype._controllSliderElem = function() {
	var startTop = this._sliderElem.offsetTop,
		startHeight = this._sliderElem.offsetHeight;

	this._endTop = this._activeListItem.offsetTop;
	this._endHeight = this._activeListItem.offsetHeight;


	if (this._currentAnimation) {
		this._currentAnimation.stop();
	}

	this._currentAnimation = new Animation(
		function(timePassed) {
//			var timeMultiplier = (timePassed / (this._animationDuration / 100)) / 100;
			var timeMultiplier = Animation.quadEaseInOut(this._animationDuration, timePassed);
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

SideMenu.prototype._onResize = function() {
	if (this._checkScreenWidth() === 'xs' || this._checkScreenWidth() === 'sm'  || this._checkScreenWidth() === 'md') return;

	if (!this._activeListItem) {
		this._setActiveListItem(this._listItemsArr[0]);
	}

	if (this._currentAnimation) {
		this._endTop = this._activeListItem.offsetTop;
		this._endHeight = this._activeListItem.offsetHeight;

	} else {
		this._sliderElem.style.top = this._activeListItem.offsetTop + 'px';
		this._sliderElem.style.height = this._activeListItem.offsetHeight + 'px';

	}
};

module.exports = SideMenu;
