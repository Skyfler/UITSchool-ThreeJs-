"use strict";

try {
	var Helper = require('./helper');
	var _smoothScroll = require('./smoothScroll');
} catch (err) {
	console.warn(err);
}

function ScrollToContact(options) {
	options.name = options.name || 'ScrollToContact';
	Helper.call(this, options);

	this._scrollDuration = options.scrollDuration || 0;

	this._onClick = this._onClick.bind(this);

	this._init();
}

ScrollToContact.prototype = Object.create(Helper.prototype);
ScrollToContact.prototype.constructor = ScrollToContact;

ScrollToContact.prototype._init = function() {
	this._addListener(document, 'click', this._onClick);
};

ScrollToContact.prototype._onClick = function(e) {
	var target = e.target;
	var scrollBtn = target.closest('[data-slide="course_contact_form"]');
	var scrollTarget = document.querySelector('#course_contact_form');

	if (!scrollBtn || !scrollTarget || this._checkScreenWidth() === 'lg') {
		return;
	}

	_smoothScroll.scrollTo(
		_smoothScroll.getPageScrollElem(),
		_smoothScroll.getCoords(scrollTarget).top,
		this._scrollDuration
	);
};

try {
	module.exports = ScrollToContact;
} catch (err) {
	console.warn(err);
}
