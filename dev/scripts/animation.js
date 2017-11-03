"use strict";

/**
 * Class Animation
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. draw (required) - function to invoke on each requested animation frame that suposted to animate something
 * 	2. duration (required) - duration of animation (in miliseconds)
 * 	3. callback (optional) - function to invoke after animation is finished
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function Animation(draw, duration, callback) {
	// run Helper constructor
	// set noId to true to not run out of id's as animations may be created quite frequentely
	Helper.call(this, { name: 'Animation', noId: true });

	// remember animation starting time
	var start = performance.now();
	var self = this;
	var timeSincePaused = 0;
	var totalPrevPauseDuration = 0;
	var pauseStartedAt;

	this._state = 'playing';
	this._callback = callback;

	// plan function animate for the next frame
	this._requestId = requestAnimationFrame(function animate(time) {
		// delete _requestId for stopping animation correctly from within draw function (if needed)
		delete self._requestId;

		// if pause function was called
		if (self._requestToPause) {
			delete self._requestToPause;

			if (self._state !== 'paused') {
				self._state = 'paused';
				// remember animation pause time
				pauseStartedAt = time;
			}
		}

		// if play function was called
		if (self._requestToPlay) {
			delete self._requestToPlay;

			if (self._state !== 'playing') {
				self._state = 'playing';
				// add last pause duration to total pause duration to correctly resume animation from the moment it was stopped
				totalPrevPauseDuration = timeSincePaused;
			}
		}

		// if animation was paused remember how much time has passed since pause
		if (self._state === 'paused') {
			timeSincePaused = time - pauseStartedAt + totalPrevPauseDuration;
		}

		// caclulate how much time has passed since start of the animation including pause duration
		var timePassed = time - (start + timeSincePaused);

		// time can't be less then 0 or more than duration
		if (timePassed < 0) {
			timePassed = 0;
		} else if (timePassed > duration) {
			timePassed = duration;
		}

		// draw animation
		draw(timePassed);

		if (timePassed < duration && !self._requestToStop) {
			// if animation is not finished and stop function was not called then plan animate function again
			self._requestId = requestAnimationFrame(animate);
		} else {
			self._state = 'ended';
			self._excuteCallback = (self._excuteCallback === undefined ? true : self._excuteCallback);
		}

		// if animation is finished or stopped run callback if needed
		if (self._excuteCallback && self._callback) {
			self._callback();
		}

		// if animation is finished or stopped run Helper remove function
		if (self._state === 'ended') {
			Helper.prototype.remove.apply(self, arguments);
		}
	});
}

// Inherit prototype methods from Helper
Animation.prototype = Object.create(Helper.prototype);
Animation.prototype.constructor = Animation;

// Function to stop animation immidiately from outer code
Animation.prototype._stopBeforeAnimate = function() {
	// cancel next call to animate function
	cancelAnimationFrame(this._requestId);
	this._state = 'ended';

	// run callback if needed
	if (this._excuteCallback && this._callback) {
		this._callback();
	}

	// run Helper remove function
	Helper.prototype.remove.apply(this, arguments);
};

// Function to stop animation from within draw function
Animation.prototype._stopWithinAnimate = function() {
	this._requestToStop = true;
};

// Public method to stop animation from outer code
// Arguments:
// 	1. executeCallback (optional) - if set to false value then callback won't be called after animation stop
Animation.prototype.stop = function(executeCallback) {
	this._excuteCallback = !!executeCallback;

	// if _requestId is not set that means call to stop was from draw function
	if (this._requestId !== undefined) {
		this._stopBeforeAnimate();
	} else {
		this._stopWithinAnimate();
	}
};

// Public method to pause animation from outer code
Animation.prototype.pause = function() {
	this._requestToPause = true;
};

// Public method to resume animation from outer code
Animation.prototype.play = function() {
	this._requestToPlay = true;
};

// Returns progress of animation as float value from 0 (just started) to 1 (finished)
// Arguments:
// 	1. fullDuration (required) - full duration of animation
// 	2. timePassed (required) - how much time has passed since start
Animation._progress = function(fullDuration, timePassed) {
	var progress;

	if (fullDuration === 0) {
		progress = 1;
	} else {
		progress = timePassed / fullDuration;
	}

	return progress;
};

// Static class method - linear timig function
// Arguments:
// 	1. fullDuration (required) - full duration of animation
// 	2. timePassed (required) - how much time has passed since start
Animation.linear = function(fullDuration, timePassed) {
	return this._progress(fullDuration, timePassed);
};

// Static class method - quad-ease-in timig function
// Arguments:
// 	1. fullDuration (required) - full duration of animation
// 	2. timePassed (required) - how much time has passed since start
Animation.quadEaseIn = function(fullDuration, timePassed) {
	var progress = this._progress(fullDuration, timePassed);
	return Math.pow(progress, 2);
};

// Static class method - circ-ease-in timig function
// Arguments:
// 	1. fullDuration (required) - full duration of animation
// 	2. timePassed (required) - how much time has passed since start
Animation.circEaseIn = function(fullDuration, timePassed) {
	var progress = this._progress(fullDuration, timePassed);
	return 1 - Math.sin(Math.acos(progress));
};

// Static class method - quad-ease-out timig function
// Arguments:
// 	1. fullDuration (required) - full duration of animation
// 	2. timePassed (required) - how much time has passed since start
Animation.quadEaseOut = function(fullDuration, timePassed) {
	var progress = 1 - this._progress(fullDuration, timePassed);
	return 1 - Math.pow(progress, 2);
};

// Static class method - circ-ease-out timig function
// Arguments:
// 	1. fullDuration (required) - full duration of animation
// 	2. timePassed (required) - how much time has passed since start
Animation.circEaseOut = function(fullDuration, timePassed) {
	var progress = 1 - this._progress(fullDuration, timePassed);
	return Math.sin(Math.acos(progress));
};

// Static class method - quad-ease-in-out timig function
// Arguments:
// 	1. fullDuration (required) - full duration of animation
// 	2. timePassed (required) - how much time has passed since start
Animation.quadEaseInOut = function(fullDuration, timePassed) {
	var halfDuration = fullDuration / 2,
		timeFraction;

	if (halfDuration > timePassed) {
		timeFraction = this.quadEaseIn(halfDuration, timePassed) / 2;

	} else {
		var secondHalfTimePassed = timePassed - halfDuration;
		timeFraction = 0.5 + (this.quadEaseOut(halfDuration, secondHalfTimePassed) / 2);

	}

	return timeFraction;
};

// Static class method - circ-ease-in-out timig function
// Arguments:
// 	1. fullDuration (required) - full duration of animation
// 	2. timePassed (required) - how much time has passed since start
Animation.circEaseInOut = function(fullDuration, timePassed) {
	var halfDuration = fullDuration / 2,
		timeFraction;

	if (halfDuration > timePassed) {
		timeFraction = this.circEaseIn(halfDuration, timePassed) / 2;

	} else {
		var secondHalfTimePassed = timePassed - halfDuration;
		timeFraction = 0.5 + (this.circEaseOut(halfDuration, secondHalfTimePassed) / 2);

	}

	return timeFraction;
};

// Try exporting class via webpack
try {
	module.exports = Animation;
} catch (err) {
	console.warn(err);
}
