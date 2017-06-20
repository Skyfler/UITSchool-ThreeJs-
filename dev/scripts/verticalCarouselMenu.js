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
	this._getCurrentMouseCoords = this._getCurrentMouseCoords.bind(this);
	this._stopRecordingSpeed = this._stopRecordingSpeed.bind(this);

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

	if (this._currentTopAnimation) {
		this._currentTopAnimation.stop();
		delete this._currentTopAnimation;
	}

	this._cancelMovingOnMomentum();

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

	if (this._currentHeightAnimation) {
		this._currentHeightAnimation.stop();
	}

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

VerticalCarouselMenu.prototype.setActive = function(bool) {
	this._active = !!bool;
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

	this._listContainer.insertBefore(this._listItemContainerClone1, this._listContainer.children[0]);
	this._listContainer.appendChild(this._listItemContainerClone2);

	this.setActive(false);

	this._manageActiveLIClass(0, true);
	this._centerSelectedListItem(0, true);

	this._addListener(this._elem, 'mousedown', this._onMouseDown);
	this._addListener(this._elem, 'touchstart', this._onMouseDown);
	this._addListener(window, 'resize', this._onScrollingResize);
	this._addListener(this._elem, 'dragstart', this._onDragStart);
};

VerticalCarouselMenu.prototype._onDragStart = function(e) {
	e.preventDefault();
};

VerticalCarouselMenu.prototype._onMouseDown = function(e) {
	this._startDrag(e);
	this._startRecordingSpeed(e);
};

VerticalCarouselMenu.prototype._onMouseUp = function(e) {
	this._stopDrag(e);
};

VerticalCarouselMenu.prototype._cancelMovingOnMomentum = function() {
	if (this._recordSpeedRequestId) {
		cancelAnimationFrame(this._recordSpeedRequestId);
		delete this._recordSpeedRequestId;
	}

	this._removeListener(document, 'mousemove', this._getCurrentMouseCoords);
	this._removeListener(document, 'touchmove', this._getCurrentMouseCoords);
	this._removeListener(document, 'mouseup', this._stopRecordingSpeed);
	this._removeListener(document, 'touchend', this._stopRecordingSpeed);

	delete this._currentTopAnimation;
	delete this._currentScrollSpeed;
	delete this._speedDirection;
	delete this._timePointsArr;
};

VerticalCarouselMenu.prototype._startRecordingSpeed = function(e) {
	if (this._recordSpeedRequestId) {
		cancelAnimationFrame(this._recordSpeedRequestId);
		delete this._recordSpeedRequestId;
	}

	this._clientX = (e.clientX === undefined) ? e.touches[0].clientX : e.clientX;
	this._clientY = (e.clientY === undefined) ? e.touches[0].clientY : e.clientY;

	this._timePointsArr = [{clientY: this._clientY, time: performance.now()}];

	this._addListener(document, 'mousemove', this._getCurrentMouseCoords);
	this._addListener(document, 'touchmove', this._getCurrentMouseCoords);
	this._addListener(document, 'mouseup', this._stopRecordingSpeed);
	this._addListener(document, 'touchend', this._stopRecordingSpeed);
	this._recordSpeedRequestId = requestAnimationFrame(this._getScrollingYSpeed.bind(this));
};

VerticalCarouselMenu.prototype._getCurrentMouseCoords = function(e) {
	this._clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX;
	this._clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;
};

VerticalCarouselMenu.prototype._stopRecordingSpeed = function(e) {
	this._removeListener(document, 'mousemove', this._getCurrentMouseCoords);
	this._removeListener(document, 'touchmove', this._getCurrentMouseCoords);
	this._removeListener(document, 'mouseup', this._stopRecordingSpeed);
	this._removeListener(document, 'touchend', this._stopRecordingSpeed);

	if (this._recordSpeedRequestId) {
		cancelAnimationFrame(this._recordSpeedRequestId);
		delete this._recordSpeedRequestId;
	}

	this._keepMovingOnMomentum();
};

VerticalCarouselMenu.prototype._clearTimePointsArr = function(now) {
	for (var i = 0; i < this._timePointsArr.length; i++) {
		if (now - this._timePointsArr[i].time > 100 && this._timePointsArr.length > 1) {
			this._timePointsArr.splice(i, 1);
		}
	}
};

VerticalCarouselMenu.prototype._getScrollingYSpeed = function(now) {
	this._clearTimePointsArr(now);

	this._timePointsArr.push({time: now, clientY: this._clientY});

	var timePassedFromArray = now - this._timePointsArr[0].time,
		clientYDeltaFromArray = 0;
	for (var i = 0; i < this._timePointsArr.length - 1; i++) {
		clientYDeltaFromArray += Math.abs(this._timePointsArr[i + 1].clientY - this._timePointsArr[i].clientY);
	}
	var secondsPassedFromArray = timePassedFromArray / 1000;
	var speedPerSecFromArray = clientYDeltaFromArray / secondsPassedFromArray;

	this._currentScrollSpeed = speedPerSecFromArray;

	this._speedDirection = (this._timePointsArr[this._timePointsArr.length - 1].clientY - this._timePointsArr[this._timePointsArr.length - 2].clientY) >= 0 ? 1 : -1 ;
	this._recordSpeedRequestId = requestAnimationFrame(this._getScrollingYSpeed.bind(this));
};

VerticalCarouselMenu.prototype._keepMovingOnMomentum = function() {
	var self = this;
	function onEndOfMomentum() {
		self._movingOnMomentum = false;
		delete self._currentTopAnimation;
		delete self._currentScrollSpeed;
		delete self._speedDirection;
		self._controllSelectedListItemOnStopDrag();
		self._centerSelectedListItem(self._activeMenuItemIndex);
	}

	if (!this._currentScrollSpeed || this._currentScrollSpeed <= 0) {
		onEndOfMomentum();
		return;
	}

	this._movingOnMomentum = true;

	if (this._currentTopAnimation) {
		this._currentTopAnimation.stop();
		delete this._currentTopAnimation;
	}

	var speedDecreasePerSecond = 600;
	var momentumDuration = this._currentScrollSpeed / speedDecreasePerSecond * 1000;

	var V0 = this._currentScrollSpeed,
		V = 0,
		t0 = 0,
		t = momentumDuration / 1000,
		a = (V - V0) / (t - t0),
		s = (V0 * t) - (a * t * t) / 2;

	var prevS = 0;
	var code = Math.random();

	this._currentTopAnimation = new Animation(
		function(timePassed) {
			var startListContainerTop = this._listContainer.offsetTop;

			var timeMultiplier = Animation.circEaseOut(momentumDuration, timePassed);
			var currentS = s / 10 * timeMultiplier - prevS;
			prevS += currentS;
			var newTop = this._controllListContainerPosition(startListContainerTop + currentS * this._speedDirection);

			this._listContainer.style.top = newTop + 'px';
			if (currentS < 0.5 && timePassed > 1) {
				this._currentTopAnimation.stop(true);
			}
		}.bind(this),
		momentumDuration,
		onEndOfMomentum
	);
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
	if (this._currentTopAnimation) {
		this._currentTopAnimation.stop();
		delete this._currentTopAnimation;
	}

	var clientX = (e.clientX === undefined) ? e.touches[0].clientX : e.clientX;
	var clientY = (e.clientY === undefined) ? e.touches[0].clientY : e.clientY;

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

	var deltaX = Math.abs(this._startCursorXPosition - clientX);
	var deltaY = Math.abs(this._startCursorYPosition - clientY);
	if (deltaX > 10 || deltaY > 10) {
		e.preventDefault();
	}

	this._removeListener(document, 'mousemove', this._onMouseMoveDrag);
	this._removeListener(document, 'touchmove', this._onMouseMoveDrag);
	this._removeListener(document, 'mouseup', this._onMouseUp);
	this._removeListener(document, 'touchend', this._onMouseUp);

//	this._centerSelectedListItem(this._activeMenuItemIndex);
};

VerticalCarouselMenu.prototype._onMouseMoveDrag = function(e) {
	var clientY = e.clientY || e.touches[0].clientY;

	var currentcursorYPosition = clientY + (window.pageYOffset || document.documentElement.scrollTop);
	var yPositionDeleta = this._startCursorYPosition - currentcursorYPosition;

	var newtListContainerYPosition = this._startListContainerYPosition - yPositionDeleta;
	newtListContainerYPosition = this._controllListContainerPosition(newtListContainerYPosition);

	this._controllSelectedListItemOnDrag();
	this._listContainer.style.top = newtListContainerYPosition + 'px';
};

VerticalCarouselMenu.prototype._controllListContainerPosition = function(newtListContainerYPosition) {
	this._listOverflowContainerCenter = this._listOverflowContainerHeight / 2;

	if (-1 * newtListContainerYPosition > this._listItemContainer.offsetHeight * 2 - this._listOverflowContainerHeight / 2) {
		newtListContainerYPosition += this._listItemContainer.offsetHeight;
		newtListContainerYPosition = this._controllListContainerPosition(newtListContainerYPosition);

	} else if (-1 * newtListContainerYPosition < this._listItemContainer.offsetHeight - this._listOverflowContainerHeight / 2) {
		newtListContainerYPosition -= this._listItemContainer.offsetHeight;
		newtListContainerYPosition = this._controllListContainerPosition(newtListContainerYPosition);

	}

	return newtListContainerYPosition;
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
//		console.log(this.NAME + ': STOP animation!');
		delete this._currentTopAnimation;
	}

	if (noTransition) {
		this._listContainer.style.top = endListContainerTop + 'px';

	} else {
//		console.log(this.NAME + ': NEW animation!');
		this._currentTopAnimation = new Animation(
			function(timePassed) {
				var top = startListContainerTop + (((endListContainerTop - startListContainerTop) / this._animationDuration) * timePassed);
				this._listContainer.style.top = top + 'px';
			}.bind(this),
			this._animationDuration,
			function() {
//				console.log(this.NAME + ': STOP animation!');
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

//	console.log(this.NAME + ': calling sendInfoOnSelectedSlideIcon on SELF');
	this.sendInfoOnSelectedSlideIcon();
};

VerticalCarouselMenu.prototype.sendInfoOnSelectedSlideIcon = function() {
//	console.log({
//		name: this.NAME,
//		active: this._active,
//		activeSlide: this._activeSlide,
//		icon: this._activeSlide ? this._activeSlide.dataset.icon : 'basic'
//	});
	if (!this._active) return;
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

	this.setActive(true);

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
