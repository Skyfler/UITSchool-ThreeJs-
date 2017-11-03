"use strict";

/**
 * _ajax helper
 */

var _ajax = {
	// Simplified ajax call function
	// Arguments:
	// 	1. method (required) - mathod of ajax request (GET, POST, etc.)
	// 	2. url (required) - url where to send ajax request
	// 	3. callback (required) - function to invoke after ajax request is finished
	// 	4. data (optional) - data to send via ajax request body (POST)
	ajax: function(method, url, callback, data) {

		var xhr = new XMLHttpRequest();

		xhr.open(method, url, true);
		// add url to XMLHttpRequest object
		xhr._url = url;

		xhr.addEventListener('readystatechange', function onReadyStateChange() {
			if (this.readyState != 4) return;

			xhr.removeEventListener('readystatechange', onReadyStateChange);
			// pass XMLHttpRequest object to callback
			callback(this);
		});

		xhr.send(data);
	}
};

// Try exporting via webpack
try {
	module.exports = _ajax;
} catch (err) {
	console.warn(err);
}
