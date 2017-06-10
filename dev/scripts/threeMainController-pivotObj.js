try {
	var THREE = require('three');

	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function PivotObj(options) {
	options.name = options.name || 'PivotObj';
	Helper.call(this, options);

	this._animaionDuration = options.animationDuration;

	this._init();
}

PivotObj.prototype = Object.create(Helper.prototype);
PivotObj.prototype.constructor = PivotObj;

PivotObj.prototype._init = function() {
	this._object = new THREE.Object3D();
	this._object.name = this.NAME;

	this.__needsUpdate = {};

	this.updateMesh({ noTransition: true, vertices: true, color: true });
};

PivotObj.prototype.updateMesh = function(options) {
	var startTime, endTime;

	if (options.noTransition) {
		this.__noTransition = true;
	}

	startTime = performance.now();
	if (this.__noTransition) {
		endTime = startTime;
		delete this.__noTransition;
	} else {
		endTime = startTime + this._animaionDuration;
	}

	if (options.position) {
		this._positionUpdateTimeframe = {
			startTime: startTime,
			endTime: endTime
		};
		this._updatePosition();
	}
};

PivotObj.prototype._updatePosition = function() {
	this._start = {
		x: this._object.position.x,
		y: this._object.position.y,
		z: this._object.position.z
	};
	this._target = {
		x: this._newPosition.x,
		y: this._newPosition.y,
		z: this._newPosition.z,
	};

	this.__needsUpdate.position = true;
};

PivotObj.prototype.setPositions = function(position, noTransition) {
	this._newPosition = {
		x: position.x || 0,
		y: position.y || 0,
		z: position.z || 0
	};

	this.updateMesh({position: true, noTransition: noTransition});
};

PivotObj.prototype.redrawMesh = function() {
	var now = performance.now();
	var timeMultiplier;

	if (this.__needsUpdate.position) {
		if (this._positionUpdateTimeframe.endTime < now) {
			now = this._positionUpdateTimeframe.endTime;
			delete this.__needsUpdate.position;
		}

		timeMultiplier = Animation.quadEaseInOut(this._positionUpdateTimeframe.endTime - this._positionUpdateTimeframe.startTime, now - this._positionUpdateTimeframe.startTime);

		this._redrawPosition(timeMultiplier);
	}
};

PivotObj.prototype._redrawPosition = function(timeMultiplier) {
	this._object.position.x = this._start.x + (this._target.x - this._start.x) * timeMultiplier;
	this._object.position.y = this._start.y + (this._target.y - this._start.y) * timeMultiplier;
	this._object.position.z = this._start.z + (this._target.z - this._start.z) * timeMultiplier;
};

PivotObj.prototype.getObject = function() {
	return this._object;
};

try {
	module.exports = PivotObj;
} catch (err) {
	console.warn(err);
}
