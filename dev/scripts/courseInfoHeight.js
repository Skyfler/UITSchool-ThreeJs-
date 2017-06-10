"use strict";

try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function CourseInfoHeight(options) {
	options.name = options.name || 'CourseInfoHeight';
	Helper.call(this, options);

	this._elem = options.elem;

	this._onResize = this._onResize.bind(this);

	this._init();
}

CourseInfoHeight.prototype = Object.create(Helper.prototype);
CourseInfoHeight.prototype.constructor = CourseInfoHeight;

CourseInfoHeight.prototype._init = function() {
	this._resizeElem = this._elem.querySelector('#course_info_part_1 .page_slide_part_content');
	this._measureElem = this._elem.querySelector('#course_info_part_2 .page_slide_part_content');

	this._onResize();
	this._addListener(window, 'resize', this._onResize);
};

CourseInfoHeight.prototype._onResize = function() {
	if (window.innerWidth >= 1200) {
		this._resize = true;
		this._resizeElem.style.height = this._measureElem.offsetHeight + 'px';

	} else if (this._resize && window.innerWidth < 1200) {
		this._resize = false;
		this._resizeElem.style.height = '';

	}
};

try {
	module.exports = CourseInfoHeight;
} catch (err) {
	console.warn(err);
}
