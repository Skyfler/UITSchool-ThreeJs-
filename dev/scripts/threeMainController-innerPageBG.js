"use strict";

try {
	var THREE = require('three');

	var ThreeMainController = require('./threeMainController');
	var CustomLineMesh = require('./threeMainController-customLineMesh');
} catch (err) {
	console.warn(err);
}

function InnerPageBG(options) {
	this._urlsToLoad_A = options.urlsToLoad_A;
	this._urlsToLoad_B = options.urlsToLoad_B;
	this._switchAnimationDuration = options.switchAnimationDuration;
	this._initalGeometryIndex = options.initalGeometryIndex || 0;
	this._initalMeshColor = options.initalMeshColor || 'ffffff';
	this._scaleMultiplier = {
		x: 1.1,
		y: 1.1
	}

	this._onPageSlideChanged = this._onPageSlideChanged.bind(this);

	options.name = options.name || 'Three-InnerPageBG';

	ThreeMainController.call(this, options);
}

InnerPageBG.prototype = Object.create(ThreeMainController.prototype);
InnerPageBG.prototype.constructor = InnerPageBG;

InnerPageBG.prototype._init = function() {
	ThreeMainController.prototype._init.apply(this, arguments);

	var self = this;
	this._addListener(document, 'svgLoaderLoadingComplete', function waitTillLoadingComplete(e) {
		if (e.detail.initiator === self) {
			self._executeOnDesktop(self._startOnLoad);
		}
	});
	this._addListener(document, 'pageSlideChanged', this._onPageSlideChanged);
	this._addListener(document, 'mousemove', function(e){
		this._cameraOffset = (parseInt(e.clientX) - window.innerWidth / 2) * 0.05;
	}.bind(this));

	this._updateParams = {
		geometryIndex: this._initalGeometryIndex || 0,
		color: this._initalMeshColor || 'ffffff'
	};

	this._createSvgLoader(this._urlsToLoad_A);
	this._createSvgLoader(this._urlsToLoad_B);

	this._executeOnDesktop(this._startLoaders.bind(this));
};

InnerPageBG.prototype._updateMeshes = function() {
	ThreeMainController.prototype._updateMeshes.apply(this, arguments);

	var multheight, multwidth;

	var vec = new THREE.Vector3();

	for (var i = 0; i < this._customLinesArr.length; i++) {
		this._customLinesArr[i]._geometry.computeBoundingBox();

		multheight = this._visibleHeightWithOffsetAtZDepth(this._customLinesArr[i]._geometry.boundingBox.min.z, this._camera, 68);
		multwidth = this._visibleWidthWithOffsetAtZDepth(this._customLinesArr[i]._geometry.boundingBox.min.z, this._camera, 0);

		this._customLinesArr[i].getParticles().scale.x = multwidth * this._scaleMultiplier.x;
		this._customLinesArr[i].getParticles().scale.y = multheight * this._scaleMultiplier.y;
	}
};

InnerPageBG.prototype._startOnLoad = function(){
	if (this._loadersReady()) {

		var pointCoordsArr_A = this._svgLoadersArr[0].getResultCoords();
		var pointCoordsArr_B = this._svgLoadersArr[1].getResultCoords();

		var pointCoordsArr_svgSizes_A = this._svgLoadersArr[0].getResultSizes();
		var pointCoordsArr_svgSizes_B = this._svgLoadersArr[1].getResultSizes();

		this._customLinesCoordsArr_A = this._translateToRelativeCoords(
			pointCoordsArr_A,
			this._getRelativeMultipliers(pointCoordsArr_svgSizes_A)
		);
		this._customLinesCoordsArr_B = this._translateToRelativeCoords(
			pointCoordsArr_B,
			this._getRelativeMultipliers(pointCoordsArr_svgSizes_B)
		);

		var multheight, multwidth, z;
		for (var i = 0; i < this._customLinesCoordsArr_A[this._geometryPointsArrIndex].length; i++) {
			z = ((i % 10) < 5) ? (-100 - ((i % 5) * 20)) : (-100 - ((5 - (i % 5) - 1) * 20));

			this._customLinesArr.push( new CustomLineMesh({
				verticesPositions: this._customLinesCoordsArr_A[this._geometryPointsArrIndex][i],
				material: new THREE.PointsMaterial({
					size: (i % 10 < 5) ? 7 - (i % 5) : (i % 5) + 2,
					map: this._dotTexture,
					blending: THREE.AdditiveBlending,
					depthTest: false,
					transparent : true,
					color: 0xffffff
				}),
				animationDuration: 1000,
				z: z
			}) );

			multheight = this._visibleHeightWithOffsetAtZDepth(z, this._camera, 68);
			multwidth = this._visibleWidthWithOffsetAtZDepth(z, this._camera, 0);

			this._customLinesArr[i].getParticles().scale.x = multwidth * this._scaleMultiplier.x;
			this._customLinesArr[i].getParticles().scale.y = multheight * this._scaleMultiplier.y;
			this._customLinesArr[i].getParticles().translateY(-34);
		}

		for (var i = 0; i < this._customLinesArr.length; i++) {
			this._scene.add(this._customLinesArr[i].getParticles());
		}

		this._meshesArr = this._meshesArr.concat(this._customLinesArr);

		ThreeMainController.prototype._startOnLoad.apply(this, arguments);

		this._switchGeometries(true);
	}
};

InnerPageBG.prototype._onPageSlideChanged = function(e) {
	var activeSlide = document.querySelector('#' + e.detail.activeSlideID);

	if (!activeSlide) {
		console.warn(this.NAME + ': Active Slide was not found!');

	} else {
		this._updateParams = {
			geometryIndex: activeSlide.dataset.geometryIndex,
			color: activeSlide.dataset.meshColor
		};
	}

	if (this._loadingComplete) {
		this._switchGeometries();
	}
};

InnerPageBG.prototype._switchGeometries = function(noTransition) {
	if (this._updateParams.geometryIndex === undefined) {
		console.warn(this.NAME + ': Active Slide does not contain geometry index reference!');
	} else {
		if (!this._customLinesCoordsArr_A[this._updateParams.geometryIndex]) {
			console.warn(this.NAME + ': Geomtry with index "' + this._updateParams.geometryIndex + '" does not exist!');

		} else {
			this._geometryPointsArrIndex = this._updateParams.geometryIndex;
			for (var i = 0; i < this._customLinesArr.length; i++) {
				this._customLinesArr[i].setAnimationDuration(this._switchAnimationDuration);
				this._customLinesArr[i].setVerteciesPositions(this._customLinesCoordsArr_A[this._geometryPointsArrIndex][i], noTransition);
			}

		}
	}

	if (!this._updateParams.color) {
		console.warn(this.NAME + ': Active Slide does not contain mesh color reference!');

	} else {
		for (var i = 0; i < this._customLinesArr.length; i++) {
			this._customLinesArr[i].setAnimationDuration(this._switchAnimationDuration);
			this._customLinesArr[i].setMaterialColor(this._updateParams.color, noTransition);
		}

	}
};

try {
	module.exports = InnerPageBG;
} catch (err) {
	console.warn(err);
}
