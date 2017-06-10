"use strict";

try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function SvgLoader(options) {
	options.name = options.name || 'SvgLoader';
	Helper.call(this, options);

	this._urlsToLoadArr = options.urlsToLoadArr;

	if (options.startLoading) {
		this._init();
	}
}

SvgLoader.prototype = Object.create(Helper.prototype);
SvgLoader.prototype.constructor = SvgLoader;

SvgLoader.prototype.loadingStart = function() {
	if (this._loadingStarted) {
		console.warn(this.NAME + ': Cannot start loading as it is already started!');
	} else {
		this._init();
	}
};

SvgLoader.prototype._init = function() {
	this._loadingStarted = true;
	this._resultCoordsArr = [];
	this._resultSizesArr = [];

	for (var i = 0; i < this._urlsToLoadArr.length; i++) {
		this._loadSvg(this._urlsToLoadArr[i], i);
	}
};

SvgLoader.prototype._loadSvg = function(urlToLoad, index) {
	var objectElem = document.createElement('object');
	objectElem.style.width = 0;
	objectElem.style.height = 0;
//	var objectElem.data = 'img/uits_dots/1_start_a.svg';
	objectElem.data = urlToLoad;

//	objectElem.onload = this._readPoints.bind(this, index, objectElem);
	this._addListener(objectElem, 'load', this._readPoints.bind(this, index, objectElem));

	document.body.appendChild(objectElem);
};

SvgLoader.prototype._readPoints = function(index, objectElem) {
	var error = false,
		resultArr = [];
	if (!objectElem.contentDocument) {
		error = this.NAME + ': Loaded file "' + objectElem.data + '" is not a Document!';
	}

	if (!error) {
		var svg = objectElem.contentDocument.querySelector('svg');

		if (!svg) {
			error = this.NAME + ': No SVG Tag was found in file "' + objectElem.data + '"!';
		}
	}

	this._resultSizesArr[index] = {
		minX: svg.viewBox.baseVal.x,
		minY: svg.viewBox.baseVal.y,
		maxX: svg.viewBox.baseVal.width,
		maxY: svg.viewBox.baseVal.height
	};

	if (!error) {
		var groupElems = [];

		var allGroupElems = svg.querySelectorAll('g');
		for (var i = 0; i < allGroupElems.length; i++) {
			if (allGroupElems[i].children.length !== 0 && allGroupElems[i].children[0].tagName !== 'g') {
				groupElems.push(allGroupElems[i]);
			}
		}

		var dots,
			coordinatesArr = [],
			dot,
			d,
			coordinates,
			paths = 0,
			elipses = 0,
			circles = 0;

		for (var j = 0; j < groupElems.length; j++) {
			dots = groupElems[j].children,
			coordinatesArr = [],
			dot,
			d,
			coordinates,
			paths = 0,
			elipses = 0,
			circles = 0;

			for (var i = 0; i < dots.length; i++) {
				dot = dots[i];

				if (dot.tagName === 'path') {
					d = dot.getAttribute('d');
					coordinates = d.slice(1, d.toLowerCase().indexOf('c')).split(',');
					coordinatesArr.push({
						x: parseFloat(coordinates[0]),
						y: parseFloat(coordinates[1])
					});
					paths++;

				} else if (dot.tagName === 'ellipse') {
					coordinatesArr.push({
						x: parseFloat(dot.getAttribute('cx')),
						y: parseFloat(dot.getAttribute('cy'))
					});
					elipses++;

				} else if (dot.tagName === 'circle') {
					coordinatesArr.push({
						x: parseFloat(dot.getAttribute('cx')),
						y: parseFloat(dot.getAttribute('cy'))
					});
					circles++;

				}
			}
			resultArr.push(coordinatesArr);
		}
	}

	if (error) {
		console.warn(error);
	}
	document.body.removeChild(objectElem);

	this._resultCoordsArr[index] = resultArr;

	this._checkLoadingComplete();
};

SvgLoader.prototype._checkLoadingComplete = function() {
	for (var i = 0; i < this._urlsToLoadArr.length; i++) {
		if ((this._resultCoordsArr[i] instanceof Array) === false) {
			return;
		}
	}

	this.loadingComplete = true;

	this._sendCustomEvent(document, 'svgLoaderLoadingComplete', {bubbles: true});
};

SvgLoader.prototype.getResultCoords = function() {
	return this._resultCoordsArr;
};

SvgLoader.prototype.getResultSizes = function() {
	return this._resultSizesArr;
};

try {
	module.exports = SvgLoader;
} catch (err) {
	console.warn(err);
}
