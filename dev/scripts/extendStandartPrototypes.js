"use strict";

var _extendStandartPrototypes = {
	init: function() {
		// console.log('running runAll');
		for (var key in this) {
			// console.log(key);
			if (/\bexpandFor/.test(key)) {
				this[key]();
			}
		}
	},

	expandForStringCapitalize: function() {
		// console.log('running polyfillForMatches');
		String.prototype.capitalize = function(lower) {
			return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
		};
	},
};

try {
	module.exports = _extendStandartPrototypes;
} catch (err) {
	console.warn(err);
}
