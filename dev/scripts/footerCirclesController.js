"use strict";

var Helper = require('./helper');
var CirclePath = require('./circlePath');

function FooterCirclesController(options) {
	options.name = options.name || 'FooterCirclesController';
	Helper.call(this, options);

	this._elem = options.elem;

	this._onCircleMouseOver = this._onCircleMouseOver.bind(this);
	this._onCircleMouseOut = this._onCircleMouseOut.bind(this);
	this._onResize = this._onResize.bind(this);

	this._init();
}

FooterCirclesController.prototype = Object.create(Helper.prototype);
FooterCirclesController.prototype.constructor = FooterCirclesController;

FooterCirclesController.prototype.remove = function() {
	this._removeCircles();

	Helper.prototype.remove.apply(this, arguments);
};

FooterCirclesController.prototype._removeCircles = function() {
	this._initializedSize = false;

	this._removeListener(this._elem, 'circleMouseOver', this._onCircleMouseOver);
	this._removeListener(this._elem, 'circleMouseOut', this._onCircleMouseOut);

	if (this._circles && this._circles.length > 0) {
		for (var i = 0; i < this._circles.length; i++) {
			this._circles[i].remove();
		}
	}

	this._circles = [];
	this._hoveredCircles = [];
};

FooterCirclesController.prototype._init = function() {
	this._mode = this._checkScreenWidth();

	this._circles = [];
	this._hoveredCircles = [];

	this._addListener(window, 'resize', this._onResize);

	if (this._mode === 'xs') {
		return;

	} else if (this._mode === 'sm' || this._mode === 'md') {
		this._createSmMdCircles();

	} else if (this._mode === 'lg') {
		this._createLgCircles();

	}

	this._addListener(this._elem, 'circleMouseOver', this._onCircleMouseOver);
	this._addListener(this._elem, 'circleMouseOut', this._onCircleMouseOut);
};

FooterCirclesController.prototype._createLgCircles = function() {
	this._animationState = 'playing';
	this._initializedSize = 'lg';

	this._circles.push(new CirclePath({
		elem: this._elem.querySelector('.vk_container'),
		centerAnchor: this._elem.querySelector('.right_panel .title'),
		animationDuration: 6000,
		radius: 215,
		startAngle: -90,
		endAngle: -100,
		reversable: true,
		checkOverflow: true
	}));

	this._circles.push(new CirclePath({
		elem: this._elem.querySelector('.right_panel_btn.call'),
		centerAnchor: this._elem.querySelector('.right_panel .title'),
		animationDuration: 5000,
		radius: 124,
		startAngle: -80,
		endAngle: -120,
		reversable: true
	}));

	this._circles.push(new CirclePath({
		elem: this._elem.querySelector('.right_panel_btn.right_panel_btn_2.mail'),
		centerAnchor: this._elem.querySelector('.vk_container'),
		animationDuration: 10000,
		radius: 50,
		startAngle: 540,
		endAngle: 180
	}));

	this._circles.push(new CirclePath({
		elem: this._elem.querySelector('.right_panel_btn.right_panel_btn_2.message'),
		centerAnchor: this._elem.querySelector('.vk_container'),
		animationDuration: 10000,
		radius: 50,
		startAngle: 360,
		endAngle: 0
	}));
};

FooterCirclesController.prototype._createSmMdCircles = function() {
	this._animationState = 'playing';
	this._initializedSize = 'smmd';

	this._circles.push(new CirclePath({
		elem: this._elem.querySelector('.vk_container'),
		centerAnchor: this._elem.querySelector('.right_panel .title'),
		animationDuration: 6000,
		radius: 181,
		startAngle: -90,
		endAngle: -100,
		reversable: true,
		checkOverflow: true
	}));

	this._circles.push(new CirclePath({
		elem: this._elem.querySelector('.right_panel_btn.call'),
		centerAnchor: this._elem.querySelector('.right_panel .title'),
		animationDuration: 5000,
		radius: 103,
		startAngle: -80,
		endAngle: -120,
		reversable: true
	}));

	this._circles.push(new CirclePath({
		elem: this._elem.querySelector('.right_panel_btn.right_panel_btn_2.mail'),
		centerAnchor: this._elem.querySelector('.vk_container'),
		animationDuration: 10000,
		radius: 50,
		startAngle: 540,
		endAngle: 180
	}));

	this._circles.push(new CirclePath({
		elem: this._elem.querySelector('.right_panel_btn.right_panel_btn_2.message'),
		centerAnchor: this._elem.querySelector('.vk_container'),
		animationDuration: 10000,
		radius: 50,
		startAngle: 360,
		endAngle: 0
	}));
};

FooterCirclesController.prototype._onCircleMouseOver = function(e) {
	var index = this._hoveredCircles.indexOf(e.detail.self);
	if (index === -1) {
		this._hoveredCircles.push(e.detail.self);
	} else {
//		console.warn(this.NAME + ': Circle is already in Hovered Circles Array!');
	}

	this._checkForHoveredCircles();
};

FooterCirclesController.prototype._onCircleMouseOut = function(e) {
	var index = this._hoveredCircles.indexOf(e.detail.self);
	if (index === -1) {
//		console.warn(this.NAME + ': Circle was not found in Hovered Circles Array!');
	} else {
		this._hoveredCircles.splice(index, 1);
	}

	this._checkForHoveredCircles();
};

FooterCirclesController.prototype._checkForHoveredCircles = function() {
	if (this._hoveredCircles.length === 0 && this._animationState === 'paused') {
		if (this._animationStartDelay) {
			clearTimeout(this._animationStartDelay);
		}
		this._animationStartDelay = setTimeout(function() {
			delete this._animationStartDelay;
			this._startAnimations();
		}.bind(this), 1000);

	} else if (this._hoveredCircles.length > 0) {
		if (this._animationStartDelay) {
			clearTimeout(this._animationStartDelay);
			delete this._animationStartDelay;

		} else if (this._animationState === 'playing') {
			this._pauseAnimations();

		}

	}
};

FooterCirclesController.prototype._pauseAnimations = function() {
	for (var i = 0; i < this._circles.length; i++) {
		this._circles[i].pauseAnimation();
	}

	this._animationState = 'paused';
};

FooterCirclesController.prototype._startAnimations = function() {
	for (var i = 0; i < this._circles.length; i++) {
		this._circles[i].startAnimation();
	}

	this._animationState = 'playing';
};

FooterCirclesController.prototype._onResize = function(e) {
	this._mode = this._checkScreenWidth();

	this._initializedSize;

	if ((this._mode === 'sm' || this._mode === 'md') && this._initializedSize !== 'smmd') {
		if (this._circles.length > 0) {
			this._removeCircles();
		}

		this._createSmMdCircles();

		this._addListener(this._elem, 'circleMouseOver', this._onCircleMouseOver);
		this._addListener(this._elem, 'circleMouseOut', this._onCircleMouseOut);

	} else if (this._mode === 'lg' && this._initializedSize !== 'lg') {
		if (this._circles.length > 0) {
			this._removeCircles();
		}

		this._createLgCircles();

		this._addListener(this._elem, 'circleMouseOver', this._onCircleMouseOver);
		this._addListener(this._elem, 'circleMouseOut', this._onCircleMouseOut);

	} else if ((this._mode === 'xs') && this._circles.length > 0) {
		this._removeCircles();

	}

};

module.exports = FooterCirclesController;
