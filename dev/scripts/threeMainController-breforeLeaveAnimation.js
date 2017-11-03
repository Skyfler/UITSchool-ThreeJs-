"use strict";

try {
	var THREE = require('three');
//	var THREE = require("three-canvas-renderer");

	var ThreeMainController = require('./threeMainController');
	var CustomLineMesh = require('./threeMainController-customLineMesh');
	var CustomCircle = require('./threeMainController-customCircle');
	var PivotObj = require('./threeMainController-pivotObj');
} catch (err) {
	console.warn(err);
}

function BreforeLeaveAnimation(options) {
	this._urlsToLoad_innerShape_A = options.urlsToLoad_innerShape_A;
	this._urlsToLoad_innerShape_B = options.urlsToLoad_innerShape_B;
	this._urlsToLoad_innerShape_C = options.urlsToLoad_innerShape_C;

	this._animationDuration_InnerPatternLines = options.animationDuration_InnerPatternLines || 1000;

	options.name = options.name || 'Three-BreforeLeaveAnimation';
	ThreeMainController.call(this, options);
}

BreforeLeaveAnimation.prototype = Object.create(ThreeMainController.prototype);
BreforeLeaveAnimation.prototype.constructor = BreforeLeaveAnimation;

BreforeLeaveAnimation.prototype._init = function() {
	ThreeMainController.prototype._init.apply(this, arguments);

	var self = this;
	this._addListener(document, 'svgLoaderLoadingComplete', function waitTillLoadingComplete(e) {
		if (e.detail.initiator === self) {
			self._executeOnDesktop(self._startOnLoad);
		}
	});

	this._addListener(document, 'indexMenuItemSelected', this._onIndexMenuItemSelected);

	this._rotationY = 0;

	this._mouseX = 0;
	this._mouseY = 0;

	this._loaderA = this._createSvgLoader(this._urlsToLoad_innerShape_A);
	this._loaderB = this._createSvgLoader(this._urlsToLoad_innerShape_B);
	this._loaderC = this._createSvgLoader(this._urlsToLoad_innerShape_C);

	this._executeOnDesktop(this._startLoaders.bind(this));
};

BreforeLeaveAnimation.prototype._updateMeshes = function() {
	ThreeMainController.prototype._updateMeshes.apply(this, arguments);

	var multheight, multwidth;

	var multheight = this._visibleHeightWithOffsetAtZDepth(
		0,
		this._camera,
		0
	);
	var multwidth = this._visibleWidthWithOffsetAtZDepth(
		0,
		this._camera,
		0
	);
	var multiplier = Math.min(multheight, multwidth);

	this._axisOffsets = this._calculateAxisOffsets(0, 0, 0, 0);

	for (var i = 0; i < this._customLinesArr.length; i++) {
		this._customLinesArr[i].getParticles().scale.x = multiplier * 0.9;
		this._customLinesArr[i].getParticles().scale.y = multiplier * 0.9;
		this._customLinesArr[i].getParticles().position.x = this._axisOffsets.x;
		this._customLinesArr[i].getParticles().position.y = this._axisOffsets.y;
	}
};

BreforeLeaveAnimation.prototype._calculateAxisOffsets = function(topOffset, bottomOffset, rightOffset, leftOffset) {
	var xOffset = leftOffset - rightOffset;
	var yOffset = bottomOffset - topOffset;

	var xMult = (xOffset / Math.abs(xOffset || 1)) || 1;
	var yMult = (yOffset / Math.abs(yOffset || 1)) || 1;

	var halfFullWidth = this._visibleWidthWithOffsetAtZDepth(0, this._camera, 0) / 2;
	var halfFullHeight = this._visibleHeightWithOffsetAtZDepth(0, this._camera, 0) / 2;

	var halfOffsetWidth = this._visibleWidthWithOffsetAtZDepth(0, this._camera, Math.abs(xOffset)) / 2;
	var halfOffsetHeight = this._visibleHeightWithOffsetAtZDepth(0, this._camera, Math.abs(yOffset)) / 2;

	var x = (halfFullWidth - halfOffsetWidth) * xMult;
	var y = (halfFullHeight - halfOffsetHeight) * yMult;

	return {
		x: x,
		y: y
	}
};

BreforeLeaveAnimation.prototype._startOnLoad = function() {
	if (this._loadersReady()) {
		this._active = true;

		var multheight = this._visibleHeightWithOffsetAtZDepth(
			0,
			this._camera,
			0
		);
		var multwidth = this._visibleWidthWithOffsetAtZDepth(
			0,
			this._camera,
			0
		);
		var multiplier = Math.min(multheight, multwidth);

		this._axisOffsets = this._calculateAxisOffsets(0, 0, 0, 0);

		this._createInnerPatternLines(multiplier);

		this._meshesArr = this._meshesArr.concat(this._customLinesArr);

		ThreeMainController.prototype._startOnLoad.apply(this, arguments);
	}
};

BreforeLeaveAnimation.prototype._createInnerPatternLines = function(multiplier) {
	var pointCoordsArr_innerShape_A = this._loaderA.getResultCoords();
	var pointCoordsArr_innerShape_B = this._loaderB.getResultCoords();
	var pointCoordsArr_innerShape_C = this._loaderC.getResultCoords();

	var pointCoordsArr_svgSizes_A = this._loaderA.getResultSizes();
	var pointCoordsArr_svgSizes_B = this._loaderB.getResultSizes();
	var pointCoordsArr_svgSizes_C = this._loaderC.getResultSizes();

	this._customLinesCoordsArr_A = this._translateToRelativeCoords(
		pointCoordsArr_innerShape_A,
		this._getRelativeMultipliers(pointCoordsArr_svgSizes_A)
	);
	this._customLinesCoordsArr_B = this._translateToRelativeCoords(
		pointCoordsArr_innerShape_B,
		this._getRelativeMultipliers(pointCoordsArr_svgSizes_B)
	);
	this._customLinesCoordsArr_C = this._translateToRelativeCoords(
		pointCoordsArr_innerShape_C,
		this._getRelativeMultipliers(pointCoordsArr_svgSizes_C)
	);

	for (var i = 0; i < this._customLinesCoordsArr_A[this._geometryPointsArrIndex].length; i++) {
		this._customLinesArr.push( new CustomLineMesh({
			verticesPositions: this._customLinesCoordsArr_A[this._geometryPointsArrIndex][i],
			material: new THREE.PointsMaterial({
				size: 16 - (i % 5) * 1.5,
//				size: 8 - (i % 5 / 0.8),
				map: this._dotTexture,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				transparent : true,
				color: 0xfffc00
			}),
			animationDuration: this._animationDuration_InnerPatternLines,
			z: 0
		}) );
	}

	for (var i = 0; i < this._customLinesArr.length; i++) {
		this._customLinesArr[i].getParticles().scale.x = multiplier * 0.9;
		this._customLinesArr[i].getParticles().scale.y = multiplier * 0.65;
		this._customLinesArr[i].getParticles().translateX(this._axisOffsets.x - 20);
//		this._customLinesArr[i].getParticles().translateX(this._axisOffsets.x - 35);
		this._customLinesArr[i].getParticles().translateY(this._axisOffsets.y);
		this._scene.add(this._customLinesArr[i].getParticles());
	}

	this._meshesArr = this._meshesArr.concat(this._customLinesArr);
};

try {
	module.exports = BreforeLeaveAnimation;
} catch (err) {
	console.warn(err);
}
