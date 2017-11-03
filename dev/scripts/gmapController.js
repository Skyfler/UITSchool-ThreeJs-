"use strict";

/**
 * Class GMapController
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that will contain google map
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. gMapOptions (required) - object that contains google map options (see google map documentation)
 *		1.4. markers (optional) - array that contains object with google map markers options (see google map documentation)
 *		1.5. gMapLoaded (required) - value (boolean) that shows if google maps api is already loaded or not
 *		1.6... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function GMapController(options) {
	options.name = options.name || 'GMapController';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;
	this._initialMapOptions = options.gMapOptions;
	this._markersToSet = options.markers;
	this._gMapLoaded = options.gMapLoaded;

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
GMapController.prototype = Object.create(Helper.prototype);
GMapController.prototype.constructor = GMapController;

// Main initialisation function
GMapController.prototype._init = function() {
	if (!this._gMapLoaded) {
		var self = this;
		// if google maps api is not loaded yet then wait till it loads then initialise map
		this._addListener(document, 'gmaploaded', function onGMapLoaded(){
			self._gMapLoaded = true;
			self._removeListener(document, 'gmaploaded', onGMapLoaded);
			self._initMap();
		});
	} else {
		// else initilase map immediately
		this._initMap();
	}
};

// Initialises google map
GMapController.prototype._initMap = function() {
	if (!this._elem) return;

	this._map = new google.maps.Map(this._elem, this._initialMapOptions);
	// set markers
	this._setMarkers(this._markersToSet);
};

// Sets markers on google map
// Arguments:
// 	1. markersToSet (optional) - array of marker options
GMapController.prototype._setMarkers = function(markersToSet) {
	if (markersToSet && markersToSet.length > 0) {
		this._markerArr = [];
		var marker;

		// loop through array of marker options and add each marker to google map
		for (var i = 0; i < markersToSet.length; i++) {
			markersToSet[i].map = this._map;
			marker = new google.maps.Marker(markersToSet[i]);

			this._markerArr.push(marker);
		}
	}
};

// Reassigned remove function from Helper
// Arguments:
// 	1. containerElem (required) - html element that contains google map container (this._elem)
GMapController.prototype.remove = function(containerElem) {
	if (!this._map || !containerElem.contains(this._elem)) return;
	// remove this._elem from document to be able to add it later
	// since google.maps.Map instance can't be properly destroyed without unloading the page, it's better to remove current map from the page and add it later if needed instead of creating a new map each time, because that will lead to memory leak
	this._elem.parentNode.removeChild(this._elem);
};

// Inserts initialised map into document
// Arguments:
// 	1. element (require) - html element thet will be replaced with this._elem
GMapController.prototype.insertMap = function(element) {
	if (this._map) {
		// if map is already initialised then replace element with this._elem
		this._map.setCenter(this._initialMapOptions.center);
		this._map.setZoom(this._initialMapOptions.zoom);
		element.parentNode.replaceChild(this._elem, element);
	} else {
		// else initialise new map
		this._elem = element;
		this._initMap();
	}
};

// Try exporting class via webpack
try {
	module.exports = GMapController;
} catch (err) {
	console.warn(err);
}
