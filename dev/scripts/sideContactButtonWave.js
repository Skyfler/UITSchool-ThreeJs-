"use strict";

try {
	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function SideContactButtonWave(options) {
	options.name = options.name || 'SideContactButtonWave';
	Helper.call(this, options);

	this._elemsArr = options.elemsArr;
	this._containerElem = options.containerElem;
	this._delay = options.delay || 2000;
	this._activeDuration = options.activeDuration || 500;
	this._maxOffset = options.maxOffset || 50;
	this._offsetAnimationDuration = options.offsetAnimationDuration || 400;

	this._onMouseOver = this._onMouseOver.bind(this);
	this._onMouseOut = this._onMouseOut.bind(this);
	this._onWindowScroll = this._onWindowScroll.bind(this);
	this._onPageSlideChanged = this._onPageSlideChanged.bind(this);
	this._onPageSlideChangedAnimationEnd = this._onPageSlideChangedAnimationEnd.bind(this);

	this._init();
}

SideContactButtonWave.prototype = Object.create(Helper.prototype);
SideContactButtonWave.prototype.constructor = SideContactButtonWave;

SideContactButtonWave.prototype._init = function() {
	this._startWave();
	this._scrollingDelay();

	for (var i = 0; i < this._elemsArr.length; i++) {
		this._addListener(this._elemsArr[i], 'mouseover', this._onMouseOver);
		this._addListener(this._elemsArr[i], 'mouseout', this._onMouseOut);
	}
};

SideContactButtonWave.prototype._startWave = function() {
	this._setActiveClass(
		this._elemsArr.slice(0),
		function() {
			this._timer = setTimeout(
				function() {
					delete this._timer;

					if (!this._paused) {
						this._startWave();
					}
				}.bind(this),
				this._delay
			)
		}.bind(this)
	);
};

SideContactButtonWave.prototype._setActiveClass = function(elemsArr, callback) {
	if (elemsArr.length === 0) {
//		elemsArr = this._elemsArr.slice(0);
		if (callback) {
			callback();
		}
		return;
	}

	var elem = elemsArr[0];

	elem.classList.add('active');

	this._timer = setTimeout(function() {
		elem.classList.remove('active');
		delete this._timer;

		if (!this._paused) {
			this._setActiveClass(elemsArr.slice(1), callback);
		}
	}.bind(this), this._activeDuration);
};

SideContactButtonWave.prototype._onMouseOver = function() {
	this._paused = true;
};

SideContactButtonWave.prototype._onMouseOut = function() {
	this._paused = false;

	if (!this._timer) {
		this._timer = setTimeout(
			function() {
				delete this._timer;

				if (!this._paused) {
					this._startWave();
				}
			}.bind(this),
			this._delay
		)
	}
};

SideContactButtonWave.prototype._scrollingDelay = function() {
	this._addListener(window, 'scroll', this._onWindowScroll);
	this._addListener(document, 'pageSlideChanged', this._onPageSlideChanged);
	this._addListener(document, 'pageSlideChangedAnimationEnd', this._onPageSlideChangedAnimationEnd);

	this._currentInOffset = 0
	this._currentOutOffset = 0
	this._scrolled = 0;
	this._lastScrollTop = window.pageYOffset !== undefined ? window.pageYOffset : document.documentElement.scrollTop;
};

SideContactButtonWave.prototype._onWindowScroll = function() {
	var currentScrollTop = window.pageYOffset !== undefined ? window.pageYOffset : document.documentElement.scrollTop;
	var scrolled = this._scrolled + (currentScrollTop - this._lastScrollTop) * 0.3;

	console.log({
		_scrolled: this._scrolled,
		scrolled: scrolled,
	});

	if (Math.abs(this._scrolled) > Math.abs(scrolled)) {
		scrolled = scrolled - this._scrolled;
		if (this._animationOutTimer) {
			clearTimeout(this._animationOutTimer);
			delete this._timer;
		}

		if (this._animation) {
			this._animation.stop();
			delete this._animation;
			if (this._animationOut) {
				delete this._animationOut;
			}
		}
	}

	this._scrolled = Math.abs(scrolled) > this._maxOffset ? this._maxOffset * scrolled / Math.abs(scrolled) : scrolled;

	if (this._animationOut && this._animation) {
		this._animation.stop();
		delete this._animationOut;
		delete this._animation;
	}

	if (!this._animation) {
//		this._currentInOffset = this._currentOutOffset;

		console.log(this.NAME + ': new IN animation');
		this._animation = new Animation(
			function(timePassed) {
				var timeMultiplier = Animation.quadEaseOut(this._offsetAnimationDuration, timePassed);

				this._currentInOffset = (-this._scrolled - this._currentOutOffset) * timeMultiplier - this._currentOutOffset;
				this._containerElem.style.transform = 'translateY(' + this._currentInOffset + 'px)';
			}.bind(this),
			this._offsetAnimationDuration,
			function() {
				console.log(this.NAME + ': IN animation callback');
				console.log({
					_currentInOffset: this._currentInOffset
				});

				var scrollStoppedCounter = 0;
				var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
				this._currentOutOffset = this._currentInOffset;

				this._animationOutTimer = setTimeout(
					function onTimeout() {
						delete this._animationOutTimer;
						var currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

						if (scrollStoppedCounter === 10) {
							console.log(this.NAME + ': new OUT animation');

							this._scrolled = 0;
							this._currentOutOffset = this._currentInOffset;
//							var duration = Math.abs(this._offsetAnimationDuration * (this._currentInOffset / this._maxOffset));
							var duration = 400;

							console.log({
								duration: duration,
								_currentInOffset: this._currentInOffset
							});

							this._animationOut = true;

							this._animation = new Animation(
								function(timePassed) {
									var timeMultiplier = Animation.quadEaseOut(duration, timePassed);

									this._currentOutOffset = this._currentInOffset - (this._currentInOffset * timeMultiplier);
									this._containerElem.style.transform = 'translateY(' + this._currentOutOffset + 'px)';
								}.bind(this),
								duration,
								function() {
									console.log(this.NAME + ': OUT animation callback');
									this._containerElem.style.transform = '';
									this._currentInOffset = 0;
									delete this._animation;
									delete this._animationOut;
								}.bind(this)
							);

							return;

						} else if (scrollTop === currentScrollTop) {
							scrollStoppedCounter++;
						} else {
							scrollStoppedCounter = 0;
							scrollTop = currentScrollTop;
						}

						this._animationOutTimer = setTimeout(onTimeout.bind(this), 9);
					}.bind(this),
					9
				);

			}.bind(this)
		)
	}

	this._lastScrollTop = currentScrollTop;
};

SideContactButtonWave.prototype._startScrollDelay = function() {
	var currentScrollTop = window.pageYOffset !== undefined ? window.pageYOffset : document.documentElement.scrollTop;
	var scrolled = this._scrolled + (currentScrollTop - this._lastScrollTop) * 0.3;

	this._scrolled = Math.abs(scrolled) > this._maxOffset ? this._maxOffset * scrolled / Math.abs(scrolled) : scrolled;

	this._scrollDealyInAnimation();
};

SideContactButtonWave.prototype._scrollDealyInAnimation = function() {
	this._animation = new Animation(
		function(timePassed) {
			var timeMultiplier = Animation.quadEaseOut(this._offsetAnimationDuration, timePassed);

			this._currentInOffset = -this._scrolled * timeMultiplier;
			this._containerElem.style.transform = 'translateY(' + this._currentInOffset + 'px)';
		}.bind(this),
		this._offsetAnimationDuration,
		this._delayInAnimationCallabck.bind(this)
	);
};

SideContactButtonWave.prototype._delayInAnimationCallabck = function() {
	var scrollStoppedCounter = 0;
	var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

	this._animationOutTimer = setTimeout(
		function() {

		}.bind(this),
	9
	)
};

SideContactButtonWave.prototype._onPageSlideChanged = function(e) {
	this._animationDirection = (e.detail.activeSlideIndex - e.detail.lastActiveSlideIndex) / Math.abs(e.detail.activeSlideIndex - e.detail.lastActiveSlideIndex);

	if (this._animation) {
		this._animation.stop();
		delete this._animation;
	}

	this._currentInOffset = this._currentOutOffset;

	this._animation = new Animation(
		function(timePassed) {
			var timeMultiplier = Animation.quadEaseOut(this._offsetAnimationDuration, timePassed);

			this._currentInOffset = ((this._maxOffset * -this._animationDirection - this._currentOutOffset) * timeMultiplier) + this._currentOutOffset;
			this._containerElem.style.transform = 'translateY(' + this._currentInOffset + 'px)';
		}.bind(this),
		this._offsetAnimationDuration,
		function() {
			this._currentOutOffset = 0;
			delete this._animation;
		}.bind(this)
	)
};

SideContactButtonWave.prototype._onPageSlideChangedAnimationEnd = function() {
	if (this._animation) {
		this._animation.stop();
		delete this._animation;
	}

	this._currentOutOffset = this._currentInOffset;

	this._animation = new Animation(
		function(timePassed) {
			var timeMultiplier = Animation.quadEaseOut(this._offsetAnimationDuration, timePassed);

			this._currentOutOffset = this._currentInOffset - (this._currentInOffset * timeMultiplier);
			this._containerElem.style.transform = 'translateY(' + this._currentOutOffset + 'px)';
		}.bind(this),
		this._offsetAnimationDuration,
		function() {
			this._containerElem.style.transform = '';
			this._currentInOffset = 0;
			delete this._animation;
		}.bind(this)
	)
};

try {
	module.exports = SideContactButtonWave;
} catch (err) {
	console.warn(err);
}
