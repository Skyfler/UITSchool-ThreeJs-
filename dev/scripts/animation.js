"use strict";

try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function Animation(draw, duration, callback) {
	Helper.call(this, { name: 'Animation', noId: true });

	var start = performance.now();
	var self = this;
	var timeSincePaused = 0;
	var totalPrevPauseDuration = 0;
	var pauseStartedAt;

	this._state = 'playing';
	this._callback = callback;

	this._requestId = requestAnimationFrame(function animate(time) {
		delete self._requestId;

		if (self._requestToPause) {
			delete self._requestToPause;

			if (self._state !== 'paused') {
				self._state = 'paused';
				pauseStartedAt = time;
			}
		}

		if (self._requestToPlay) {
			delete self._requestToPlay;

			if (self._state !== 'playing') {
				self._state = 'playing';
				totalPrevPauseDuration = timeSincePaused;
			}
		}

		if (self._state === 'paused') {
			timeSincePaused = time - pauseStartedAt + totalPrevPauseDuration;
		}

		// определить, сколько прошло времени с начала анимации
		var timePassed = time - (start + timeSincePaused);

		// возможно небольшое превышение времени, в этом случае зафиксировать конец
		if (timePassed < 0) {
			timePassed = 0;
		} else if (timePassed > duration) {
			timePassed = duration;
		}

		// нарисовать состояние анимации в момент timePassed
		draw(timePassed);

		// если время анимации не закончилось - запланировать ещё кадр
		if (timePassed < duration && !self._requestToStop) {
			self._requestId = requestAnimationFrame(animate);
		} else {
			self._state = 'ended';
			self._excuteCallback = (self._excuteCallback === undefined ? true : self._excuteCallback);
		}

		if (self._excuteCallback && self._callback) {
			self._callback();
		}

		if (self._state === 'ended') {
			Helper.prototype.remove.apply(self, arguments);
		}
	});
}

Animation.prototype = Object.create(Helper.prototype);
Animation.prototype.constructor = Animation;

Animation.prototype._stopBeforeAnimate = function() {
	cancelAnimationFrame(this._requestId);
	this._state = 'ended';

	if (this._excuteCallback && this._callback) {
		this._callback();
	}

	Helper.prototype.remove.apply(this, arguments);
};

Animation.prototype._stopWithinAnimate = function() {
	this._requestToStop = true;
};

Animation.prototype.stop = function(executeCallback) {
	this._excuteCallback = !!executeCallback;

	if (this._requestId !== undefined) {
		this._stopBeforeAnimate();
	} else {
		this._stopWithinAnimate();
	}
};

Animation.prototype.pause = function() {
	this._requestToPause = true;
};

Animation.prototype.play = function() {
	this._requestToPlay = true;
};

Animation._progress = function(fullDuration, timePassed) {
	var progress;

	if (fullDuration === 0) {
		progress = 1;
	} else {
		progress = (timePassed / (fullDuration / 100)) / 100;
	}

	return progress;
};

Animation.linear = function(fullDuration, timePassed) {
	return this._progress(fullDuration, timePassed);
};

Animation.quadEaseIn = function(fullDuration, timePassed) {
	var progress = this._progress(fullDuration, timePassed);
	return Math.pow(progress, 2);
};

Animation.circEaseIn = function(fullDuration, timePassed) {
	var progress = this._progress(fullDuration, timePassed);
	return 1 - Math.sin(Math.acos(progress));
};

Animation.quadEaseOut = function(fullDuration, timePassed) {
	var progress = 1 - this._progress(fullDuration, timePassed);
	return 1 - (Math.pow(progress, 2));
};

Animation.circEaseOut = function(fullDuration, timePassed) {
	var progress = 1 - this._progress(fullDuration, timePassed);
	return 1 - (1 - Math.sin(Math.acos(progress)));
};

Animation.quadEaseInOut = function(fullDuration, timePassed) {
	var halfDuration = fullDuration / 2,
		timeFraction;

	if (halfDuration > timePassed) {
		timeFraction = (this.quadEaseIn(halfDuration, timePassed) / 2);

	} else {
		var secondHalfTimePassed = timePassed - halfDuration;
		timeFraction = 0.5 + (this.quadEaseOut(halfDuration, secondHalfTimePassed) / 2);

	}

	return timeFraction;
};

Animation.circEaseInOut = function(fullDuration, timePassed) {
	var halfDuration = fullDuration / 2,
		timeFraction;

	if (halfDuration > timePassed) {
		timeFraction = (this.circEaseIn(halfDuration, timePassed) / 2);

	} else {
		var secondHalfTimePassed = timePassed - halfDuration;
		timeFraction = 0.5 + (this.circEaseOut(halfDuration, secondHalfTimePassed) / 2);

	}

	return timeFraction;
};

//Animation.customBezier = function(fullDuration, timePassed, C1, C2, C3, C4) {
//	var progress = this._progress(fullDuration, timePassed);
//	return this._bezier(C1, C2, C3, C4, progress);
//};
//
//Animation.ease = function(fullDuration, timePassed) {
//	var progress = this._progress(fullDuration, timePassed);
////	return this._bezier(0.25, 0.1, 0.25, 1, progress);
//	return this._bezier(0, 0.25, 0.25, 1, progress);
//};
//
//Animation.easeIn = function(fullDuration, timePassed) {
//	var progress = this._progress(fullDuration, timePassed);
////	return this._bezier(0.42, 0, 1, 1, progress);
//	return this._bezier(0, 0.42, 1, 1, progress);
//};
//
//Animation.easeOut = function(fullDuration, timePassed) {
//	var progress = this._progress(fullDuration, timePassed);
////	return this._bezier(0, 0, 0.58, 1, progress);
//	return this._bezier(0, 0, 0.58, 1, progress);
//};
//
//Animation.easeInOut = function(fullDuration, timePassed) {
//	var progress = this._progress(fullDuration, timePassed);
////	return this._bezier(0.42, 0, 0.58, 1, progress);
//	return this._bezier(0, 0.42, 0.58, 1, progress);
//};

try {
	module.exports = Animation;
} catch (err) {
	console.warn(err);
}
