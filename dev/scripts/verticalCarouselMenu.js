"use strict";

var Helper = require('./helper');
var Animation = require('./animation');

function VerticalCarouselMenu(options) {
	options.name = options.name || 'VerticalCarouselMenu';
	Helper.call(this, options);

	this._elem = options.elem;
	this._activeClass = options.activeClass || 'active';
	this._animationDuration = options.animationDuration || 300;
	this._openedMenuItemHeightDiff = options.openedMenuItemHeightDiff || 0;
	this._listOverflowContainer = this._elem.querySelector('.carousel_list_overflow_container');
	this._listContainer = this._elem.querySelector('.carousel_list_container');
	this._listItemContainer = this._elem.querySelector('.carousel_list_item_container');
	this._heightElem = options.heightElem || this._elem;

	this._mode = (options.mode === 'scrolling' || options.mode === 'collapsing') ? options.mode : 'collapsing';

	this._stateBreakpoint = options.stateBreakpoint || 0;
	this._onMouseDown = this._onMouseDown.bind(this);
	this._onMouseUp = this._onMouseUp.bind(this);
	this._onMouseMoveDrag = this._onMouseMoveDrag.bind(this);
	this._onScrollingResize = this._onScrollingResize.bind(this);

	this._onMouseOver = this._onMouseOver.bind(this);
	this._onMouseOut = this._onMouseOut.bind(this);
	this._onCollapsingResize = this._onCollapsingResize.bind(this);

	if (this._mode === 'scrolling') {
		this._initScrollingMenu();
	} else if (this._mode === 'collapsing') {
		this._initCollapsingMenu();
	} else {
		console.log(this.NAME + ': Unknown Mode!');
	}
}

VerticalCarouselMenu.prototype = Object.create(Helper.prototype);
VerticalCarouselMenu.prototype.constructor = VerticalCarouselMenu;

VerticalCarouselMenu.prototype.remove = function() {
	this._disableScrollingMenu();
	this._disableCollapsingMenu();

	Helper.prototype.remove.apply(this, arguments);
};

VerticalCarouselMenu.prototype._disableScrollingMenu = function() {
	this._removeListener(this._elem, 'mousedown', this._onMouseDown);
	this._removeListener(this._elem, 'touchstart', this._onMouseDown);
	this._removeListener(document, 'mousemove', this._onMouseMoveDrag);
	this._removeListener(document, 'touchmove', this._onMouseMoveDrag);
	this._removeListener(document, 'mouseup', this._onMouseUp);
	this._removeListener(document, 'touchend', this._onMouseUp);
	this._removeListener(window, 'resize', this._onScrollingResize);
	this._removeListener(this._elem, 'dragstart', this._onDragStart);

	if (this._listItemContainerClone1) {
		this._listItemContainerClone1.parentElement.removeChild(this._listItemContainerClone1);
		delete this._listItemContainerClone1;
	}
	if (this._listItemContainerClone2) {
		this._listItemContainerClone2.parentElement.removeChild(this._listItemContainerClone2);
		delete this._listItemContainerClone2;
	}

	if (this._activeSlide) {
		this._activeSlide.classList.remove(this._activeClass);
		delete this._activeSlide;
	}

	delete this._activeMenuItemIndex;

	if (this._lastActiveMenuItemIndex) {
		delete this._lastActiveMenuItemIndex;
	}

	for (var i = 0; i < this._listItemsCount; i++) {
		this._listItems[i].style.height = '';
	}

	this._listOverflowContainer.style.height = '';
	this._listContainer.style.position = '';
	this._listContainer.style.left = '';
	this._listContainer.style.top = '';
};

VerticalCarouselMenu.prototype._disableCollapsingMenu = function() {
	this._removeListener(this._elem, 'mouseover', this._onMouseOver);
	this._removeListener(this._elem, 'mouseout', this._onMouseOut);
	this._removeListener(window, 'resize', this._onCollapsingResize);

	for (var i = 0; i < this._listItemsCount; i++) {
		this._listItems[i].style.height = '';
	}

	if (this._lastActiveSlide) {
		delete this._lastActiveSlide;
	}

	if (this._activeSlide) {
		this._activeSlide.classList.remove(this._activeClass);
		delete this._activeSlide;
	}
};

VerticalCarouselMenu.prototype._switchMenuMode = function() {
	if (this._mode === 'scrolling') {
		this._disableScrollingMenu();
		this._initCollapsingMenu();
		this._mode = 'collapsing';

	} else if (this._mode === 'collapsing') {
		this._disableCollapsingMenu();
		this._initScrollingMenu();
		this._mode = 'scrolling';

	}
};

/*----------------------------SCROLLING MENU--------------------------------*/

VerticalCarouselMenu.prototype._initScrollingMenu = function() {
	this._listItems = this._listItemContainer.querySelectorAll('.carousel_list_item');
	this._listItemsCount = this._listItems.length;

	this._setOverflowContainerHeight(true);

	this._listContainer.style.position = 'absolute';
	this._listContainer.style.left = '0';
	this._listContainer.style.top = '0';

	this._defaultMenuItemsHeightArr = [];
	this._currentMenuItemsHeightArr = [];

	for (var i = 0; i < this._listItemsCount; i++) {
		this._listItems[i].dataset.slideNumber = i;
		this._defaultMenuItemsHeightArr[i] = this._listItems[i].offsetHeight;
		this._listItems[i].style.height = this._listItems[i].offsetHeight + 'px';
	}

	this._listItemContainerClone1 = this._listItemContainer.cloneNode(true);
	this._listItemClones1 = this._listItemContainerClone1.querySelectorAll('.carousel_list_item');
	this._listItemContainerClone2 = this._listItemContainer.cloneNode(true);
	this._listItemClones2 = this._listItemContainerClone2.querySelectorAll('.carousel_list_item');

//    this._listItemContainer.style.outline = '1px solid red';

	this._listContainer.insertBefore(this._listItemContainerClone1, this._listContainer.children[0]);
	this._listContainer.appendChild(this._listItemContainerClone2);

	this._manageActiveLIClass(0, true);
	this._centerSelectedListItem(0, true);

	this._addListener(this._elem, 'mousedown', this._onMouseDown);
	this._addListener(this._elem, 'touchstart', this._onMouseDown);
	this._addListener(window, 'resize', this._onScrollingResize);
	this._addListener(this._elem, 'dragstart', this._onDragStart);
};

VerticalCarouselMenu.prototype._onDragStart = function(e) {
//	var test = document.querySelector('#test');
//	if (test) {
//		test.innerHTML += 'onDragStart</br>';
////		test.innerHTML += '	preventDefault!</br>';
//		test.scrollTop = test.scrollHeight;
//	}
	e.preventDefault();
};

VerticalCarouselMenu.prototype._onMouseDown = function(e) {
	this._startDrag(e);
};

VerticalCarouselMenu.prototype._onMouseUp = function(e) {
	this._stopDrag(e);
};

VerticalCarouselMenu.prototype._onScrollingResize = function(unset) {
	this._setOverflowContainerHeight();
	this._centerSelectedListItem(this._activeMenuItemIndex, true);
};

VerticalCarouselMenu.prototype._setOverflowContainerHeight = function(unset) {
	if (this._listOverflowContainerHeight !== this._heightElem.offsetHeight || unset) {
		this._listOverflowContainerHeight = this._heightElem.offsetHeight;
		this._listOverflowContainer.style.height = this._listOverflowContainerHeight + 'px';
	}
};

VerticalCarouselMenu.prototype._startDrag = function(e) {
//	var test = document.querySelector('#test');
//	if (test) {
//		test.innerHTML += 'startDrag[' + e.type + ']</br>';
//		test.scrollTop = test.scrollHeight;
//	}
	var clientX = e.clientX || e.touches[0].clientX;
	var clientY = e.clientY || e.touches[0].clientY;

	this._startCursorXPosition = clientX + (window.pageXOffset || document.documentElement.scrollLeft);
	this._startCursorYPosition = clientY + (window.pageYOffset || document.documentElement.scrollTop);
	this._startListContainerYPosition = this._listContainer.offsetTop;
	this._addListener(document, 'mousemove', this._onMouseMoveDrag);
	this._addListener(document, 'touchmove', this._onMouseMoveDrag);
	this._addListener(document, 'mouseup', this._onMouseUp);
	this._addListener(document, 'touchend', this._onMouseUp);
};

VerticalCarouselMenu.prototype._stopDrag = function(e) {
	var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX;
	var clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;

//	var test = document.querySelector('#test');
//	if (test) {
//		test.innerHTML += 'stopDrag[' + e.type + ']</br>';
////		test.innerHTML += '	startX = ' + this._startCursorXPosition +  '</br>';
////		test.innerHTML += '	clientX = ' + clientX + '</br>';
////		test.innerHTML += '	startY = ' + this._startCursorYPosition + '</br>';
////		test.innerHTML += '	clientY = ' + clientY + '</br>';
//		test.scrollTop = test.scrollHeight;
//	}

	this._controllSelectedListItemOnStopDrag();

	var deltaX = Math.abs(this._startCursorXPosition - clientX);
	var deltaY = Math.abs(this._startCursorYPosition - clientY);
	if (deltaX > 10 || deltaY > 10) {
		e.preventDefault();
//		if (test) {
//			test.innerHTML += '	deltaX = ' + deltaX +  '</br>';
//			test.innerHTML += '	deltaY = ' + deltaY +  '</br>';
//			test.innerHTML += '	preventDefault!</br>';
//			test.scrollTop = test.scrollHeight;
//		}
	}

	this._removeListener(document, 'mousemove', this._onMouseMoveDrag);
	this._removeListener(document, 'touchmove', this._onMouseMoveDrag);
	this._removeListener(document, 'mouseup', this._onMouseUp);
	this._removeListener(document, 'touchend', this._onMouseUp);

	this._centerSelectedListItem(this._activeMenuItemIndex);
};

VerticalCarouselMenu.prototype._onMouseMoveDrag = function(e) {
//	var test = document.querySelector('#test');
//	if (test) {
//		test.innerHTML += 'onMouseMoveDrag[' + e.type + ']</br>';
//		test.scrollTop = test.scrollHeight;
//	}
	var clientY = e.clientY || e.touches[0].clientY;

	var currentcursorYPosition = clientY + (window.pageYOffset || document.documentElement.scrollTop);
	var yPositionDeleta = this._startCursorYPosition - currentcursorYPosition;

	var newtListContainerYPosition = this._startListContainerYPosition - yPositionDeleta;

	this._listOverflowContainerCenter = this._listOverflowContainerHeight / 2;

	if (-1 * newtListContainerYPosition > this._listItemContainer.offsetHeight * 2 - this._listOverflowContainerHeight / 2) {
		newtListContainerYPosition += this._listItemContainer.offsetHeight;

	} else if (-1 * newtListContainerYPosition < this._listItemContainer.offsetHeight - this._listOverflowContainerHeight / 2) {
		newtListContainerYPosition -= this._listItemContainer.offsetHeight;

	}

	this._controllSelectedListItemOnDrag();
	this._listContainer.style.top = newtListContainerYPosition + 'px';
};

VerticalCarouselMenu.prototype._controllSelectedListItemOnStopDrag = function() {
	if (this._timerToSelect) {
		clearTimeout(this._timerToSelect);
	}
	var selectedListItem = this._getCenterListItem();

	if (!selectedListItem) {
		console.log(this.NAME + ': Center list item is not found!');
	} else {
		this._manageActiveLIClass(parseInt(selectedListItem.dataset.slideNumber));
		this._activeMenuItemIndex = parseInt(selectedListItem.dataset.slideNumber);
	}
};

VerticalCarouselMenu.prototype._controllSelectedListItemOnDrag = function() {
	var selectedListItem = this._getCenterListItem();

	if (!selectedListItem) {
		console.log(this.NAME + ': Center list item is not found!');
	} else {
		if (!this._ListItemToBeSelected || this._ListItemToBeSelected !== selectedListItem) {
			this._ListItemToBeSelected = selectedListItem;

			if (this._timerToSelect) {
				clearTimeout(this._timerToSelect);
			}

			this._timerToSelect = setTimeout(function() {
				delete this._timerToSelect;

				var selectedListItem = this._getCenterListItem();

				if (this._ListItemToBeSelected === selectedListItem) {
					this._manageActiveLIClass(parseInt(selectedListItem.dataset.slideNumber));
					this._activeMenuItemIndex = parseInt(selectedListItem.dataset.slideNumber);
				}

				delete this._ListItemToBeSelected;
			}.bind(this), 250);
		}
	}
};

VerticalCarouselMenu.prototype._getCenterListItem = function() {
	var listOverflowContainerCenter = {
		x: this._listOverflowContainer.getBoundingClientRect().left + this._listOverflowContainer.offsetWidth / 2,
		y: this._listOverflowContainer.getBoundingClientRect().top + this._listOverflowContainerHeight / 2
	}

	var centerElement = document.elementFromPoint(listOverflowContainerCenter.x, listOverflowContainerCenter.y);

	return centerElement.closest('[data-slide-number]');
};

VerticalCarouselMenu.prototype._centerSelectedListItem = function(listItemNumber, noTransition) {
	var listItemEndHeight = this._defaultMenuItemsHeightArr[listItemNumber] + this._openedMenuItemHeightDiff;

//	var listItemOffsetCurrentCenter = this._listItems[listItemNumber].offsetTop + (this._listItems[listItemNumber].offsetHeight / 2);
	var targetOffsetTop = 0;
	for (var i = 0; i < listItemNumber; i++) {
		targetOffsetTop += this._defaultMenuItemsHeightArr[i];
	}
	var listItemOffsetTargetCenter = this._listItemContainer.offsetTop + targetOffsetTop + listItemEndHeight / 2;

//    var listItemHeight = this._listItems[listItemNumber].offsetHeight;

	var startListContainerTop = this._listContainer.offsetTop;
	var endListContainerTop =
		(this._listOverflowContainerHeight - listItemEndHeight) / 2 -
		(listItemOffsetTargetCenter - (listItemEndHeight / 2));

//    this._listContainer.style.top = listContainerTop + 'px';
	if (this._currentTopAnimation) {
		this._currentTopAnimation.stop();
	}

	if (noTransition) {
		this._listContainer.style.top = endListContainerTop + 'px';

	} else {
		this._currentTopAnimation = new Animation(
			function(timePassed) {
				var top = startListContainerTop + (((endListContainerTop - startListContainerTop) / this._animationDuration) * timePassed);
				this._listContainer.style.top = top + 'px';
			}.bind(this),
			this._animationDuration,
			function() {
				delete this._currentTopAnimation;
			}.bind(this)
		);

	}
};

VerticalCarouselMenu.prototype._manageActiveLIClass = function(listItemNumber, noTransition) {
	if (this._activeMenuItemIndex === listItemNumber) return;

	if (this._activeMenuItemIndex !== undefined) {
		this._listItems[this._activeMenuItemIndex].classList.remove(this._activeClass);
		this._listItemClones1[this._activeMenuItemIndex].classList.remove(this._activeClass);
		this._listItemClones2[this._activeMenuItemIndex].classList.remove(this._activeClass);
	}

	this._listItems[listItemNumber].classList.add(this._activeClass);
	this._listItemClones1[listItemNumber].classList.add(this._activeClass);
	this._listItemClones2[listItemNumber].classList.add(this._activeClass);

	if (this._activeMenuItemIndex) {
		this._lastActiveMenuItemIndex = this._activeMenuItemIndex;
	}
	this._activeMenuItemIndex = listItemNumber;
	this._activeSlide = this._listItems[listItemNumber];

	if (this._currentHeightAnimation) {
		this._currentHeightAnimation.stop();
	}

	if (noTransition) {
		if (this._lastActiveMenuItemIndex) {
			this._listItems[this._lastActiveMenuItemIndex].style.height = this._defaultMenuItemsHeightArr[this._lastActiveMenuItemIndex] + 'px';
			this._listItemClones1[this._lastActiveMenuItemIndex].style.height = this._defaultMenuItemsHeightArr[this._lastActiveMenuItemIndex] + 'px';
			this._listItemClones2[this._lastActiveMenuItemIndex].style.height = this._defaultMenuItemsHeightArr[this._lastActiveMenuItemIndex] + 'px';
		}
		this._listItems[listItemNumber].style.height = this._defaultMenuItemsHeightArr[listItemNumber] + this._openedMenuItemHeightDiff + 'px';
		this._listItemClones1[listItemNumber].style.height = this._defaultMenuItemsHeightArr[listItemNumber] + this._openedMenuItemHeightDiff + 'px';
		this._listItemClones2[listItemNumber].style.height = this._defaultMenuItemsHeightArr[listItemNumber] + this._openedMenuItemHeightDiff + 'px';

	} else {
		for (var i = 0; i < this._listItemsCount; i++) {
			this._currentMenuItemsHeightArr[i] = this._listItems[i].offsetHeight;
		}

		this._currentHeightAnimation = new Animation(
			this._openSelectedSlideCloseLastSelectedScrollingMenDraw.bind(this),
			this._animationDuration,
			function() {
				delete this._lastActiveMenuItemIndex;
				delete this._currentHeightAnimation;
			}.bind(this)
		);
	}

	this.sendInfoOnSelectedSlideIcon();
};

VerticalCarouselMenu.prototype.sendInfoOnSelectedSlideIcon = function() {
	var icon = this._activeSlide ? this._activeSlide.dataset.icon : 'basic';

	this._sendCustomEvent(document, 'indexMenuItemSelected', {bubbles: true, detail: {icon: icon}});
};

VerticalCarouselMenu.prototype._openSelectedSlideCloseLastSelectedScrollingMenDraw = function(timePassed) {
	var height;

	for (var i = 0; i < this._listItemsCount; i++) {
		if (i == this._activeMenuItemIndex) {

			height = this._currentMenuItemsHeightArr[i] + (
				(
					(this._defaultMenuItemsHeightArr[i] + this._openedMenuItemHeightDiff - this._currentMenuItemsHeightArr[i])
					/ this._animationDuration
				) * timePassed
			);

		} else if (i === this._lastActiveMenuItemIndex) {
			height = this._currentMenuItemsHeightArr[i] + (((this._defaultMenuItemsHeightArr[i] - this._currentMenuItemsHeightArr[i])/ this._animationDuration) * timePassed);

		} else {
			height = this._currentMenuItemsHeightArr[i] + (((this._defaultMenuItemsHeightArr[i] - this._currentMenuItemsHeightArr[i])/ this._animationDuration) * timePassed);

		}

		this._listItems[i].style.height = height + 'px';
		this._listItemClones1[i].style.height = height + 'px';
		this._listItemClones2[i].style.height = height + 'px';
	}
};

/*---------------------------COLLAPSING MENU-----------------------------*/

VerticalCarouselMenu.prototype._initCollapsingMenu = function() {
	this._listItems = this._listItemContainer.querySelectorAll('.carousel_list_item');
	this._listItemsCount = this._listItems.length;

	this._defaultMenuItemsHeightArr = [];
	this._currentMenuItemsHeightArr = [];

	for (var i = 0; i < this._listItemsCount; i++) {
		this._listItems[i].dataset.slideNumber = i;
		this._defaultMenuItemsHeightArr[i] = this._listItems[i].offsetHeight;
//		this._listItems[i].style.height = this._listItems[i].offsetHeight + 'px';
	}

	this._controllListItemsHeight();

	this._addListener(this._elem, 'mouseover', this._onMouseOver);
	this._addListener(this._elem, 'mouseout', this._onMouseOut);
	this._addListener(window, 'resize', this._onCollapsingResize);
};

VerticalCarouselMenu.prototype._controllListItemsHeight = function() {
	this._defaultAdjastedMenuItemsHeight = this._heightElem.offsetHeight / this._listItemsCount;
	this._defaultAdjastedMenuItemsHeight = this._defaultAdjastedMenuItemsHeight < this._defaultMenuItemsHeightArr[0] ? this._defaultMenuItemsHeightArr[0] : this._defaultAdjastedMenuItemsHeight;

	for (var i = 0; i < this._listItemsCount; i++) {
		this._listItems[i].style.height = this._defaultAdjastedMenuItemsHeight + 'px';
	}

	this._listItemContainerHeight = this._listItemContainer.offsetHeight;
	this._collapsedMenuItemHeight = (this._listItemContainerHeight - this._defaultAdjastedMenuItemsHeight - this._openedMenuItemHeightDiff) / (this._listItemsCount - 1);
};

VerticalCarouselMenu.prototype._onCollapsingResize = function() {
	this._controllListItemsHeight();
};

VerticalCarouselMenu.prototype._onMouseOver = function(e) {
	var target = e.target;
	var selectedListItem = target.closest('[data-slide-number]');

	if (!selectedListItem || selectedListItem === this._activeSlide) return;

	this._activeSlide = selectedListItem;
	this._activeSlide.classList.add(this._activeClass);

	for (var i = 0; i < this._listItemsCount; i++) {
		this._currentMenuItemsHeightArr[i] = this._listItems[i].offsetHeight;
	}

	if (this._currentHeightAnimation) {
		this._currentHeightAnimation.stop();
	}

	if (this._lastActiveSlide) {

		this._currentHeightAnimation = new Animation(
			this._openSelectedSlideCollapseLastSelectedCollapsingMenDraw.bind(this),
			this._animationDuration,
			function() {
				delete this._lastActiveSlide;
				delete this._currentHeightAnimation;
			}.bind(this)
		);
	} else {
		this._currentHeightAnimation = new Animation(
			this._openSelectedSlideCollapseOtherCollapsingMenuDraw.bind(this),
			this._animationDuration,
			function() {
				delete this._currentHeightAnimation;
			}.bind(this)
		);
	}

	var icon = selectedListItem.dataset.icon || 'basic';

	this._sendCustomEvent(document, 'indexMenuItemSelected', {bubbles: true, detail: {icon: icon}});
};

VerticalCarouselMenu.prototype._onMouseOut = function(e) {
	var relatedTarget = e.relatedTarget;
	if (relatedTarget) {
		var newSelectedListItem = relatedTarget.closest('[data-slide-number]');

		if (newSelectedListItem) {
			if (newSelectedListItem !== this._activeSlide) {
				this._lastActiveSlide = this._activeSlide;
				this._lastActiveSlide.classList.remove(this._activeClass);
			}
			return;
		}

	}

	this._lastActiveSlide = this._activeSlide;
	if (!this._lastActiveSlide) {
		return;
	}
	this._lastActiveSlide.classList.remove(this._activeClass);
	delete this._activeSlide;

	for (var i = 0; i < this._listItemsCount; i++) {
		this._currentMenuItemsHeightArr[i] = this._listItems[i].offsetHeight;
	}

	if (this._currentHeightAnimation) {
		this._currentHeightAnimation.stop();
	}

	this._currentHeightAnimation = new Animation(
		this._closeAllSlidesCollapsingMenDraw.bind(this),
		this._animationDuration,
		function() {
			delete this._lastActiveSlide;
			delete this._currentHeightAnimation;
		}.bind(this)
	);

	var icon = 'basic';

	this._sendCustomEvent(document, 'indexMenuItemSelected', {bubbles: true, detail: {icon: icon}});
};


VerticalCarouselMenu.prototype._openSelectedSlideCollapseOtherCollapsingMenuDraw = function(timePassed) {
	var height;

	for (var i = 0; i < this._listItemsCount; i++) {
		if (this._listItems[i] === this._activeSlide) {
			height = this._currentMenuItemsHeightArr[i] + (((this._defaultAdjastedMenuItemsHeight + this._openedMenuItemHeightDiff - this._currentMenuItemsHeightArr[i]) / this._animationDuration) * timePassed);

		} else {
			height = this._currentMenuItemsHeightArr[i] + (((this._collapsedMenuItemHeight - this._currentMenuItemsHeightArr[i]) / this._animationDuration) * timePassed);

		}

		this._listItems[i].style.height = height + 'px';
	}
};

VerticalCarouselMenu.prototype._openSelectedSlideCollapseLastSelectedCollapsingMenDraw = function(timePassed) {
	var height;

	for (var i = 0; i < this._listItemsCount; i++) {
		if (this._listItems[i] === this._activeSlide) {
			height = this._currentMenuItemsHeightArr[i] + (((this._defaultAdjastedMenuItemsHeight + this._openedMenuItemHeightDiff - this._currentMenuItemsHeightArr[i])/ this._animationDuration) * timePassed);

		} else if (this._listItems[i] === this._lastActiveSlide) {
			height = this._currentMenuItemsHeightArr[i] + (((this._collapsedMenuItemHeight - this._currentMenuItemsHeightArr[i])/ this._animationDuration) * timePassed);

		} else {
			height = this._currentMenuItemsHeightArr[i] + (((this._collapsedMenuItemHeight - this._currentMenuItemsHeightArr[i])/ this._animationDuration) * timePassed);

		}

		this._listItems[i].style.height = height + 'px';
	}
};

VerticalCarouselMenu.prototype._closeAllSlidesCollapsingMenDraw = function(timePassed) {
	var height;

	for (var i = 0; i < this._listItemsCount; i++) {
		if (this._listItems[i] === this._lastActiveSlide) {
			height = this._currentMenuItemsHeightArr[i] - (((this._currentMenuItemsHeightArr[i] - this._defaultAdjastedMenuItemsHeight)/ this._animationDuration) * timePassed);

		} else {
			height = this._currentMenuItemsHeightArr[i] - (((this._currentMenuItemsHeightArr[i] - this._defaultAdjastedMenuItemsHeight)/ this._animationDuration) * timePassed);

		}

		this._listItems[i].style.height = height + 'px';
	}
};

/*--------------------------------------------------------*/

module.exports = VerticalCarouselMenu;
