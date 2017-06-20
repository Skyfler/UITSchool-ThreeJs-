"use strict";

var Helper = require('./helper');
var VerticalCarouselMenu = require('./verticalCarouselmenu');

function IndexMenuController(options) {
	options.name = options.name || 'IndexMenuController';
	Helper.call(this, options);

	this._elem = options.elem;
	this._switchBreakpoint = options.switchBreakpoint || 0;
	this._columnBreakpoint = options.columnBreakpoint || 0;
	this._activeClass = options.activeClass || 'active_menu';

	this._onResize = this._onResize.bind(this);
	this._onMouseOver = this._onMouseOver.bind(this);

	this._init();
}

IndexMenuController.prototype = Object.create(Helper.prototype);
IndexMenuController.prototype.constructor = IndexMenuController;

IndexMenuController.prototype.remove = function() {
	if (this._carouselMenuLeft && this._carouselMenuLeft.remove) {
		this._carouselMenuLeft.remove();
	}
	if (this._carouselMenuRight && this._carouselMenuRight.remove) {
		this._carouselMenuRight.remove();
	}

	Helper.prototype.remove.apply(this, arguments);
};

IndexMenuController.prototype._init = function() {
	this._controllHeight();

	if (window.innerWidth < this._switchBreakpoint) {
		this._mode = 'scrolling';
	} else {
		this._mode = 'collapsing';
	}

	this._columns = 2;

	this._carouselMenuLeftLICopyArr = [];
	this._carouselMenuRightLICopyArr = [];

	this._carouselMenuLeftElem = this._elem.querySelector('#carousel_menu_left');
	this._carouselMenuRightElem = this._elem.querySelector('#carousel_menu_right');

	var listItemsRight = this._carouselMenuRightElem.querySelectorAll('.carousel_list_item');
	var listItemsLeft = this._carouselMenuLeftElem.querySelectorAll('.carousel_list_item');

	this._listItemContainerRight = this._carouselMenuRightElem.querySelector('.carousel_list_item_container');
	this._listItemContainerLeft = this._carouselMenuLeftElem.querySelector('.carousel_list_item_container');

	for (var i = 0; i < listItemsRight.length; i++) {
		this._carouselMenuRightLICopyArr[i] = listItemsRight[i].cloneNode(true);
	}
	for (var i = 0; i < listItemsLeft.length; i++) {
		this._carouselMenuLeftLICopyArr[i] = listItemsLeft[i].cloneNode(true);
	}


	if (this._carouselMenuLeftElem) {
		this._carouselMenuLeft = new VerticalCarouselMenu({
			elem: this._carouselMenuLeftElem,
			openedMenuItemHeightDiff: 30,
			mode: this._mode,
			heightElem: this._elem
		});
	}
	if (this._carouselMenuRightElem) {
		this._carouselMenuRight = new VerticalCarouselMenu({
			elem: this._carouselMenuRightElem,
			openedMenuItemHeightDiff: 30,
			mode: this._mode,
			heightElem: this._elem
		});
	}

	if (this._carouselMenuLeft && this._carouselMenuLeft.remove) {
		this._carouselMenuLeftElem.classList.add(this._activeClass);
		this._carouselMenuLeft.setActive(true);
		this._activeMenu = this._carouselMenuLeftElem;
//		console.log(this.NAME + ': calling sendInfoOnSelectedSlideIcon on _carouselMenuLeft');
		this._carouselMenuLeft.sendInfoOnSelectedSlideIcon();

	} else if (this._carouselMenuRight && this._carouselMenuRight.remove && !this._carouselMenuLeft) {
		this._carouselMenuRightElem.classList.add(this._activeClass);
		this._carouselMenuRight.setActive(true);
		this._activeMenu = this._carouselMenuRightElem;
//		console.log(this.NAME + ': calling sendInfoOnSelectedSlideIcon on _carouselMenuRight');
		this._carouselMenuLeft.sendInfoOnSelectedSlideIcon();

	}

	this._controllColumnsBreakpoint();

	this._sendCustomEvent(document, 'indexMenuInitialisationComplete', {bubbles: true});

	this._addListener(window, 'resize', this._onResize);
	this._addListener(this._elem, 'mouseover', this._onMouseOver);
	this._addListener(this._elem, 'touchstart', this._onMouseOver);
};

IndexMenuController.prototype._onResize = function() {
	this._controllHeight();
	this._controllColumnsBreakpoint();
	this._controllSwitchBreakpoint();
};

IndexMenuController.prototype._controllSwitchBreakpoint = function() {
	if (window.innerWidth < this._switchBreakpoint && this._mode === 'collapsing') {
		if (this._carouselMenuLeft) {
			this._carouselMenuLeft._switchMenuMode();
//			console.log(this.NAME + ': Setting active _carouselMenuLeft');
			this._carouselMenuLeft.setActive(true);
//			console.log(this.NAME + ': calling sendInfoOnSelectedSlideIcon on _carouselMenuLeft');
			this._carouselMenuLeft.sendInfoOnSelectedSlideIcon();
		}
		if (this._carouselMenuRight) {
			this._carouselMenuRight._switchMenuMode();
			if (!this._carouselMenuLeft) {
//				console.log(this.NAME + ': Setting active _carouselMenuRight');
				this._carouselMenuRight.setActive(true);
//				console.log(this.NAME + ': calling sendInfoOnSelectedSlideIcon on _carouselMenuRight');
				this._carouselMenuRight.sendInfoOnSelectedSlideIcon();
			}
		}
		this._mode = 'scrolling';

	} else if (window.innerWidth >= this._switchBreakpoint && this._mode === 'scrolling') {
		if (this._carouselMenuLeft) {
			this._carouselMenuLeft._switchMenuMode();
//			console.log(this.NAME + ': calling sendInfoOnSelectedSlideIcon on _carouselMenuLeft');
			this._carouselMenuLeft.sendInfoOnSelectedSlideIcon();
		}
		if (this._carouselMenuRight) {
			this._carouselMenuRight._switchMenuMode();
			if (!this._carouselMenuLeft) {
//				console.log(this.NAME + ': calling sendInfoOnSelectedSlideIcon on _carouselMenuRight');
				this._carouselMenuRight.sendInfoOnSelectedSlideIcon();
			}
		}
		this._mode = 'collapsing';

	}
};

IndexMenuController.prototype._controllColumnsBreakpoint = function() {
	if (window.innerWidth < this._columnBreakpoint && this._columns === 2) {
		this._switchFromTwoColumnsToOne();
		this._columns = 1;

	} else if (window.innerWidth >= this._columnBreakpoint && this._columns === 1) {
		this._switchFromOneColumnToTwo();
		this._columns = 2;

	}
};

IndexMenuController.prototype._switchFromTwoColumnsToOne = function() {
	this._carouselMenuLeftElem.classList.remove(this._activeClass);
	this._carouselMenuRightElem.classList.remove(this._activeClass);

	this._carouselMenuRight.remove();
	this._carouselMenuLeft.remove();
	delete this._carouselMenuRight;
	delete this._carouselMenuLeft;

	var listItemContainerLeftNewContent = '';

	var listItemContainerRightNewContent = document.createDocumentFragment();

	for (var i = 0; i < this._carouselMenuRightLICopyArr.length; i++) {
		listItemContainerRightNewContent.appendChild(this._carouselMenuRightLICopyArr[i].cloneNode(true));
	}
	for (var i = 0; i < this._carouselMenuLeftLICopyArr.length; i++) {
		listItemContainerRightNewContent.appendChild(this._carouselMenuLeftLICopyArr[i].cloneNode(true));
	}

	this._listItemContainerLeft.innerHTML = '';
	this._listItemContainerRight.innerHTML = '';
	this._listItemContainerRight.appendChild(listItemContainerRightNewContent);

	this._carouselMenuRight = new VerticalCarouselMenu({
		elem: this._carouselMenuRightElem,
		openedMenuItemHeightDiff: 30,
		mode: this._mode,
		heightElem: this._elem
	});

	this._carouselMenuRightElem.classList.add(this._activeClass);
	this._carouselMenuRight.setActive(true);
//	console.log(this.NAME + ': calling sendInfoOnSelectedSlideIcon on _carouselMenuRight');
	this._carouselMenuRight.sendInfoOnSelectedSlideIcon();
};

IndexMenuController.prototype._switchFromOneColumnToTwo = function() {
	this._carouselMenuRightElem.classList.remove(this._activeClass);
	this._carouselMenuRight.remove();
	delete this._carouselMenuRight;

	var listItemContainerLeftNewContent = document.createDocumentFragment();
	var listItemContainerRightNewContent = document.createDocumentFragment();

	for (var i = 0; i < this._carouselMenuRightLICopyArr.length; i++) {
		listItemContainerRightNewContent.appendChild(this._carouselMenuRightLICopyArr[i].cloneNode(true));
	}
	for (var i = 0; i < this._carouselMenuLeftLICopyArr.length; i++) {
		listItemContainerLeftNewContent.appendChild(this._carouselMenuLeftLICopyArr[i].cloneNode(true));
	}

	this._listItemContainerLeft.innerHTML = '';
	this._listItemContainerRight.innerHTML = '';
	this._listItemContainerLeft.appendChild(listItemContainerLeftNewContent);
	this._listItemContainerRight.appendChild(listItemContainerRightNewContent);

	this._carouselMenuRight = new VerticalCarouselMenu({
		elem: this._carouselMenuRightElem,
		openedMenuItemHeightDiff: 30,
		mode: this._mode,
		heightElem: this._elem
	});
	this._carouselMenuLeft = new VerticalCarouselMenu({
		elem: this._carouselMenuLeftElem,
		openedMenuItemHeightDiff: 30,
		mode: this._mode,
		heightElem: this._elem
	});

	this._carouselMenuRight.setActive(false);
	this._carouselMenuLeftElem.classList.add(this._activeClass);
	this._carouselMenuLeft.setActive(true);
//	console.log(this.NAME + ': calling sendInfoOnSelectedSlideIcon on _carouselMenuLeft');
	this._carouselMenuLeft.sendInfoOnSelectedSlideIcon();
};

IndexMenuController.prototype._onMouseOver = function(e) {
	var target = e.target;

	this._controllActiveClass(target);
};

IndexMenuController.prototype._controllActiveClass = function(elem) {
	var containsRightMenuElem = this._carouselMenuRightElem.contains(elem);
	var containsLeftMenuElem = this._carouselMenuLeftElem.contains(elem);

	if (containsRightMenuElem && this._activeMenu === this._carouselMenuLeftElem && this._carouselMenuRight && this._carouselMenuRight.remove) {
		this._activeMenu = this._carouselMenuRightElem;
		this._carouselMenuLeftElem.classList.remove(this._activeClass);
		if (this._carouselMenuLeft) {
			this._carouselMenuLeft.setActive(false);
		}
		this._carouselMenuRightElem.classList.add(this._activeClass);
		this._carouselMenuRight.setActive(true);

//		console.log(this.NAME + ': calling sendInfoOnSelectedSlideIcon on _carouselMenuRight');
		this._carouselMenuRight.sendInfoOnSelectedSlideIcon();

	} else if (containsLeftMenuElem && this._activeMenu === this._carouselMenuRightElem && this._carouselMenuLeft && this._carouselMenuLeft.remove) {
		this._activeMenu = this._carouselMenuLeftElem;
		this._carouselMenuRightElem.classList.remove(this._activeClass);
		this._carouselMenuRight.setActive(false);
		this._carouselMenuLeftElem.classList.add(this._activeClass);
		this._carouselMenuLeft.setActive(true);

//		console.log(this.NAME + ': calling sendInfoOnSelectedSlideIcon on _carouselMenuLeft');
		this._carouselMenuLeft.sendInfoOnSelectedSlideIcon();
	}
};

IndexMenuController.prototype._controllHeight = function() {
	var height = 0;
	var width = this._checkScreenWidth();
	if (width === 'xs') {
		height = window.innerHeight - 90 - 90;
	} else if (width === 'sm' || width === 'md') {
		height = window.innerHeight - 90 - 130;
	} else if (width === 'lg') {
		height = window.innerHeight - 130 - 130;
	}

	this._elem.style.height = height + 'px';
};

module.exports = IndexMenuController;
