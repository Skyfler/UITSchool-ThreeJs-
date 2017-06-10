"use strict";

var Helper = require('./helper');

function CustomInputRange(options) {
	options.name = options.name || 'CustomInputRange';
	Helper.call(this, options);

	this._elem = options.elem;

	this._rulerElem = this._elem.querySelector('.ruler');
	this._thumbElem = this._elem.querySelector('.thumb');

	this._min = isNaN(parseInt(options.min)) ? 0 : parseInt(options.min);
	this._max = isNaN(parseInt(options.max)) ? 10 : parseInt(options.max);
	this._percentPerValue = 100 / (this._max - this._min);

	var initialValue = isNaN(parseInt(options.initialValue)) ? this._min : parseInt(options.initialValue);
	this.setValue(initialValue);

	this._onMouseDown = this._onMouseDown.bind(this);
	this._onDocumentMouseMove = this._onDocumentMouseMove.bind(this);
	this._onDocumentMouseUp = this._onDocumentMouseUp.bind(this);

	this._addListener(this._elem, 'dragstart', function(e) {e.preventDefault();});
	this._addListener(this._elem, 'mousedown', this._onMouseDown);
	this._addListener(this._elem, 'touchstart', this._onMouseDown);
}

CustomInputRange.prototype = Object.create(Helper.prototype);
CustomInputRange.prototype.constructor = CustomInputRange;

CustomInputRange.prototype._onMouseDown = function(e) {
	if (e.target.closest('.thumb')) {
		var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX;
		var clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;

		e.preventDefault();
		this._startDrag(clientX, clientY);
	}
};

CustomInputRange.prototype._startDrag = function(startClientX, startClientY) {
	this._thumbCoords = this._thumbElem.getBoundingClientRect();
	this._shiftX = startClientX - this._thumbCoords.left;
	this._shiftY = startClientY - this._thumbCoords.top;

	this._rullerCoords = this._rulerElem.getBoundingClientRect();

	this._onDocumentMouseMove({clientX: startClientX});
	this._addListener(document, 'mousemove', this._onDocumentMouseMove);
	this._addListener(document, 'touchmove', this._onDocumentMouseMove);
	this._addListener(document, 'mouseup', this._onDocumentMouseUp);
	this._addListener(document, 'touchend', this._onDocumentMouseUp);
};

CustomInputRange.prototype._onDocumentMouseMove = function(e) {
	var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX;
	this._moveTo(clientX);
};

CustomInputRange.prototype._onDocumentMouseUp = function(e) {
	this._endDrag();
};

CustomInputRange.prototype._moveTo = function(clientX) {
	if (!clientX) return;
	// вычесть координату родителя, т.к. position: relative
	var newLeft = clientX - this._shiftX - this._rullerCoords.left;

	// курсор ушёл вне слайдера
	if (newLeft < 0) {
		newLeft = 0;
	}
	var rightEdge = this._rulerElem.clientWidth;
	if (newLeft > rightEdge) {
		newLeft = rightEdge;
	}

	this._pixelLeft = newLeft;
	this._thumbElem.style.left = newLeft + 'px';

	var newValue = this._positionToValue(newLeft);
	if (newValue !== this._value) {
		this._value = newValue;
		this._elem.setAttribute('data-value', this._value);

		this._sendCustomEvent(this._elem, 'custominputrangeslide', {
			bubbles: true,
			detail: {
				value: this._value
			}
		});
	}
};

CustomInputRange.prototype._valueToPosition = function(value) {
	return this._percentPerValue * (value - this._min);
};

CustomInputRange.prototype._positionToValue = function(left) {
	var pixelPerValue = this._rulerElem.clientWidth / (this._max - this._min);
	return Math.round(left / pixelPerValue) + this._min;
};

CustomInputRange.prototype._pixelsToPercents = function(left) {
	return left * (100 / this._rulerElem.clientWidth);
};

CustomInputRange.prototype._endDrag = function() {
	this._removeListener(document, 'mousemove', this._onDocumentMouseMove);
	this._removeListener(document, 'touchmove', this._onDocumentMouseMove);
	this._removeListener(document, 'mouseup', this._onDocumentMouseUp);
	this._removeListener(document, 'touchend', this._onDocumentMouseUp);

	this._thumbElem.style.left = this._pixelsToPercents(this._pixelLeft) + '%';

	this._afterValueIsSet();
};

CustomInputRange.prototype._afterValueIsSet = function() {
	this._sendCustomEvent(this._elem, 'custominputrangechange', {
		bubbles: true,
		detail: {
			value: this._value
		}
	});
};

CustomInputRange.prototype.setValue = function(value) {
	value = parseInt(value);

	if (typeof value !== 'number') return;

	if (value > this._max) {
		value = this._max;
	} else if (value < this._min) {
		value = this._min;
	}

	this._value = value;
	this._elem.setAttribute('data-value', this._value);
	this._thumbElem.style.left = this._valueToPosition(value) + '%';
	this._pixelLeft = parseInt(getComputedStyle(this._thumbElem).left);

	this._afterValueIsSet();
};

CustomInputRange.prototype.getElem = function() {
	return this._elem;
};

module.exports = CustomInputRange;
