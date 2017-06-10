"use strict";

var Helper = require('./helper');

function Dropdown(options) {
	options.name = options.name || 'Dropdown';
	Helper.call(this, options);

	this._elem = options.elem;
	if (options.cancelDropdownOnGreaterThan) {
		this._cancelDropdownOnGreaterThan = options.cancelDropdownOnGreaterThan;
	}
	this._horizontal = options.horizontal ? true : false;
	this._dropdownContainer = this._elem.querySelector(options.dropdownContainerSelector);
	this._dropdownBar = this._dropdownContainer.querySelector(options.dropdownBarSelector);
	this._transitionDuration = options.transitionDuration || 0.5;
	this._openBtnSelector = options.openBtnSelector;
	this._calcuateDropdownSizeCodeString = options.calcuateDropdownSizeCodeString || false;
	if (this._elem.classList.contains('open')) {
		this._state = 'open';
	} else {
		this._state = 'closed';
	}

	this._sendEventsOnToggle = options.sendEventsOnToggle;
	this._canceled = this._checkForMaxSizeLimit();

	this._horizontal ? this._initWidth() : this._initHeight();

	this._onClick = this._onClick.bind(this);
	this._onSignalToCloseDropdown = this._onSignalToCloseDropdown.bind(this);
	this._watchForMaxSize = this._watchForMaxSize.bind(this);

	this._addListener(this._elem, 'click', this._onClick);
	if (options.closeOnResize) {
		this._addListener(window, 'resize', this._onSignalToCloseDropdown);
	}
	if (options.listenToCloseSignal) {
		this._addListener(document, 'signaltoclosedropdown', this._onSignalToCloseDropdown);
	}
	if (this._cancelDropdownOnGreaterThan) {
		this._addListener(window, 'resize', this._watchForMaxSize);
	}
}

Dropdown.prototype = Object.create(Helper.prototype);
Dropdown.prototype.constructor = Dropdown;

Dropdown.prototype._initHeight = function() {
	if (this._canceled) return;
	this._dropdownContainer.style.height = this._checkHeight() + 'px';
};

Dropdown.prototype._initWidth = function() {
	if (this._canceled) return;
	this._dropdownContainer.style.width = this._checkWidth() + 'px';
};

Dropdown.prototype._removeHeight = function() {
	this._dropdownContainer.style.height = '';
};

Dropdown.prototype._removeWidth = function() {
	this._dropdownContainer.style.width = '';
};

Dropdown.prototype._onClick = function(e) {
	var target = e.target;

	this._preventDefaultCheck(e);
	if (this._canceled) return;
	this._toggleDropdown(target, e);

	return target;
};

Dropdown.prototype._checkHeight = function() {
	if (this._state === 'closed') {
		return 0;
	} else if (this._state === 'open') {
		return this._calcuateDropdownSizeCodeString ? eval(this._calcuateDropdownSizeCodeString) : this._dropdownBar.offsetHeight;
	}
};

Dropdown.prototype._checkWidth = function() {
	if (this._state === 'closed') {
		return 0;
	} else if (this._state === 'open') {
		return this._calcuateDropdownSizeCodeString ? eval(this._calcuateDropdownSizeCodeString) : this._dropdownBar.offsetWidth;
	}
};

Dropdown.prototype._toggleDropdown = function(target, e) {
	var dropdownToggle;

	if (target) {
		dropdownToggle = target.closest(this._openBtnSelector);
	} else {
		dropdownToggle = true;
	}

	if (dropdownToggle) {
		if (e) {
			e.preventDefault();
		}

		if (this._state === 'closed') {
			this._openDropdown();
		} else {
			this._closeDropdown();
		}

		if (this._sendEventsOnToggle) {
			this._sendCustomEvent(this._elem, 'dropdowntoggle', {
				bubbles: true,
				detail: {
					state: this._state
				}
			});
		}

		return true;
	}

	return false;
};

Dropdown.prototype._openDropdown = function() {
	this._state = 'open';
	this._elem.classList.add('open');
	this._elem.classList.remove('closed');

	if (this._closeTimer) {
		clearTimeout(this._closeTimer);
		delete this._closeTimer;
	}

	if (this._horizontal) {
		this._changeDropdownWidth(this._checkWidth(), function(){
			this._openTimer = setTimeout(function(){
				if (!this._elem || !this._dropdownContainer) return;
				delete this._openTimer;
				this._removeTransition(this._dropdownContainer);
			}.bind(this), this._transitionDuration * 1000);
		}.bind(this));

	} else {
		this._changeDropdownHeight(this._checkHeight(), function(){
			this._openTimer = setTimeout(function(){
				if (!this._elem || !this._dropdownContainer) return;
				delete this._openTimer;
				this._removeTransition(this._dropdownContainer);
			}.bind(this), this._transitionDuration * 1000);
		}.bind(this));

	}
};

Dropdown.prototype._closeDropdown = function() {

	this._state = 'closed';
	this._elem.classList.remove('open');

	if (this._openTimer) {
		clearTimeout(this._openTimer);
		delete this._openTimer;
	}

	if (this._horizontal) {
		this._changeDropdownWidth(this._checkWidth(), function(){
			this._closeTimer = setTimeout(function(){
				if (!this._elem || !this._dropdownContainer) return;
				delete this._closeTimer;
				this._removeTransition(this._dropdownContainer);
				this._elem.classList.add('closed');
			}.bind(this), this._transitionDuration * 1000);
		}.bind(this));

	} else {
		this._changeDropdownHeight(this._checkHeight(), function(){
			this._closeTimer = setTimeout(function(){
				if (!this._elem || !this._dropdownContainer) return;
				delete this._closeTimer;
				this._removeTransition(this._dropdownContainer);
				this._elem.classList.add('closed');
			}.bind(this), this._transitionDuration * 1000);
		}.bind(this));

	}
};

Dropdown.prototype._changeDropdownHeight = function(newHeight, callback) {
	this._addTransition(this._dropdownContainer);
	this._dropdownContainer.style.height = newHeight + 'px';
	callback();
};

Dropdown.prototype._changeDropdownWidth = function(newWidth, callback) {
	this._addTransition(this._dropdownContainer);
	this._dropdownContainer.style.width = newWidth + 'px';
	callback();
};

Dropdown.prototype._addTransition = function(elem) {
	elem.style.transitionProperty = this._horizontal ? 'width' : 'height';
	elem.style.transitionTiminFunction = 'ease';
	elem.style.transitionDelay = 0 + 's';
	elem.style.transitionDuration = this._transitionDuration + 's';
};

Dropdown.prototype._removeTransition = function(elem) {
	elem.style.transitionProperty = '';
	elem.style.transitionTiminFunction = '';
	elem.style.transitionDelay = '';
	elem.style.transitionDuration = '';
};

Dropdown.prototype._preventDefaultCheck = function(e) {
	if (e.target.hasAttribute('data-preventDefaultUntil') &&
		window.innerWidth < e.target.getAttribute('data-preventDefaultUntil')) {
		e.preventDefault();
	}
};

Dropdown.prototype._onSignalToCloseDropdown = function(e) {
	var check = false;

	if (e.type === 'signaltoclosedropdown') {
		var targetDropdownSelector = e.detail.targetDropdownSelector;
		var targetDropdownElem = e.detail.targetDropdownElem;

		if (
			(targetDropdownSelector && this._elem.matches(targetDropdownSelector)) ||
			(targetDropdownElem && this._elem === targetDropdownElem)
		) {
			check = true;
		}
	} else if (e.type === 'resize') {
		check = true;
	}

	if (check && this._state === 'open') {
		this._toggleDropdown();
	}
};

Dropdown.prototype._checkForMaxSizeLimit = function() {
	return this._cancelDropdownOnGreaterThan && window.innerWidth > this._cancelDropdownOnGreaterThan
};

Dropdown.prototype._watchForMaxSize = function() {
	if (this._canceled && !this._checkForMaxSizeLimit()) {
		this._canceled = false;
		if (this._horizontal) {
			this._initWidth();
		} else {
			this._initHeight();
		}
	} else if (!this._canceled && this._checkForMaxSizeLimit()) {
		this._canceled = true;
		this._removeHeight();
		this._removeWidth();
	}

};

module.exports = Dropdown;
