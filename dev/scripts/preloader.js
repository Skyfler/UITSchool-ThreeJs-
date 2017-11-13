"use strict";

/**
 * Class Preloader
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	animation.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 *		1.1. name (optional) - name for class instance to show in console
 *		1.2. animationDuration (required) - duration of apparence of all element on index page
 *		1.3... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function Preloader(options) {
	options.name = options.name || 'Preloader';
	// run Helper constructor
	Helper.call(this, options);

	this._animationDuration = options.animationDuration || 2000;

	// bind class instance as "this" for event listener functions
	this._checkDocReady = this._checkDocReady.bind(this);
	this._onDocumentReady = this._onDocumentReady.bind(this);
	this._revealOpacity = this._revealOpacity.bind(this);
	this._revealMenu = this._revealMenu.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
Preloader.prototype = Object.create(Helper.prototype);
Preloader.prototype.constructor = Preloader;

// Main initialisation function
Preloader.prototype._init = function() {
	if (document.documentElement.classList.contains('page-index')) {
		// if it's index page then prepare animating apparence
		this._pageIndex = true;
		this._prepareIndexPage();
	}

	// wait till document is loaded
	this._checkDocReady(this._onDocumentReady);
};

// Keeps checking if document is loaded, then calls callback function
// Arguments:
// 	1. callback (required) - function to call when document loading complete
Preloader.prototype._checkDocReady = function(callback) {
	/in/.test(document.readyState) ? setTimeout(function() {this._checkDocReady(callback)}.bind(this), 9) : callback();
};

// Invoked when document loading is complete
Preloader.prototype._onDocumentReady = function() {
	// hide preloader
	document.querySelector('.preloader').classList.add('hidden');

	// if it's index page then animate apparence
	if (this._pageIndex) {
		this._onDocumentReadyIndexPage();
	}
};

// Prepares element on index page to be animated when page will be loaded
Preloader.prototype._prepareIndexPage = function() {
	// find all elements to animate
	this._preloadElems = {
		logo: document.querySelector('#main_menu .navbar_brand'),
		menuBtm: document.querySelector('#main_menu .dropdown_toggle'),
		leftMenu: document.querySelector('#index_menu .left_col'),
		rightMenu: document.querySelector('#index_menu .right_col'),
		bgCanvas: document.querySelector('.bg_canvas'),
		onlineCoursesBtn: document.querySelector('.page-index .online_courses_btn'),
		footerLeftPanel: document.querySelector('footer .left_panel'),
		footerRightPanel: document.querySelector('footer .right_panel')
	};

	// hide them with opacity
	for (var key in this._preloadElems) {
		this._preloadElems[key].style.opacity = 0;
	}

	// for menu elements also move thembehind the screen sides
	this._preloadElems.leftMenu.style.transform = 'translateX(' + (-100) +'%)';
	this._preloadElems.rightMenu.style.transform = 'translateX(' + 100 +'%)';
};


// Animates apparence of elements on index page
Preloader.prototype._onDocumentReadyIndexPage = function() {
	// animate opacity of logo
	this._revealOpacity(
		this._preloadElems.logo,
		function() {
			// animate opacity of menu button
			this._revealOpacity(
				this._preloadElems.menuBtm,
				function() {
					// animate opacity and transform of left menu and right menu
					this._revealMenu(
						function() {
							// animate opacity of backoround canvas
							this._revealOpacity(
								[this._preloadElems.bgCanvas, this._preloadElems.onlineCoursesBtn],
								function() {
									// animate opacity of footer left panel
									this._revealOpacity(
										this._preloadElems.footerLeftPanel,
										function() {
											//animate opacity of footer right panel
											this._revealOpacity(
												this._preloadElems.footerRightPanel,
												function() {
													delete this._animation
												}.bind(this)
											)
										}.bind(this)
									)
								}.bind(this)
							)
						}.bind(this)
					)
				}.bind(this)
			)
		}.bind(this)
	);
};

// Animates opacity of passed element
// Arguments:
// 	1. animateItem (required) - element (or array of elements) to animate opacity from 0 to 1
// 	2. callback (optional) - function that wil be called after animation is over
Preloader.prototype._revealOpacity = function(animateItem, callback) {
	// create new animation
	if (!(animateItem instanceof Array)) {
		animateItem = [animateItem];
	}

	this._animation = new Animation(
		function(timePassed) {
			// get value of timing function for current moment of animation
			var timeMultiplier = Animation.linear(this._animationDuration, timePassed);

			// set opacity
			for (var i = 0; i < animateItem.length; i++) {
				if (animateItem[i]) {
					animateItem[i].style.opacity = timeMultiplier;
				}
			}
		}.bind(this),
		this._animationDuration,
		function() {
			for (var i = 0; i < animateItem.length; i++) {
				if (animateItem[i]) {
					animateItem[i].style.opacity = '';
				}
			}

			if (callback) {
				callback();
			}
		}.bind(this)
	);
};

// Animates opacity and transform of menu elements
// Arguments:
// 	1. callback (optional) - function that wil be called after animation is over
Preloader.prototype._revealMenu = function(callback) {
	// create new animation
	this._animation = new Animation(
		function(timePassed) {
			// get value of timing function for current moment of animation
			var timeMultiplier = Animation.linear(this._animationDuration, timePassed);

			// set opacity
			this._preloadElems.leftMenu.style.opacity = timeMultiplier;
			this._preloadElems.rightMenu.style.opacity = timeMultiplier;

			// set transform translate
			this._preloadElems.leftMenu.style.transform = 'translateX(' + ((-1 + timeMultiplier) * 100) +'%)';
			this._preloadElems.rightMenu.style.transform = 'translateX(' + ((1 - timeMultiplier) * 100) +'%)';
		}.bind(this),
		this._animationDuration,
		function() {
			this._preloadElems.leftMenu.style.opacity = '';
			this._preloadElems.rightMenu.style.opacity = '';

			this._preloadElems.leftMenu.style.transform = '';
			this._preloadElems.rightMenu.style.transform = '';

			if (callback) {
				callback();
			}
		}.bind(this)
	);
};

// Try exporting class via webpack
try {
	module.exports = Preloader;
} catch (err) {
	console.warn(err);
}
