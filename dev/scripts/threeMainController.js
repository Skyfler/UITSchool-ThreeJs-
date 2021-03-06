"use strict";

try {
	var THREE = require('three');
	require("./../../node_modules/three/examples/js/utils/GeometryUtils.js")(THREE);
	require("./../../node_modules/three/examples/js/loaders/OBJLoader.js")(THREE);
//	window.THREE = THREE;

	var Helper = require('./helper');
	var SvgLoader = require('./threeMainController-svgLoader');
	var ModalWindow = require('./modalWindow');
} catch (err) {
	console.warn(err);
}

function ThreeMainController(options) {
	options.name = options.name || 'ThreeMainController';
	Helper.call(this, options);

	if (!this._webglAvailable()) {
		console.warn(this.NAME + ': WebGL is not supported!');
		new ModalWindow({
			modalClass: 'error_notification',
			modalInnerHTML: '<p>Не удалось обнаружить WebGL!</p>' +
			'<p>Похоже, что ваш браузер не поддерживает WebGL.</p>' +
			'<p>Вы можете проверить браузер на поддержку WebGL <a href="https://get.webgl.org/" target="_blank">здесь</a>.</p>'
		});

		return;
	}

	this._rendererElem = options.renderElem;
	this._idleAnimationDuration = options.idleAnimationDuration;
	this._widthCancelModesArr = options.widthCancelModesArr || ['xs', 'sm'];
	this._widthActiveModesArr = options.widthActiveModesArr || ['md', 'lg'];

	this._startOnLoad = this._startOnLoad.bind(this);
	this._renderLoop = this._renderLoop.bind(this);
	this._updateMeshes = this._updateMeshes.bind(this);
	this._cancelOnMobile = this._cancelOnMobile.bind(this);
	this._onCustomMeshVerticesUpdateStarted = this._onCustomMeshVerticesUpdateStarted.bind(this);
	this._onCustomMeshVerticesUpdateComplete = this._onCustomMeshVerticesUpdateComplete.bind(this);

	this._init();
}

ThreeMainController.prototype = Object.create(Helper.prototype);
ThreeMainController.prototype.constructor = ThreeMainController;

ThreeMainController.prototype._webglAvailable = function() {
	try {
		var canvas = document.createElement("canvas");
		return !!
			window.WebGLRenderingContext &&
			(canvas.getContext("webgl") ||
				canvas.getContext("experimental-webgl"));
	} catch(e) {
		return false;
	}
};

ThreeMainController.prototype._init = function() {
	var width, height;

	this._parentElem = this._rendererElem.parentElement;

	if (this._parentElem === document.body) {
		width = parseInt(window.innerWidth),
		height = parseInt(window.innerHeight);
	} else {
		width = parseInt(this._parentElem.clientWidth),
		height = parseInt(this._parentElem.clientHeight);
	}

	this._svgLoadersArr = [];
	this._meshesArr = [];
	this._customLinesArr = [];
	this._meshesWithAnimationInProgress = [];

	this._geometryPointsArrIndex = 0;
	this._cameraOffset = 0;

	this._camera = new THREE.PerspectiveCamera( 45, width/height, 0.1, 10000 );
	this._camera.position.z = 400;
//	window.camera = this._camera;
	this._scene = new THREE.Scene();
	this._scene.name = 'scene';
//	window.scene = this._scene;

	this._dotTexture = new THREE.Texture( this._generateDotTexture() );
	this._dotTexture.needsUpdate = true; // important!

	this._renderer = new THREE.WebGLRenderer({
		canvas: this._rendererElem,
		alpha: true
	});
//	window.renderer = this._renderer;
	this._renderer.setClearColor(0xffffff, 0);
	this._renderer.setPixelRatio( window.devicePixelRatio );
	this._renderer.setSize(width, height);
};

ThreeMainController.prototype._createSvgLoader = function(urlsToLoadArr, startLoading) {
	var loader = new SvgLoader({
		urlsToLoadArr: urlsToLoadArr,
		startLoading: !!startLoading,
		initiator: this
	});

	this._svgLoadersArr.push(loader);

	return loader;
};

ThreeMainController.prototype._startLoaders = function() {
	for (var i = 0; i < this._svgLoadersArr.length; i++) {
		this._svgLoadersArr[i].loadingStart();
	}
};

ThreeMainController.prototype._loadersReady = function() {
	for (var i = 0; i < this._svgLoadersArr.length; i++) {
		if (!this._svgLoadersArr[i].loadingComplete) {
			return false;
		}
	}

	return true;
};

ThreeMainController.prototype._executeOnDesktop = function(callback) {
	var widthMode = this._checkScreenWidth();
	if (this._widthActiveModesArr.indexOf(widthMode) !== -1) {
		callback();
	} else {
		var self = this;
		this._addListener(window, 'resize', function checkForStart() {
			var widthMode = self._checkScreenWidth();
			if (self._widthActiveModesArr.indexOf(widthMode) !== -1) {
				self._removeListener(window, 'resize', checkForStart);
				callback();
			}
		});
	}
};

ThreeMainController.prototype._generateDotTexture = function() {
	var canvas = document.createElement( 'canvas' );
	canvas.width = 8;
	canvas.height = 8;

	var context = canvas.getContext('2d');
	var centerX = canvas.width / 2;
	var centerY = canvas.height / 2;
	var radius = 2;

	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	context.fillStyle = 'rgba(255, 255, 255, 1)';
	context.fill();

	return canvas;
};

ThreeMainController.prototype._getRelativeMultipliers = function(svgSizeArr) {
	var result = [],
		svgSizeObj,
		relX,
		relY;

	for (var i = 0; i < svgSizeArr.length; i++) {
		svgSizeObj = svgSizeArr[i];

		relX = 1 / Math.abs(svgSizeObj.maxX - svgSizeObj.minX);
		relY = 1 / Math.abs(svgSizeObj.maxY - svgSizeObj.minY);

		result.push({
			relX: relX,
			relY: relY,
			minX: svgSizeObj.minX,
			maxX: svgSizeObj.maxX,
			minY: svgSizeObj.minY,
			maxY: svgSizeObj.maxY
		});
	}

	return result;
};

ThreeMainController.prototype._translateToRelativeCoords = function(pointCoordinatesArraysArr, sizeObjArr) {
	var pointCoordinatesArrRow,
		pointCoordinatesArr,
		relPointCoordinatesThreeDimArr = [],
		relPointCoordinatesTwoDimArr,
		relPointCoordinatesArr,
		sizeObj;

	for (var j = 0; j < pointCoordinatesArraysArr.length; j++) {
		pointCoordinatesArrRow = pointCoordinatesArraysArr[j];
		relPointCoordinatesTwoDimArr = [];
		sizeObj = sizeObjArr[j];

		for (var i = 0; i < pointCoordinatesArrRow.length; i++) {
			pointCoordinatesArr = pointCoordinatesArrRow[i];
			relPointCoordinatesArr = [];

			for (var k = 0; k < pointCoordinatesArr.length; k++) {
				relPointCoordinatesArr.push({
					x: pointCoordinatesArr[k].x * sizeObj.relX,
					y: 1 - pointCoordinatesArr[k].y * sizeObj.relY
				});
			}

			relPointCoordinatesTwoDimArr.push(relPointCoordinatesArr);
		}

		relPointCoordinatesThreeDimArr.push(relPointCoordinatesTwoDimArr);
	}

	return relPointCoordinatesThreeDimArr;
};

ThreeMainController.prototype._redrawMeshes = function() {
	for (var i = 0; i < this._meshesArr.length; i++) {
		this._meshesArr[i].redrawMesh();
	}
};

ThreeMainController.prototype._renderLoop = function(time) {
	this._camera.position.x += (-this._cameraOffset - this._camera.position.x) * 0.05;
	this._camera.lookAt(this._scene.position);
	this._redrawMeshes();

	this._renderer.render(this._scene, this._camera);
	this._renderRAFId = requestAnimationFrame(this._renderLoop);
};

ThreeMainController.prototype._startOnLoad = function(){
	this._renderLoop();
	this._updateMeshes();

	this._addListener(document, 'customMeshVerticesUpdateStarted', this._onCustomMeshVerticesUpdateStarted);
	this._addListener(document, 'customMeshVerticesUpdateComplete', this._onCustomMeshVerticesUpdateComplete);

	this._idleAnimation();

	this._loadingComplete = true;

	this._addListener(window, 'resize', this._cancelOnMobile);
	this._addListener(window, 'resize', this._updateMeshes);
};

ThreeMainController.prototype._updateMeshes = function() {
	if (this._widthCancelModesArr.indexOf(this._checkScreenWidth()) !== -1) return;

	var width, height;

	if (this._parentElem === document.body) {
		width = parseInt(window.innerWidth),
		height = parseInt(window.innerHeight);
	} else {
		width = parseInt(this._parentElem.clientWidth),
		height = parseInt(this._parentElem.clientHeight);
	}

	this._renderer.setSize(width, height);

	this._camera.aspect = width/height;
	this._camera.updateProjectionMatrix();
};

ThreeMainController.prototype._visibleHeightAtZDepth = function(depth, camera) {
	// compensate for cameras not positioned at z=0
	var cameraOffset = camera.position.z;
	if (depth < cameraOffset) {
		depth -= cameraOffset;
	} else {
		depth += cameraOffset;
	}

	// vertical fov in radians
	var vFOV =  camera.fov * Math.PI / 180;

	// Math.abs to ensure the result is always positive
	return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
};

ThreeMainController.prototype._visibleHeightWithOffsetAtZDepth = function(depth, camera, offsetY) {
	var height = this._visibleHeightAtZDepth(depth, camera);
	var offsetHeight = ((window.innerHeight - (offsetY || 0)) / (window.innerHeight / 100)) / 100;

	return height * offsetHeight;
};

ThreeMainController.prototype._visibleWidthWithOffsetAtZDepth = function(depth, camera, offsetX) {
	var height = this._visibleHeightAtZDepth(depth, camera);

	return height * ((window.innerWidth - (offsetX || 0)) / window.innerHeight);
};

ThreeMainController.prototype._onCustomMeshVerticesUpdateStarted = function(e) {
	var customLineMesh = e.detail.self;

	if (this._customLinesArr.indexOf(customLineMesh) === -1) {
//		console.warn(this.NAME + ': Custom Mesh is not found in Custom Lines Array!');

	} else {
		if (this._meshesWithAnimationInProgress.indexOf(customLineMesh) !== -1) {
//			console.warn('ThreeMainController: Custom Mesh is already in Animation in Progress Array!');

		} else {
			this._meshesWithAnimationInProgress.push(customLineMesh);

		}

	}
};

ThreeMainController.prototype._onCustomMeshVerticesUpdateComplete = function(e) {
	var customLineMesh = e.detail.self;

	if (this._customLinesArr.indexOf(customLineMesh) === -1) {
//		console.warn(this.NAME + ': Custom Mesh is not found in Custom Lines Array!');

	} else {
		if (this._meshesWithAnimationInProgress.indexOf(customLineMesh) === -1) {
//			console.warn(this.NAME + ': Custom Mesh is not found in Animation in Progress Array!');

		} else {
			var index = this._meshesWithAnimationInProgress.indexOf(customLineMesh);
			this._meshesWithAnimationInProgress.splice(index, 1);

			this._idleAnimation();
		}

	}
};

ThreeMainController.prototype._idleAnimation = function() {
	if (this._meshesWithAnimationInProgress.length === 0) {

		var coordsCExist = this._customLinesCoordsArr_C && this._customLinesCoordsArr_C[this._geometryPointsArrIndex] ? true : false;

		for (var i = 0; i < this._customLinesArr.length; i++) {
			this._customLinesArr[i].setAnimationDuration(this._idleAnimationDuration);

			if (this._customLinesArr[i].getVerteciesPositions() === this._customLinesCoordsArr_A[this._geometryPointsArrIndex][i]) {
				this._customLinesArr[i].setVerteciesPositions(this._customLinesCoordsArr_B[this._geometryPointsArrIndex][i]);

			} else if (this._customLinesArr[i].getVerteciesPositions() === this._customLinesCoordsArr_B[this._geometryPointsArrIndex][i]) {
				if (coordsCExist) {
					this._customLinesArr[i].setVerteciesPositions(this._customLinesCoordsArr_C[this._geometryPointsArrIndex][i]);
				} else {
					this._customLinesArr[i].setVerteciesPositions(this._customLinesCoordsArr_A[this._geometryPointsArrIndex][i]);
				}

			} else if (coordsCExist
					   && this._customLinesArr[i].getVerteciesPositions() === this._customLinesCoordsArr_C[this._geometryPointsArrIndex][i]) {
				this._customLinesArr[i].setVerteciesPositions(this._customLinesCoordsArr_A[this._geometryPointsArrIndex][i]);

			} else {
				console.warn(this.NAME + ': Custom Mesh Vertices Positions Array does not match A or B Coordinates Arrays!');

			}
		}
	}
};

ThreeMainController.prototype._cancelOnMobile = function() {
	var widthMode = this._checkScreenWidth();

	if (this._widthCancelModesArr.indexOf(widthMode) !== -1) {
		if (this._renderRAFId) {
			cancelAnimationFrame(this._renderRAFId);
			delete this._renderRAFId;
			this._rendererElem.style.display = 'none';
		}

	} else if (!this._renderRAFId) {
		this._rendererElem.style.display = '';
		this._renderLoop();

	}
};

try {
	module.exports = ThreeMainController;
} catch (err) {
	console.warn(err);
}
