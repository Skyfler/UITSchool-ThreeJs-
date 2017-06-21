"use strict";

try {
	var THREE = require('three');
//	var THREE = require("three-canvas-renderer");

	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function CustomLineMesh(options) {
	options.name = options.name || 'CustomLineMesh';
	Helper.call(this, options);

	this._verticesPositions = options.verticesPositions;
	this._material = options.material;
	this._animaionDuration = options.animationDuration;
	this._initialZ = options.z;

	this._init();
}

CustomLineMesh.prototype = Object.create(Helper.prototype);
CustomLineMesh.prototype.constructor = CustomLineMesh;

CustomLineMesh.prototype._init = function() {
	this._geometry = this._createGeometry(this._verticesPositions.length);
	this._particles = new THREE.Points(this._geometry, this._material);
	this._particles.name = this.NAME;

	this.__needsUpdate = {};

	this._startColor = this._endColor = this._material.color.clone();

	this.updateMesh({ noTransition: true, vertices: true, color: true });
};

CustomLineMesh.prototype._createGeometry = function(vertCount) {
	var geometry = new THREE.Geometry,
		vertex;

	for (var i = 0, l = vertCount; i < l; i++) {
		vertex = new THREE.Vector3();
//		vertex.z = (this._initialZ || 0) - (i * 0.1);
		vertex.z = (this._initialZ || 0);
		geometry.vertices.push(vertex);
	}

	return geometry;
};

CustomLineMesh.prototype.updateMesh = function(options) {
	var startTime, endTime;

	if (options.noTransition) {
		this.__noTransition = true;
	}
//	this._startTime = performance.now();
//	if (this.__noTransition) {
//		this._endTime = this._startTime;
//		delete this.__noTransition;
//	} else {
//		this._endTime = this._startTime + this._animaionDuration;
//	}

	startTime = performance.now();
	if (this.__noTransition) {
		endTime = startTime;
		delete this.__noTransition;
	} else {
		endTime = startTime + this._animaionDuration;
	}

	if (options.vertices) {
		this._verticesUpdateTimeframe = {
			startTime: startTime,
			endTime: endTime
		};
		this._updateVerticesPosition();
	}
	if (options.color) {
		this._colorUpdateTimeframe = {
			startTime: startTime,
			endTime: endTime
		};
		this._updateMaterialColor();
	}
};

CustomLineMesh.prototype._updateVerticesPosition = function() {
	var l = this._geometry.vertices.length;

	this._start = [];
	this._target = [];

	for (var i = 0; i < l; i++) {
		this._start.push({
			x: this._geometry.vertices[i].x,
			y: this._geometry.vertices[i].y
		});
		this._target.push({
//			x: (this._verticesPositions[i].x - 0.5) * width,
			x: (this._verticesPositions[i].x - 0.5),
//			y: (this._verticesPositions[i].y - 0.5) * height
			y: (this._verticesPositions[i].y - 0.5)
		});
	}

	this.__needsUpdate.vertices = true;
	this._sendCustomEvent(document, 'customMeshVerticesUpdateStarted', {bubbles: true, detail: {self: this}});
};

CustomLineMesh.prototype._updateMaterialColor = function() {
	this._startColor = this._material.color.clone();

	this.__needsUpdate.color = true;
	this._sendCustomEvent(document, 'customMeshColorUpdateStarted', {bubbles: true, detail: {self: this}});
};

CustomLineMesh.prototype.setVerteciesPositions = function(verticesPositions, noTransition) {
	if (verticesPositions.length !== this._verticesPositions.length) {
		console.warn(this.NAME + ': Old and new Vertices Quantities do not match.');
		return;
	}

	this._verticesPositions = verticesPositions;

	this.updateMesh({vertices: true, noTransition: noTransition});
};

CustomLineMesh.prototype.setMaterialColor = function(hexColor, noTransition) {
	var decColor = parseInt(hexColor, 16);
	if (decColor < 0 || decColor > 16777215) {
		console.warn(this.NAME + ': Given Number is not a valid Color.');

		return;
	}
	this._endColor = new THREE.Color( decColor );

	this.updateMesh({color: true, noTransition: noTransition});
};

CustomLineMesh.prototype.setAnimationDuration = function(animationDuration) {
	this._animaionDuration = animationDuration;
};

CustomLineMesh.prototype.redrawMesh = function() {
	var now = performance.now();
	var timeMultiplier;

	if (this.__needsUpdate.vertices) {
		if (this._verticesUpdateTimeframe.endTime < now) {
			now = this._verticesUpdateTimeframe.endTime;
			delete this.__needsUpdate.vertices;
			this._sendCustomEvent(document, 'customMeshVerticesUpdateComplete', {bubbles: true, detail: {self: this}});
		}

		timeMultiplier = Animation.quadEaseInOut(this._verticesUpdateTimeframe.endTime - this._verticesUpdateTimeframe.startTime, now - this._verticesUpdateTimeframe.startTime);

		this._redrawVertices(timeMultiplier);
	}

	if (this.__needsUpdate.color) {
		if (this._colorUpdateTimeframe.endTime < now) {
			now = this._colorUpdateTimeframe.endTime;
			delete this.__needsUpdate.color;
			this._sendCustomEvent(document, 'customMeshColorUpdateComplete', {bubbles: true, detail: {self: this}});
		}

		timeMultiplier = Animation.quadEaseInOut(this._colorUpdateTimeframe.endTime - this._colorUpdateTimeframe.startTime, now - this._colorUpdateTimeframe.startTime);

		this._redrawMaterialColor(timeMultiplier);
	}


	if (this.__needsUpdate.rotation) {
		if (this._rotation.endTime < now) {
			now = this._rotation.endTime;
			delete this.__needsUpdate.rotation;
		}

		timeMultiplier = Animation.linear(this._rotation.endTime - this._rotation.startTime, now - this._rotation.startTime);

		this._redrawRotation(timeMultiplier);

		if (!this.__needsUpdate.rotation && this._rotation.repeat) {
			var angle = this._rotation.targetAngle - this._rotation.initialRotationAngle;
			if (Math.abs(angle) !== 360) return;

			this.setRotation(this._rotation.duration, !this._rotation.clockwise, this._rotation.repeat);
		}
	}
}

CustomLineMesh.prototype._redrawVertices = function(timeMultiplier) {
	for (var i = 0; i < this._geometry.vertices.length; i++) {
		this._geometry.vertices[i].x = this._start[i].x + (this._target[i].x - this._start[i].x) * timeMultiplier;
		this._geometry.vertices[i].y = this._start[i].y + (this._target[i].y - this._start[i].y) * timeMultiplier;
	}

	this._geometry.verticesNeedUpdate = true;
};

CustomLineMesh.prototype._redrawRotation = function(timeMultiplier) {
	var angle = this._rotation.targetAngle - this._rotation.initialRotationAngle;

	var curAngle = (this._rotation.initialRotationAngle + (angle) * timeMultiplier) % 360;

	this._particles.rotation.z = curAngle;
};

CustomLineMesh.prototype._redrawMaterialColor = function(timeMultiplier) {
	this._material.color.copy(this._startColor.lerp(this._endColor, timeMultiplier));
};

CustomLineMesh.prototype.setRotation = function(duration, counterClockwise, repeat, targetAngle) {
	this._rotation = {};

	this._rotation.startTime = performance.now();
	this._rotation.endTime = this._rotation.startTime + duration;
	this._rotation.duration = duration;
	this._rotation.clockwise = !counterClockwise;
	this._rotation.repeat = !!repeat;
	this._rotation.initialRotationAngle = this._particles.rotation.z % 360;

	var angle;
	if (targetAngle === undefined) {
		angle = this._rotation.clockwise ? this._rotation.initialRotationAngle + 360 : this._rotation.initialRotationAngle - 360;
	} else {
		if (this._rotation.clockwise) {
			if (this._rotation.initialRotationAngle <= targetAngle) {
				angle = targetAngle;
			} else {
				angle = targetAngle + 360;
			}

		} else if (!this._rotation.clockwise) {
			if (this._rotation.initialRotationAngle >= targetAngle) {
				angle = targetAngle;
			} else {
				angle = targetAngle - 360;
			}

		}
	}

	this._rotation.targetAngle = angle;

	this.__needsUpdate.rotation = true;
};

CustomLineMesh.prototype.stopRotation = function() {
	delete this.__needsUpdate.rotation;
	delete this._rotation;
};

CustomLineMesh.prototype.getParticles = function() {
	return this._particles;
};

CustomLineMesh.prototype.getVerteciesPositions = function() {
	return this._verticesPositions;
};

try {
	module.exports = CustomLineMesh;
} catch (err) {
	console.warn(err);
}
