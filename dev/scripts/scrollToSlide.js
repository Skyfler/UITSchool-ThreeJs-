"use strict";

try {
	var Helper = require('./helper');
	var _smoothScroll = require('./smoothScroll');
} catch (err) {
	console.warn(err);
}

function ScrollToSlide(options) {
	options.name = options.name || 'ScrollToSlide';
	Helper.call(this, options);

	this._scrollDuration = options.scrollDuration || 0;

	this._onClick = this._onClick.bind(this);

	this._init();
}

ScrollToSlide.prototype = Object.create(Helper.prototype);
ScrollToSlide.prototype.constructor = ScrollToSlide;

ScrollToSlide.prototype._init = function() {
	this._addListener(document, 'click', this._onClick);
};

ScrollToSlide.prototype._onClick = function(e) {
	var target = e.target;
	var scrollBtn = target.closest('[data-slide]');
	if (!scrollBtn) return;
	var scrollTargetId = scrollBtn.dataset.slide;
	if (!scrollTargetId) return;
	var scrollTarget = document.querySelector('#' + scrollTargetId);
	if (!scrollTarget || this._checkScreenWidth() === 'lg') {
		return;
	}

	e.preventDefault();

	_smoothScroll.scrollTo(
		_smoothScroll.getPageScrollElem(),
		_smoothScroll.getCoords(scrollTarget).top,
		this._scrollDuration
	);
};

try {
	module.exports = ScrollToSlide;
} catch (err) {
	console.warn(err);
}
