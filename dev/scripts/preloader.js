"use strict";

try {
	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function Preloader(options) {
	options.name = options.name || 'Preloader';
	Helper.call(this, options);

	this._elem = options.elem;
	this._animationDuration = options.animationDuration || 2000;

	this._checkDocReady = this._checkDocReady.bind(this);
	this._onDocumentReady = this._onDocumentReady.bind(this);
	this._revealOpacity = this._revealOpacity.bind(this);
	this._revealMenu = this._revealMenu.bind(this);

	this._init();
}

Preloader.prototype = Object.create(Helper.prototype);
Preloader.prototype.constructor = Preloader;

Preloader.prototype._init = function() {
	if (document.documentElement.classList.contains('page-index')) {
		this._pageIndex = true;
		this._prepareIndexPage();
	}

	this._checkDocReady(this._onDocumentReady);
};

Preloader.prototype._checkDocReady = function(callback) {
	/in/.test(document.readyState) ? setTimeout(function() {this._checkDocReady(callback)}.bind(this), 9) : callback();
};

Preloader.prototype._onDocumentReady = function() {
	document.querySelector('.preloader').classList.add('hidden');

	if (this._pageIndex) {
		this._onDocumentReadyIndexPage();
	}
};

Preloader.prototype._prepareIndexPage = function() {
	this._preloadElems = {
		logo: document.querySelector('#main_menu .navbar_brand'),
		menuBtm: document.querySelector('#main_menu .dropdown_toggle'),
		leftMenu: document.querySelector('#index_menu .left_col'),
		rightMenu: document.querySelector('#index_menu .right_col'),
		bgCanvas: document.querySelector('.bg_canvas'),
		footerLeftPanel: document.querySelector('footer .left_panel'),
		footerRightPanel: document.querySelector('footer .right_panel')
	};

	for (var key in this._preloadElems) {
		this._preloadElems[key].style.opacity = 0;
	}

	this._preloadElems.leftMenu.style.transform = 'translateX(' + (-100) +'%)';
	this._preloadElems.rightMenu.style.transform = 'translateX(' + 100 +'%)';
};

Preloader.prototype._onDocumentReadyIndexPage = function() {
	this._revealOpacity(
		this._preloadElems.logo,
		function() {
			this._revealOpacity(
				this._preloadElems.menuBtm,
				function() {
					this._revealMenu(
						function() {
							this._revealOpacity(
								this._preloadElems.bgCanvas,
								function() {
									this._revealOpacity(
										this._preloadElems.footerLeftPanel,
										function() {
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

Preloader.prototype._revealOpacity = function(animateItem, callback) {
	this._animation = new Animation(
		function(timePassed) {
			var timeMultiplier = Animation.linear(this._animationDuration, timePassed);

			animateItem.style.opacity = timeMultiplier;
		}.bind(this),
		this._animationDuration,
		function() {
			animateItem.style.opacity = '';

			if (callback) {
				callback();
			}
		}.bind(this)
	);
};

Preloader.prototype._revealMenu = function(callback) {
	this._animation = new Animation(
		function(timePassed) {
			var timeMultiplier = Animation.linear(this._animationDuration, timePassed);

			this._preloadElems.leftMenu.style.opacity = timeMultiplier;
			this._preloadElems.rightMenu.style.opacity = timeMultiplier;

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

try {
	module.exports = Preloader;
} catch (err) {
	console.warn(err);
}
