"use strict";

try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function AnimatedPlaceholder(options) {
	options.name = options.name || 'AnimatedPlaceholder';
	Helper.call(this, options);

	this._elem = options.elem;

	this._onFocus = this._onFocus.bind(this);
	this._onBlur = this._onBlur.bind(this);

	this._init();
}

AnimatedPlaceholder.prototype = Object.create(Helper.prototype);
AnimatedPlaceholder.prototype.constructor = AnimatedPlaceholder;

AnimatedPlaceholder.prototype._init = function() {
	this._palceholderElem = this._elem.querySelector('.placeholder_elem');
	if (!this._palceholderElem) {
		console.warn(this.NAME + ': Placeholder Elem is not Found!');
		return;
	}
	this._targetElem = this._elem.querySelector('.placeholder_target');
	if (!this._targetElem) {
		console.warn(this.NAME + ': Placeholder Target Elem is not Found!');
		return;
	}

	this._addListener(this._elem, 'focus', this._onFocus, true);
	this._addListener(this._elem, 'blur', this._onBlur, true);
};

AnimatedPlaceholder.prototype._onFocus = function(e) {
	var target = e.target;
	if (!target || target !== this._targetElem) return;

	this._elem.classList.add('focus');
	if (!this._placeholderRemoved) {
		this._elem.classList.add('placeholder_removed');
		this._placeholderRemoved = true;
	}
};

AnimatedPlaceholder.prototype._onBlur = function(e) {
	var target = e.target;
	if (!target || target !== this._targetElem) return;

	this._elem.classList.remove('focus');

	if (this._delay) {
		clearTimeout(this._delay);
	}
	this._delay = setTimeout(function(){
		delete this._delay;
		this._onBlurAfterDelay(target);
	}.bind(this), 100);
};

AnimatedPlaceholder.prototype._onBlurAfterDelay = function(target) {
	var customElem = target.closest('.custom_form_elem'),
		value;

	if (!customElem) {
		value = target.value;
	} else {
		value = customElem.dataset.value;
	}

	if (!value) {
		this._elem.classList.remove('placeholder_removed');
		this._placeholderRemoved = false;
	}
};

try {
	module.exports = AnimatedPlaceholder;
} catch (err) {
	console.warn(err);
}
