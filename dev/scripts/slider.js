"use strict";

try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function Slider(options) {
	options.name = options.name || 'Slider';
	Helper.call(this, options);

	this._elem = options.elem;
	this._overflowContainer = this._elem.querySelector('.overflow_hidden_container');
	this._overflowBlock = this._overflowContainer.querySelector('.overflow_block');
	this._moveDelay = options.delay || 0;

	this._onClick = this._onClick.bind(this);
	this._onCornerTransitionEnd = this._onCornerTransitionEnd.bind(this);
	this._onMiddleTransitionEnd = this._onMiddleTransitionEnd.bind(this);
	this._onMouseOver = this._onMouseOver.bind(this);
	this._onMouseOut = this._onMouseOut.bind(this);
	this._onMouseDown = this._onMouseDown.bind(this);
	this._onMouseUp = this._onMouseUp.bind(this);
	this._onDragStart = this._onDragStart.bind(this);
	this._onMouseMoveDrag = this._onMouseMoveDrag.bind(this);

	this._initSlider();

	this._addListener(this._elem, 'click', this._onClick);
	if (options.pauseOnHover) {
		this._addListener(this._elem, 'mouseover', this._onMouseOver);
		this._addListener(this._elem, 'mouseout', this._onMouseOut);
	}
}

Slider.prototype = Object.create(Helper.prototype);
Slider.prototype.constructor = Slider;

Slider.prototype._initSlider = function() {
	var slidesArr = this._overflowBlock.querySelectorAll('[data-component="slide"]');
	if (0 === slidesArr.length) return;

	this._slidesCount = slidesArr.length;
	this._currSlide = 1;

	var firstSlide = slidesArr[0];
	var lastSlide = slidesArr[slidesArr.length - 1];

	this._overflowBlock.insertBefore(lastSlide.cloneNode(true), this._overflowBlock.firstChild);
	this._overflowBlock.appendChild(firstSlide.cloneNode(true));

	this._slidesArr = Array.prototype.slice.call(this._overflowBlock.querySelectorAll('[data-component="slide"]'));
	for (var i = 0; i < this._slidesArr.length; i++) {
		this._slidesArr[i].style.width = 100 / (this._slidesCount + 2) + '%';
		this._slidesArr[i].classList.remove('selected');
	}
	this._slidesArr[1].classList.add('selected');
	this._overflowBlock.style.width = 100 * (this._slidesCount + 2) + '%';
	this._overflowBlock.style.left = '-100%';

	if (0 !== this._moveDelay) this._moveOverTime();

	this._moveOnSwipe();
};

Slider.prototype._onClick = function(e) {
	var target = e.target;
	this._controlSlider(target, e);
};

Slider.prototype._controlSlider = function(target, e) {
	var control = target.closest('[data-component="slider_control"]');
	if (control) {
		e.preventDefault();
		if (this._isMoving) return;

		if (this._moveTimer) {
			clearTimeout(this._moveTimer);
		}
		switch (control.dataset.action) {
			case 'forward':
				this._moveSlideForward();
				break;
			case 'back':
				this._moveSlideBack();
				break;
		}

		if (0 !== this._moveDelay) this._moveOverTime();
	}
};

Slider.prototype._onMouseOver = function() {
	if (this._moveTimer) {
		clearTimeout(this._moveTimer);
	}
};

Slider.prototype._onMouseOut = function() {
	if (0 !== this._moveDelay) this._moveOverTime();
};

Slider.prototype._moveSlideForward = function(increment) {
//	console.log(this.NAME + ': moveSlideForward function');
	increment = (increment === undefined) ? 1 : increment;
	this._overflowBlock.style.transitionDuration = '';
	this._isMoving = true;
//	console.log({
//		event: 'moveSlideForward',
//		isMoving: this._isMoving,
//		transitionDuration: ''
//	});

//	var slidesArr = this._overflowBlock.querySelectorAll('[data-component="slide"]');
	this._slidesArr[this._currSlide].classList.remove('selected');

	this._currSlide += increment;
	this._slidesArr[this._currSlide].classList.add('selected');

	this._overflowBlock.style.left = -100 * this._currSlide + '%';
//	console.log({
//		event: 'moveSlideForward',
//		newLeft: -100 * this._currSlide,
//		units: '%'
//	});

	if (this._currSlide > this._slidesCount) {
		this._currSlide = 1;
		this._slidesArr[this._currSlide].classList.add('selected');
		this._addListener(this._elem, 'transitionend', this._onCornerTransitionEnd);
	} else {
		this._addListener(this._elem, 'transitionend', this._onMiddleTransitionEnd);
	}
};

Slider.prototype._moveSlideBack = function(decrement) {
//	console.log(this.NAME + ': moveSlideBack function');
	decrement = (decrement === undefined) ? 1 : decrement;
	this._overflowBlock.style.transitionDuration = '';
	this._isMoving = true;
//	console.log({
//		event: 'moveSlideBack',
//		isMoving: this._isMoving,
//		transitionDuration: ''
//	});

//	var slidesArr = this._overflowBlock.querySelectorAll('[data-component="slide"]');
	this._slidesArr[this._currSlide].classList.remove('selected');

	this._currSlide -= decrement;
	this._slidesArr[this._currSlide].classList.add('selected');

	this._overflowBlock.style.left = -100 * this._currSlide + '%';
//	console.log({
//		event: 'moveSlideBack',
//		newLeft: -100 * this._currSlide,
//		units: '%'
//	});

	if (0 === this._currSlide) {
		this._currSlide = this._slidesCount;
		this._slidesArr[this._currSlide].classList.add('selected');
		this._addListener(this._elem, 'transitionend', this._onCornerTransitionEnd);
	} else {
		this._addListener(this._elem, 'transitionend', this._onMiddleTransitionEnd);
	}
};

Slider.prototype._onMiddleTransitionEnd = function(e) {
//	console.log(this.NAME + ': onMiddleTransitionEnd function');
	if (e.target !== this._overflowBlock) return;

	this._removeListener(this._elem, 'transitionend', this._onMiddleTransitionEnd);
	this._isMoving = false;
//	console.log({
//		event: 'onMiddleTransitionEnd',
//		isMoving: this._isMoving
//	});
};

Slider.prototype._onCornerTransitionEnd = function(e) {
//	console.log(this.NAME + ': onCornerTransitionEnd function');
	if (e.target !== this._overflowBlock) return;

	this._removeListener(this._elem, 'transitionend', this._onCornerTransitionEnd);

	this._overflowBlock.style.transitionDuration = '0s';
	this._overflowBlock.style.left = -100 * (this._currSlide) + '%';
//	var slidesArr = this._overflowBlock.querySelectorAll('[data-component="slide"]');
	this._slidesArr[this._slidesCount+1].classList.remove('selected');
	this._slidesArr[0].classList.remove('selected');
	this._isMoving = false;
//	console.log({
//		event: 'onCornerTransitionEnd',
//		isMoving: this._isMoving,
//		newLeft: -100 * (this._currSlide),
//		units: '%',
//		transitionDuration: '0s'
//	});
};

Slider.prototype._moveOnSwipe = function() {
	this._addListener(this._elem, 'mousedown', this._onMouseDown);
	this._addListener(this._elem, 'touchstart', this._onMouseDown);
	this._addListener(this._elem, 'dragstart', this._onDragStart);
};

Slider.prototype._onDragStart = function(e) {
	e.preventDefault();
};

Slider.prototype._onMouseDown = function(e) {
	var target = e.target;
	if (!target) {
		return;
	}
	var control = target.closest('[data-component="slider_control"]');
	if (!control) {
		this._startDrag(e);
	}
};

Slider.prototype._onMouseUp = function(e) {
	this._stopDrag(e);
};

Slider.prototype._startDrag = function(e) {
//	console.log(this.NAME + ': startDrag function');
//	var test = document.querySelector('#test');
//	if (test) {
//		test.innerHTML += 'startDrag</br>';
//		test.scrollTop = test.scrollHeight;
//	}

	this._removeListener(this._elem, 'transitionend', this._onCornerTransitionEnd);
	this._removeListener(this._elem, 'transitionend', this._onMiddleTransitionEnd);
	this._removeListener(this._elem, 'mousedown', this._onMouseDown);
	this._removeListener(this._elem, 'touchstart', this._onMouseDown);

	this._isMoving = false;
	this._overflowBlock.style.transitionDuration = '0s';
//	console.log({
//		event: 'startDrag',
//		isMoving: this._isMoving,
//		transitionDuration: '0s'
//	});

	var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX;
	var clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;

	this._startCursorXPosition = clientX + (window.pageXOffset || document.documentElement.scrollLeft);
	this._startCursorYPosition = clientY + (window.pageYOffset || document.documentElement.scrollTop);

//	this._startListContainerYPosition = this._overflowBlock.style;
//	var overflowStartLeftCompStyle = getComputedStyle(this._overflowBlock).left;
//	this._overflowStartLeft = parseInt(overflowStartLeftCompStyle);
//	var offsetleft = this._overflowBlock.offsetLeft;
	this._overflowStartLeft = this._overflowBlock.offsetLeft;

//	if (test) {
//		test.innerHTML += '   startCursorXPosition = ' + this._startCursorXPosition  + '</br>';
//		test.innerHTML += '   startCursorYPosition = ' + this._startCursorYPosition  + '</br>';
//		test.innerHTML += '   overflowStartLeft = ' + this._overflowStartLeft + 'px</br>';
//		test.scrollTop = test.scrollHeight;
//	}

	this._addListener(document, 'mousemove', this._onMouseMoveDrag);
	this._addListener(document, 'touchmove', this._onMouseMoveDrag);
	this._addListener(document, 'mouseup', this._onMouseUp);
	this._addListener(document, 'touchend', this._onMouseUp);
};

Slider.prototype._stopDrag = function(e) {
//	console.log(this.NAME + ': stopDrag function');
//	var test = document.querySelector('#test');
//	if (test) {
//		test.innerHTML += 'stopDrag</br>';
//		test.scrollTop = test.scrollHeight;
//	}

	this._removeListener(document, 'mousemove', this._onMouseMoveDrag);
	this._removeListener(document, 'touchmove', this._onMouseMoveDrag);
	this._removeListener(document, 'mouseup', this._onMouseUp);
	this._removeListener(document, 'touchend', this._onMouseUp);

	var pxLeft = getComputedStyle(this._overflowBlock).left;
	var pxIntLeft = parseInt(pxLeft);
	var percentLeft = this._pixelsToPercents(pxIntLeft);
//	console.log({
//		event: 'stopDrag',
//		pxLeft: pxLeft,
//		pxIntLeft: pxIntLeft,
//		newLeft: percentLeft,
//		units: '%'
//	});
	this._overflowBlock.style.left = percentLeft + '%';
//	if (test) {
//		test.innerHTML += '   pxLeft = ' + pxLeft  + '</br>';
//		test.innerHTML += '   percentLeft = ' + percentLeft  + '%</br>';
//		test.scrollTop = test.scrollHeight;
//	}
//	this._overflowBlock.style.transitionDuration = '';

	var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX;
	var clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;

//	this._controllSelectedListItemOnStopDrag();

	if (this._startCursorXPosition !== clientX || this._startCursorYPosition !== clientY) {
		e.preventDefault();
	}

	this._addListener(this._elem, 'mousedown', this._onMouseDown);
	this._addListener(this._elem, 'touchstart', this._onMouseDown);

	var newCenterSlide = this._getCenterListItem();
	var diff;
	if (!newCenterSlide) {
		console.warn(this.NAME + ': Center slide is not found!');
		diff = 0;

	} else {
		var newCenterSlideIndex = this._slidesArr.indexOf(newCenterSlide);

		if (newCenterSlideIndex === -1) {
			console.warn(this.NAME + ': Center slide is not in slides Array!');
			diff = 0;

		} else {
			diff = newCenterSlideIndex - this._currSlide;
		}
	}

	if (diff >= 0) {
		var overflowLeft = getComputedStyle(this._overflowBlock).left;
		var overflowLeftInt = parseInt(overflowLeft);
		var percentLeft = this._pixelsToPercents(overflowLeftInt);
//		console.log({
//			event: 'stopDrag',
//			percentLeft: percentLeft,
//			diff: diff,
//			overflowLeft: overflowLeft,
//			overflowLeftInt: overflowLeftInt
//		});
		if ((diff === 0) && (parseInt(percentLeft * 10) % 100 === 0)) {
//			console.log({
//				event: 'stopDrag',
//				diff: diff,
//				action: 'Don`t change slide',
//			});

		} else {
//			console.log({
//				event: 'stopDrag',
//				diff: diff,
//				action: 'changing slide forvard to ' + diff,
//			});
			this._moveSlideForward(diff);
		}

	} else {
//		console.log({
//			event: 'stopDrag',
//			diff: diff,
//			action: 'changing slide backward to ' + diff,
//		});
		this._moveSlideBack(-diff);
	}
};

Slider.prototype._pixelsToPercents = function(left) {
	return left * (100 / this._overflowContainer.clientWidth);
};

Slider.prototype._onMouseMoveDrag = function(e) {
//	var test = document.querySelector('#test');
//	if (test) {
//		test.innerHTML += 'onMouseMoveDrag</br>';
//		test.scrollTop = test.scrollHeight;
//	}
//	console.log(this.NAME + ': onMouseMoveDrag function.');
	var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX;

	var currentcursorXPosition = clientX + (window.pageXOffset || document.documentElement.scrollLeft);
	var xPositionDeleta = currentcursorXPosition - this._startCursorXPosition;

	var newLeft = this._overflowStartLeft + xPositionDeleta;

//	if (test) {
//		test.innerHTML += '   newLeft = ' + newLeft  + 'px</br>';
//		test.scrollTop = test.scrollHeight;
//	}

	this._overflowBlock.style.left = newLeft + 'px';
//	console.log({
//		event: 'MouseMoveDrag',
//		newLeft: newLeft,
//		units: 'px'
//	});

	var newCenterSlide = this._getCenterListItem();
	if (!newCenterSlide) {
//		console.warn(this.NAME + ': Center slide is not found!');
	} else {
		var newCenterSlideIndex = this._slidesArr.indexOf(newCenterSlide);

		if (newCenterSlideIndex === -1) {
//			console.warn(this.NAME + ': Center slide is not in slides Array!');
		} else {

			if (newCenterSlideIndex > this._slidesCount) {
				var percentLeft = this._pixelsToPercents(newLeft);
				newLeft = Math.abs(percentLeft) % 100;
				this._overflowBlock.style.left = -newLeft + '%';
//				console.log({
//					event: 'MouseMoveDrag',
//					newCenterSlideIndex: newCenterSlideIndex,
//					slidesCount: this._slidesCount,
//					newLeft: -newLeft,
//					units: '%'
//				});

				this._startCursorXPosition = currentcursorXPosition;
//				this._overflowStartLeft = parseInt(getComputedStyle(this._overflowBlock).left);
//				var overflowStartLeftCompStyle = getComputedStyle(this._overflowBlock).left;
//				this._overflowStartLeft = parseInt(overflowStartLeftCompStyle);
//				var offsetleft = this._overflowBlock.offsetLeft;
				this._overflowStartLeft = this._overflowBlock.offsetLeft;

//				if (test) {
//					test.innerHTML += '   newLeft = ' + -newLeft  + '%</br>';
//					test.innerHTML += '   startCursorXPosition = ' + currentcursorXPosition  + '</br>';
//					test.innerHTML += '   overflowStartLeft = ' + this._overflowStartLeft  + 'px</br>';
//					test.scrollTop = test.scrollHeight;
//				}

			} else if (newCenterSlideIndex === 0) {
				var percentLeft = this._pixelsToPercents(newLeft);
				newLeft = Math.abs(percentLeft) + (this._slidesCount * 100);
				this._overflowBlock.style.left = -newLeft + '%';
//				console.log({
//					event: 'MouseMoveDrag',
//					newCenterSlideIndex: newCenterSlideIndex,
//					slidesCount: this._slidesCount,
//					newLeft: -newLeft,
//					units: '%'
//				});

				this._startCursorXPosition = currentcursorXPosition;
//				this._overflowStartLeft = parseInt(getComputedStyle(this._overflowBlock).left);
//				var overflowStartLeftCompStyle = getComputedStyle(this._overflowBlock).left;
//				this._overflowStartLeft = parseInt(overflowStartLeftCompStyle);
//				var offsetleft = this._overflowBlock.offsetLeft;
				this._overflowStartLeft = this._overflowBlock.offsetLeft;

//				if (test) {
//					test.innerHTML += '   newLeft = ' + -newLeft  + '%</br>';
//					test.innerHTML += '   startCursorXPosition = ' + currentcursorXPosition  + '</br>';
//					test.innerHTML += '   overflowStartLeft = ' + this._overflowStartLeft  + 'px</br>';
//					test.scrollTop = test.scrollHeight;
//				}
			}
//			var diff = newCenterSlideIndex - this._currSlide;

//			if (diff >= 0) {
//				this._moveSlideForward(diff);
//			} else {
//				this._moveSlideBack(-diff);
//			}
		}
	}
};

Slider.prototype._getCenterListItem = function() {
	var clientRect = this._overflowContainer.getBoundingClientRect();

	var overflowContainerCenter = {
		x: clientRect.left + this._overflowContainer.offsetWidth / 2,
		y: clientRect.top + this._overflowContainer.offsetHeight / 2
	}

	if (overflowContainerCenter.x < 0) {
		overflowContainerCenter.x = 0;
	} else if (overflowContainerCenter.x > window.innerWidth - 1) {
		overflowContainerCenter.x = window.innerWidth - 1;
	}

	if (overflowContainerCenter.y < 0) {
		overflowContainerCenter.y = 0;
	} else if (overflowContainerCenter.y > window.innerHeight - 1) {
		overflowContainerCenter.y = window.innerHeight - 1;
	}

	var centerElement = document.elementFromPoint(overflowContainerCenter.x, overflowContainerCenter.y);

	return centerElement.closest('[data-component="slide"]');
};

Slider.prototype._moveOverTime = function () {
	this._moveTimer = setTimeout(function() {
		if (!this._elem) return;
		if (!this._isMoving) {
			this._moveSlideForward();
		}
		this._moveOverTime();
	}.bind(this), this._moveDelay);
};

try {
	module.exports = Slider;
} catch (err) {
	console.warn(err);
}
