"use strict";

/**
 * _extendStandartPrototypes helper
 */

var _extendStandartPrototypes = {
	// Runs all prototype extension functions
	init: function() {
		for (var key in this) {
			// if function name starts with 'expandFor' then run it
			if (/\bexpandFor/.test(key)) {
				this[key]();
			}
		}
	},

	// String prototype extension
	// Function capitalize: makes all words lowercased with first letter uppercased
	expandForStringCapitalize: function() {
		String.prototype.capitalize = function(lower) {
			return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
		};
	},
};

// Try exporting via webpack
try {
	module.exports = _extendStandartPrototypes;
} catch (err) {
	console.warn(err);
}
