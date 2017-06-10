"use strict";

var Helper = require('./helper');
var Animation = require('./animation');

function Menu(options) {
	options.name = options.name || 'Menu';
	Helper.call(this, options);

	this._elem = options.elem;
	this._animationDuration = options.animationDuration || 500;
	this._openBtnSelector = options.openBtnSelector;
	this._offsetElem = options.offsetElem;

	this._onClick = this._onClick.bind(this);
	this._onResize = this._onResize.bind(this);

	this._init(options);
}

Menu.prototype = Object.create(Helper.prototype);
Menu.prototype.constructor = Menu;

Menu.prototype._init = function(options) {
	this._dropdownContainer = this._elem.querySelector(options.dropdownContainerSelector);

	var offset = this._offsetElem ? this._offsetElem.offsetWidth : 0;

	this._dropdownContainer.style.right = -1 * ((this._dropdownContainer.offsetWidth + window.innerWidth - this._elem.getBoundingClientRect().right) - offset) + 'px';
	this._state = 'closed';

	this._addListener(this._elem, 'click', this._onClick);
	this._addListener(window, 'resize', this._onResize);
};

Menu.prototype._onClick = function(e) {
	var target = e.target;
	if (!target) return;

	var dropdownToggle = target.closest(this._openBtnSelector);
	if (!dropdownToggle) return;

	if (this._state === 'closed') {
		this._openMenu();

	} else if (this._state === 'open') {
		this._closeMenu();

	}
};

Menu.prototype._openMenu = function() {
	this._endRight = 0;
	this._toggleMenu();

	if (this._elem.classList.contains('closed')) {
		this._elem.classList.remove('closed');
	}
	this._elem.classList.add('open');

	this._state = 'open';
};

Menu.prototype._closeMenu = function() {
	var offset = this._offsetElem ? this._offsetElem.offsetWidth : 0;

	this._endRight = -1 * ((this._dropdownContainer.offsetWidth + window.innerWidth - this._elem.getBoundingClientRect().right) - offset);
	this._toggleMenu();

	if (this._elem.classList.contains('open')) {
		this._elem.classList.remove('open');
	}
	this._elem.classList.add('closed');

	this._state = 'closed';
};

Menu.prototype._toggleMenu = function() {
	var startRight = parseFloat(getComputedStyle(this._dropdownContainer).right);

	if (this._currentAnimation) {
		this._currentAnimation.stop();
	}

	this._currentAnimation = new Animation(
		function(timePassed){
			var timeMultiplier = Animation.quadEaseInOut(this._animationDuration, timePassed);
			var curRight = startRight + ((this._endRight - startRight) * (timeMultiplier));

			this._dropdownContainer.style.right = curRight + 'px';
		}.bind(this),
		this._animationDuration,
		function() {
			delete this._endRight;
			delete this._currentAnimation;
		}.bind(this)
	);
};

Menu.prototype._onResize = function() {
	if (this._currentAnimation) {
		if (this._state === 'closed') {
			var offset = this._offsetElem ? this._offsetElem.offsetWidth : 0;
			this._endRight = -1 * ((this._dropdownContainer.offsetWidth + window.innerWidth - this._elem.getBoundingClientRect().right) - offset);

		} else if (this._state === 'open') {
			this._endRight = 0;

		}

	} else {
		if (this._state === 'closed') {
			var offset = this._offsetElem ? this._offsetElem.offsetWidth : 0;
			this._dropdownContainer.style.right = -1 * ((this._dropdownContainer.offsetWidth + window.innerWidth - this._elem.getBoundingClientRect().right) - offset) + 'px';

		} else if (this._state === 'open') {
			this._dropdownContainer.style.right = 0;

		}

	}
};

module.exports = Menu;
