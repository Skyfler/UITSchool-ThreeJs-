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

function CenterMain(options) {
	this._urlsToLoad_innerShape_A = options.urlsToLoad_innerShape_A;
	this._urlsToLoad_innerShape_B = options.urlsToLoad_innerShape_B;
	this._urlsToLoadObj_courses = options.urlsToLoadObj_courses;

	this._animationDuration_InnerPatternLines = options.animationDuration_InnerPatternLines || 1000;
	this._animationDuration_OuterCircles = options.animationDuration_OuterCircles || 5000;
	this._animationDuration_CoursesPatternLines = options.animationDuration_CoursesPatternLines || 1000;
	this._animationDuration_CoursesPatternLinesRotation = options.animationDuration_CoursesPatternLinesRotation || 100000;

	this._onIndexMenuItemSelected = this._onIndexMenuItemSelected.bind(this);

	options.name = options.name || 'Three-CenterMain';
	ThreeMainController.call(this, options);
}

CenterMain.prototype = Object.create(ThreeMainController.prototype);
CenterMain.prototype.constructor = CenterMain;

CenterMain.prototype._init = function() {
	ThreeMainController.prototype._init.apply(this, arguments);

	var self = this;
	this._addListener(document, 'indexMenuInitialisationComplete', function waitTillMenuReady(e) {
		self._removeListener(document, 'indexMenuInitialisationComplete', waitTillMenuReady);
		self._indexMenuInitialisationComplete = true;
		self._executeOnDesktop(self._startOnLoad);
	});
	this._addListener(document, 'svgLoaderLoadingComplete', function waitTillLoadingComplete(e) {
		self._executeOnDesktop(self._startOnLoad);
	});

	this._addListener(document, 'indexMenuItemSelected', this._onIndexMenuItemSelected);

	this._circlesArr = [];
	this._iconMeshesWithAnimationInProgress = [];

	this._iconsRelCoolrds = {};
	this._iconMeshPivotsPositions = {};

	this._iconMeshes = [];
	this._iconMeshPivots = [];

	this._loaderA = this._createSvgLoader(this._urlsToLoad_innerShape_A);
	this._loaderB = this._createSvgLoader(this._urlsToLoad_innerShape_B);

	this._coursesLoaders = {};
	for (var key in this._urlsToLoadObj_courses) {
		this._coursesLoaders[key] = this._createSvgLoader(this._urlsToLoadObj_courses[key]);
	}

	this._executeOnDesktop(this._startLoaders.bind(this));
};

CenterMain.prototype._updateMeshes = function() {
	ThreeMainController.prototype._updateMeshes.apply(this, arguments);

	var multheight, multwidth;

	var topOffset = document.querySelector('.top_panel').offsetHeight;
	var bottomOffset = document.querySelector('footer').offsetHeight;
	var leftMenu = document.querySelector('#carousel_menu_left');
	var leftOffset = leftMenu.offsetHeight > 0 ? leftMenu.offsetWidth : 0;
	var rightOffset = document.querySelector('#carousel_menu_right').offsetWidth;

	var multheight = this._visibleHeightWithOffsetAtZDepth(
		0,
		this._camera,
		topOffset + bottomOffset
//		0
	);
	var multwidth = this._visibleWidthWithOffsetAtZDepth(
		0,
		this._camera,
		leftOffset + rightOffset
//		0
	);
	var multiplier = Math.min(multheight, multwidth);

	this._axisOffsets = this._calculateAxisOffsets(topOffset, bottomOffset, rightOffset, leftOffset);

	for (var i = 0; i < this._customLinesArr.length; i++) {
		this._customLinesArr[i].getParticles().scale.x = multiplier * 0.9;
		this._customLinesArr[i].getParticles().scale.y = multiplier * 0.65;
		this._customLinesArr[i].getParticles().position.x = this._axisOffsets.x - 35;
		this._customLinesArr[i].getParticles().position.y = this._axisOffsets.y;
	}

	for (var i = 0; i < this._circlesArr.length; i++) {
		this._circlesArr[i].getParticles().scale.x = multiplier / 2;
		this._circlesArr[i].getParticles().scale.y = multiplier / 2;
		this._circlesArr[i].getParticles().position.x = this._axisOffsets.x;
		this._circlesArr[i].getParticles().position.y = this._axisOffsets.y;
	}

	for (var i = 0; i < this._iconMeshes.length; i++) {
		this._iconMeshes[i].getParticles().scale.x = multiplier * 0.45;
		this._iconMeshes[i].getParticles().scale.y = multiplier * 0.45;
		this._iconMeshes[i].getParticles().position.x = this._axisOffsets.x;
		this._iconMeshes[i].getParticles().position.y = this._axisOffsets.y;
	}
};

CenterMain.prototype._calculateAxisOffsets = function(topOffset, bottomOffset, rightOffset, leftOffset) {
	return {
		x: leftOffset - rightOffset - ( (window.innerWidth / 100) - ((window.innerWidth - (leftOffset - rightOffset)) / 100) ) * 50,
		y: bottomOffset - topOffset - ( (window.innerHeight / 100) - ((window.innerHeight - (bottomOffset - topOffset)) / 100) ) * 50
	}
};

CenterMain.prototype._startOnLoad = function() {
	if (this._indexMenuInitialisationComplete && this._loadersReady()) {
		this._active = true;

		var topOffset = document.querySelector('.top_panel').offsetHeight;
		var bottomOffset = document.querySelector('footer').offsetHeight;
		var leftMenu = document.querySelector('#carousel_menu_left');
		var leftOffset = leftMenu.offsetHeight > 0 ? leftMenu.offsetWidth : 0;
		var rightOffset = document.querySelector('#carousel_menu_right').offsetWidth;

		var multheight = this._visibleHeightWithOffsetAtZDepth(
			0,
			this._camera,
			topOffset + bottomOffset
//			0
		);
		var multwidth = this._visibleWidthWithOffsetAtZDepth(
			0,
			this._camera,
			leftOffset + rightOffset
//			0
		);
		var multiplier = Math.min(multheight, multwidth);

		this._axisOffsets = this._calculateAxisOffsets(topOffset, bottomOffset, rightOffset, leftOffset);

		this._createInnerPatternLines(multiplier);
		this._createOuterCircles(multiplier);
		this._createCoursesPatternLines(multiplier);

		this._meshesArr = this._meshesArr.concat(this._customLinesArr, this._circlesArr);

		ThreeMainController.prototype._startOnLoad.apply(this, arguments);

		this._centerIconMeshesInBasicState();
		this._startRotation();

		if (this._iconToSet) {
			this._changeIcon(this._iconToSet);
			delete this._iconToSet;
		}
	}
};

CenterMain.prototype._createInnerPatternLines = function(multiplier) {
	var pointCoordsArr_innerShape_A = this._loaderA.getResultCoords();
	var pointCoordsArr_innerShape_B = this._loaderB.getResultCoords();

	var pointCoordsArr_svgSizes_A = this._loaderA.getResultSizes();
	var pointCoordsArr_svgSizes_B = this._loaderB.getResultSizes();

	this._customLinesCoordsArr_A = this._translateToRelativeCoords(
		pointCoordsArr_innerShape_A,
		this._getRelativeMultipliers(pointCoordsArr_svgSizes_A)
	);
	this._customLinesCoordsArr_B = this._translateToRelativeCoords(
		pointCoordsArr_innerShape_B,
		this._getRelativeMultipliers(pointCoordsArr_svgSizes_B)
	);

	for (var i = 0; i < this._customLinesCoordsArr_A[this._geometryPointsArrIndex].length; i++) {
		this._customLinesArr.push( new CustomLineMesh({
			verticesPositions: this._customLinesCoordsArr_A[this._geometryPointsArrIndex][i],
			material: new THREE.PointsMaterial({
				size: 8 - (i % 5 / 0.8),
				map: this._dotTexture,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				transparent : true,
				color: 0xffffff
			}),
			animationDuration: this._animationDuration_InnerPatternLines,
			z: 0
		}) );
	}

	for (var i = 0; i < this._customLinesArr.length; i++) {
		this._customLinesArr[i].getParticles().scale.x = multiplier * 0.9;
		this._customLinesArr[i].getParticles().scale.y = multiplier * 0.65;
		this._customLinesArr[i].getParticles().translateX(this._axisOffsets.x - 35);
		this._customLinesArr[i].getParticles().translateY(this._axisOffsets.y);
		this._scene.add(this._customLinesArr[i].getParticles());
	}

	this._meshesArr = this._meshesArr.concat(this._customLinesArr);
};

CenterMain.prototype._createOuterCircles = function(multiplier) {
	this._circlesArr.push( new CustomCircle({
		centerPosition: {x: 0, y: 0},
//		radius: 0.86,
		radius: 0.70,
		pointsCount: 200,
		material: new THREE.PointsMaterial({
			size: 8,
			map: this._dotTexture,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent : true,
			color: 0xffffff
		}),
		animationDuration: this._animationDuration_OuterCircles
	}) );

	this._circlesArr.push( new CustomCircle({
		centerPosition: {x: 0, y: 0},
//		radius: 0.90,
		radius: 0.74,
		pointsCount: 500,
		material: new THREE.PointsMaterial({
			size: 5,
			map: this._dotTexture,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent : true,
			color: 0xffffff
		}),
		animationDuration: this._animationDuration_OuterCircles
	}) );

	this._circlesArr.push( new CustomCircle({
		centerPosition: {x: 0, y: 0},
//		radius: 0.90,
		radius: 0.82,
		pointsCount: 64,
		material: new THREE.PointsMaterial({
			size: 5,
			map: this._dotTexture,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent : true,
		color: 0xffffff
		}),
		animationDuration: this._animationDuration_OuterCircles
	}) );

	for (var i = 0; i < this._circlesArr.length; i++) {
		this._circlesArr[i].getParticles().scale.x = multiplier / 2;
		this._circlesArr[i].getParticles().scale.y = multiplier / 2;
		this._circlesArr[i].getParticles().translateX(this._axisOffsets.x);
		this._circlesArr[i].getParticles().translateY(this._axisOffsets.y);
		this._scene.add(this._circlesArr[i].getParticles());
	}

	this._circlesArr[0].setRotation(4000000, false, true);
	this._circlesArr[1].setRotation(6000000, true, true);
	this._circlesArr[2].setRotation(8000000, false, true);

	this._meshesArr = this._meshesArr.concat(this._circlesArr);
};

CenterMain.prototype._createCoursesPatternLines = function(multiplier) {
	this._currentIcon = 'basic';

	for (var key in this._coursesLoaders) {
		this._iconsRelCoolrds[key] = this._translateToRelativeCoords(
			this._coursesLoaders[key].getResultCoords(),
			this._getRelativeMultipliers(this._coursesLoaders[key].getResultSizes())
		);

		this._iconMeshPivotsPositions[key] = [];
	}

	var sizesArr = [2.25, 2.25, 2.25, 2.25, 4.5, 6.75, 6.75, 6.75, 6.75, 6.75, 6.75, 6.75, 9, 9, 9, 9, 9, 9, 9, 9, 9, 6.75, 9];

	for (var i = 0; i < this._iconsRelCoolrds[this._currentIcon][0].length; i++) {
		this._iconMeshes.push( new CustomLineMesh({
			verticesPositions: this._iconsRelCoolrds[this._currentIcon][0][i],
			material: new THREE.PointsMaterial({
//				size: 8 - (i % 5 / 0.8),
//				size: Math.random() * (10 - 1) + 1,
//				size: (i % 3) * 1.5 + 6,
				size: sizesArr[i],
				map: this._dotTexture,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				transparent : true,
				color: 0xfffc00
			}),
			animationDuration: this._animationDuration_CoursesPatternLines,
			z: 0,
			name: 'iconCustomMesh_' + i
		}) );

		for (var key in this._iconMeshPivotsPositions) {
			this._iconMeshPivotsPositions[key][i] = {
				x: 0,
				y: 0,
				z: 0,
			};
		}
	}

	var	pivot;
	for (var i = 0; i < this._iconMeshes.length; i++) {
		this._iconMeshes[i].getParticles().scale.x = multiplier * 0.45;
		this._iconMeshes[i].getParticles().scale.y = multiplier * 0.45;
		this._iconMeshes[i].getParticles().translateX(this._axisOffsets.x);
		this._iconMeshes[i].getParticles().translateY(this._axisOffsets.y);

		pivot = new PivotObj({
			animationDuration: this._animationDuration_CoursesPatternLines,
			name: 'iconMeshPivot_' + i
		});
		this._iconMeshPivots.push(pivot);
//		this._iconMeshes[i].getParticles().translateX(-35);
		this._scene.add(pivot._object);
		pivot._object.add(this._iconMeshes[i].getParticles());
	}

	this._meshesArr = this._meshesArr.concat(this._iconMeshes, this._iconMeshPivots);
};

CenterMain.prototype._centerIconMeshesInBasicState = function() {
	for (var i = 0, vertArr; i < this._iconMeshes.length; i++) {
		this._iconMeshes[i]._geometry.computeBoundingBox();

		this._iconMeshPivotsPositions[this._currentIcon][i].x = (this._iconMeshes[i]._geometry.boundingBox.max.x - this._iconMeshes[i]._geometry.boundingBox.min.x) / 2 + this._iconMeshes[i]._geometry.boundingBox.min.x;
		this._iconMeshPivotsPositions[this._currentIcon][i].y = (this._iconMeshes[i]._geometry.boundingBox.max.y - this._iconMeshes[i]._geometry.boundingBox.min.y) / 2 + this._iconMeshes[i]._geometry.boundingBox.min.y;
		this._iconMeshPivotsPositions[this._currentIcon][i].z = (this._iconMeshes[i]._geometry.boundingBox.max.z - this._iconMeshes[i]._geometry.boundingBox.min.z) / 2 + this._iconMeshes[i]._geometry.boundingBox.min.z;

		this._iconMeshes[i]._geometry.center();

		vertArr = this._iconMeshes[i]._geometry.vertices;
		for (var j = 0; j < vertArr.length; j++) {
			this._iconsRelCoolrds['basic'][0][i][j].x = vertArr[j].x + 0.5;
			this._iconsRelCoolrds['basic'][0][i][j].y = vertArr[j].y + 0.5;
			this._iconsRelCoolrds['basic'][0][i][j].z = vertArr[j].z + 0.5;
		}
	}

	this._setIconMeshPivotsPosition(this._currentIcon, true);
};

CenterMain.prototype._onIndexMenuItemSelected = function(e) {
	var icon = e.detail.icon;
	if (!icon) {
		icon = 'basic';
	}
	if (this._active) {
		this._changeIcon(icon);
	} else {
		this._iconToSet = icon;
	}
};

CenterMain.prototype._changeIcon = function(iconName) {
	if (iconName in this._iconMeshes || this._currentIcon === iconName) return;

	this._resetRotation();
	for (var i = 0; i < this._iconMeshes.length; i++) {
		this._iconMeshes[i].setVerteciesPositions(this._iconsRelCoolrds[iconName][0][i]);
	}
	this._setIconMeshPivotsPosition(iconName);

	this._currentIcon = iconName;
};

CenterMain.prototype._setIconMeshPivotsPosition = function(iconName, noTransition) {
	for (var i = 0; i < this._iconMeshes.length; i++) {
		this._iconMeshPivots[i].setPositions({
			x: this._iconMeshPivotsPositions[iconName][i].x * this._iconMeshes[i].getParticles().scale.x,
			y: this._iconMeshPivotsPositions[iconName][i].y * this._iconMeshes[i].getParticles().scale.y,
			z: this._iconMeshPivotsPositions[iconName][i].z * this._iconMeshes[i].getParticles().scale.z
		}, noTransition);
	}
};

CenterMain.prototype._startRotation = function() {
	for (var i = 0; i < this._iconMeshes.length; i++) {
		this._iconMeshes[i].setRotation((i + 1) * this._animationDuration_CoursesPatternLinesRotation, i % 2, true);
	}
};

CenterMain.prototype._resetRotation = function() {
	var angle,
		clockwise;
	for (var i = 0; i < this._iconMeshes.length; i++) {
//		angle = this._iconMeshes[i].getParticles().rotation.z % 360;
//		clockwise = (angle >= 180) || ((angle > -180) && (angle < 0));

		this._iconMeshes[i].stopRotation();

		var multiplierX = this._iconMeshes[i].getParticles().scale.x,
			multiplierY = this._iconMeshes[i].getParticles().scale.y,
			tranlationX = this._iconMeshes[i].getParticles().position.x,
			tranlationY = this._iconMeshes[i].getParticles().position.y,
			tranlationZ = this._iconMeshes[i].getParticles().position.z;

		this._iconMeshes[i].getParticles().scale.x = 1;
		this._iconMeshes[i].getParticles().scale.y = 1;
		this._iconMeshes[i].getParticles().position.x = 0;
		this._iconMeshes[i].getParticles().position.y = 0;
		this._iconMeshes[i].getParticles().position.z = 0;

		this._iconMeshes[i].getParticles().updateMatrix();
		this._iconMeshes[i]._geometry.applyMatrix(this._iconMeshes[i]._particles.matrix);
		this._iconMeshes[i].getParticles().matrix.identity();

		this._iconMeshes[i].getParticles().rotation.z = 0;
		this._iconMeshes[i].getParticles().scale.x = multiplierX;
		this._iconMeshes[i].getParticles().scale.y = multiplierY;
		this._iconMeshes[i].getParticles().position.x = tranlationX;
		this._iconMeshes[i].getParticles().position.y = tranlationY;
		this._iconMeshes[i].getParticles().position.z = tranlationZ;

//		this._iconMeshes[i].setRotation(this._animationDuration_CoursesPatternLines, !clockwise, false, 0);
	}
};

CenterMain.prototype._onCustomMeshVerticesUpdateStarted = function(e) {
	var customLineMesh = e.detail.self;

	if (this._iconMeshes.indexOf(customLineMesh) === -1) {
		ThreeMainController.prototype._onCustomMeshVerticesUpdateStarted.apply(this, arguments);
	} else {
		this._onIconsVerticesUpdateStarted(e);
	}
};

CenterMain.prototype._onCustomMeshVerticesUpdateComplete = function(e) {
	var customLineMesh = e.detail.self;

	if (this._iconMeshes.indexOf(customLineMesh) === -1) {
		ThreeMainController.prototype._onCustomMeshVerticesUpdateComplete.apply(this, arguments);
	} else {
		this._onIconsVerticesUpdateComplete(e);
	}
};

CenterMain.prototype._onIconsVerticesUpdateStarted = function(e) {
	var customLineMesh = e.detail.self;

	if (this._iconMeshes.indexOf(customLineMesh) === -1) {
		console.warn(this.NAME + ': Icon Mesh is not found in Icons Array!');

	} else {
		if (this._iconMeshesWithAnimationInProgress.indexOf(customLineMesh) !== -1) {
//			console.warn(this.NAME + ': Custom Mesh is already in Animation in Progress Array!');

		} else {
			this._iconMeshesWithAnimationInProgress.push(customLineMesh);

		}

	}
};

CenterMain.prototype._onIconsVerticesUpdateComplete = function(e) {
	var customLineMesh = e.detail.self;

	if (this._iconMeshes.indexOf(customLineMesh) === -1) {
		console.warn(this.NAME + ': Icon Mesh is not found in Icon Array!');

	} else {
		if (this._iconMeshesWithAnimationInProgress.indexOf(customLineMesh) === -1) {
			console.warn(this.NAME + ': Icon Mesh is not found in Animation in Progress Array!');

		} else {
			var index = this._iconMeshesWithAnimationInProgress.indexOf(customLineMesh);
			this._iconMeshesWithAnimationInProgress.splice(index, 1);

//			this._idleAnimation();

			if (this._currentIcon === 'basic') {
				this._startRotation();
			}
		}

	}
};

try {
	module.exports = CenterMain;
} catch (err) {
	console.warn(err);
}
