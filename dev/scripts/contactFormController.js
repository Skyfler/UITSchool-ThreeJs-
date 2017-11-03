"use strict";

/**
 * Class ContactFormController
 *
 * Inherits methods from FormTemplate class (formTemplate.js)
 *
 * Required files:
 * 	formTemplate.js
 * 	modalWindow.js
 * 	ajax.js
 * 	img/spinner.gif
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 *		1.1. name (optional) - name for class instance to show in console
 * 		1.2. actionUrl (optional) - url to send form data
 * 		1.3. succsessNotificationHTML (optional) - html that will replace form after successfull ajax request
 *		1.4... options from FormTemplate class (formTemplate.js)
 */

// Try requiring files via webpack
try {
	var FormTemplate = require('./formTemplate');
	var ModalWindow = require('./modalWindow');
	var _ajax = require('./ajax');
} catch (err) {
	console.warn(err);
}

function ContactFormController(options) {
	options.name = options.name || 'ContactFormController';
	// run FormTemplate constructor
	FormTemplate.call(this, options);

	this._actionUrl = options.actionUrl || "";
	this._succsessNotificationHTML = options.succsessNotificationHTML || '<div class="success_notification">' +
		'<p>Thank you for fiiling up the form</p>' +
		'<p>We will contact You ASAP!</p>' +
		'</div>';

	// preload image
	this._loadImages('img/spinner.gif');

	// bind class instance as "this" for event listener functions
	this._onSubmit = this._onSubmit.bind(this);

	// start listening for bubbling submit event
	this._addListener(this._elem, 'submit', this._onSubmit);
}

// Inherit prototype methods from FormTemplate
ContactFormController.prototype = Object.create(FormTemplate.prototype);
ContactFormController.prototype.constructor = FormTemplate;

// Invoked by submit event
// Arguments:
// 	1. e (required) - event object
ContactFormController.prototype._onSubmit = function(e) {
	e.preventDefault();

	if (this._waitingForResponse) {
		return;
	}

	this._postForm();
};


// Sends form data via POST ajax request
ContactFormController.prototype._postForm = function() {
	// collect and verify form inputs' values
	var valuesObj = this._getUserInputValues();
	if (!valuesObj || valuesObj.__validationFailed) return;

	// create form data
	var formData = this._createFormData(
		this._createPostDataObj(valuesObj)
	);

	// set true to prevent additional requests until current is over
	this._waitingForResponse = true;
	this._elem.classList.add('waiting_for_response');

	_ajax.ajax("POST", this._actionUrl, this._onReqEnd.bind(this), formData);
};

// Creates object that will be converted ro form data from object containing inputs' values
ContactFormController.prototype._createPostDataObj = function(valuesObj) {
	var res = {
		dataString: ''
	};

	for (var key in valuesObj) {
		if (key === 'admin-email' || key === 'admin-name' || key === 'subject') {
			res[key] = valuesObj[key];

		} else if (key === 'Email' || key === 'Name') {
			res[key.toLowerCase()] = valuesObj[key];
			res.dataString += '<p><strong>' + key +': </strong> '+ valuesObj[key] + '</p>';

		} else {
			res.dataString += '<p><strong>' + key +': </strong> '+ valuesObj[key] + '</p>';

		}
	}

	return res;
};

// Invoked when ajax request is over
// Arguments:
// 	1. xhr (required) - XMLHttpRequest object
ContactFormController.prototype._onReqEnd = function(xhr) {
	if (!this._elem) return;

	// set false to allow to submit form again
	this._waitingForResponse = false;
	this._elem.classList.remove('waiting_for_response');

	var res;

	try {
		res = JSON.parse(xhr.responseText);
	} catch(e) {
		res = false;
	}

	if (xhr.status === 200 && res.success) {
		// replace form with _succsessNotificationHTML if request returned success
		this._elem.innerHTML = this._succsessNotificationHTML;
	} else {
		// show error modal if request returned fail
		new ModalWindow({
			modalClass: 'error_notification',
			modalInnerHTML: '<p>Произошла непредвиденная ошибка!</p>' +
			'<p>Пожалуйста, повторите попытку позже.</p>'
		});
	}
};

// Try exporting class via webpack
try {
	module.exports = ContactFormController;
} catch (err) {
	console.warn(err);
}
