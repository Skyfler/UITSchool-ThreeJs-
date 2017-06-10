"use strict";

var Helper = require('./helper');

function AnimatedPlaceholder(options) {
	options.name = options.name || 'AnimatedPlaceholder';
	Helper.call(this, options);

	this._elem = options.elem;

	this._onFocus = this._onFocus.bind(this);

	this._init();
}

AnimatedPlaceholder.prototype = Object.create(Helper.prototype);
AnimatedPlaceholder.prototype.constructor = AnimatedPlaceholder;

AnimatedPlaceholder.prototype._init = function() {
	this._palceholderElem = this._elem.querySelector('placeholder_elem');

	this._addListener(this._elem, 'focus', this._onFocus, true);
};

AnimatedPlaceholder.prototype._onFocus = function() {
	if (!this._placeholderRemoved) {
		this._elem.classList.add('placeholder_removed');
		this._placeholderRemoved = true;
	}
};

module.exports = AnimatedPlaceholder;
