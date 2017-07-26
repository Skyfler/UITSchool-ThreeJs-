"use strict";

try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function SideContactButtonWave(options) {
	options.name = options.name || 'SideContactButtonWave';
	Helper.call(this, options);

	this._elemsArr = options.elemsArr;
	this._delay = options.delay || 2000;
	this._activeDuration = options.activeDuration || 500;

	this._init();
}

SideContactButtonWave.prototype = Object.create(Helper.prototype);
SideContactButtonWave.prototype.constructor = SideContactButtonWave;

SideContactButtonWave.prototype._init = function() {
	this._startWave();
};

SideContactButtonWave.prototype._startWave = function() {
	this._setActiveClass(
		this._elemsArr.slice(0),
		function() {
			setTimeout(
				function() {
					this._startWave();
				}.bind(this),
				this._delay
			)
		}.bind(this)
	);
};

SideContactButtonWave.prototype._setActiveClass = function(elemsArr, callback) {
	if (elemsArr.length === 0) {
//		elemsArr = this._elemsArr.slice(0);
		if (callback) {
			callback();
		}
		return;
	}

	var elem = elemsArr[0];

	elem.classList.add('active');

	setTimeout(function() {
		elem.classList.remove('active');

		this._setActiveClass(elemsArr.slice(1), callback);
	}.bind(this), this._activeDuration);
};

try {
	module.exports = SideContactButtonWave;
} catch (err) {
	console.warn(err);
}
