"use strict";

var _ajax = {

	ajax: function(method, url, callback, data) {

		var xhr = new XMLHttpRequest();

		xhr.open(method, url, true);
		xhr._url = url;

		xhr.addEventListener('readystatechange', function onReadyStateChange() {
			if (this.readyState != 4) return;

			xhr.removeEventListener('readystatechange', onReadyStateChange);
			callback(this);
		});

		xhr.send(data);
	}

};

try {
	module.exports = _ajax;
} catch (err) {
	console.warn(err);
}
