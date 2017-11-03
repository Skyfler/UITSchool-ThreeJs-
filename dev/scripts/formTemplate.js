"use strict";

/**
 * Class FormTemplate
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	customSelect.js
 * 	customInputRange.js
 * 	customUploadButton.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html form or element that imitates it
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
	var CustomSelect = require('./customSelect');
	var CustomInputRange = require('./customInputRange');
	var CustomUploadButton = require('./customUploadButton');
} catch (err) {
	console.warn(err);
}

function FormTemplate(options) {
	options.name = options.name || 'FormTemplate';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;

	// bind class instance as "this" for event listener functions
	this._onFocus = this._onFocus.bind(this);

	// initialise custom elements
	this._initCustomElements();
}

// Inherit prototype methods from Helper
FormTemplate.prototype = Object.create(Helper.prototype);
FormTemplate.prototype.constructor = FormTemplate;

// Reassigned remove function from Helper
FormTemplate.prototype.remove = function() {
	var i;

	// call remove function for each CustomSelect instance
	if (this._customSelectArr && this._customSelectArr.length > 0) {
		for (i = 0; i < this._customSelectArr.length; i++) {
			this._customSelectArr[i].remove();
		}
	}

	// call remove function for each CustomInputRange instance
	if (this._customInputRangeArr && this._customInputRangeArr.length > 0) {
		for (i = 0; i < this._customInputRangeArr.length; i++) {
			this._customInputRangeArr[i].remove();
		}
	}

	// call remove function for each CustomUploadButton instance
	if (this._customUploadButtonArr && this._customUploadButtonArr.length > 0) {
		for (i = 0; i < this._customUploadButtonArr.length; i++) {
			this._customUploadButtonArr[i].remove();
		}
	}

	// call remove function from Helper
	Helper.prototype.remove.apply(this, arguments);
};

// Initialises all custom elements (CustomSelect, CustomInputRange, CustomUploadButton) if any are found
FormTemplate.prototype._initCustomElements = function() {
	var i;

	// search for custom select elements (.customselect) and initialise them
	var customSelectElemArr = this._elem.querySelectorAll('.customselect');

	if (customSelectElemArr.length > 0) {
		this._customSelectArr = [];

		for (i = 0; i < customSelectElemArr.length; i++) {
			this._customSelectArr[i] = new CustomSelect({
				elem: customSelectElemArr[i]
			});
		}
	}

	// search for custom input range elements (.custom_input_range) and initialise them
	var customInputRangeElemArr = this._elem.querySelectorAll('.custom_input_range');

	if (customInputRangeElemArr.length > 0) {
		this._customInputRangeArr = [];

		for (i = 0; i < customInputRangeElemArr.length; i++) {
			this._customInputRangeArr[i] = new CustomInputRange({
				elem: customInputRangeElemArr[i],
				max: customInputRangeElemArr[i].getAttribute('data-max-value'),
				min: customInputRangeElemArr[i].getAttribute('data-min-value'),
				initialValue: customInputRangeElemArr[i].getAttribute('data-default-value')
			});
		}
	}

	// search for custom input file elements (.uploadbutton) and initialise them
	var customUploadButtonElemArr = this._elem.querySelectorAll('.uploadbutton');

	if (customUploadButtonElemArr.length > 0) {
		this._customUploadButtonArr = [];

		for (i = 0; i < customUploadButtonElemArr.length; i++) {
			this._customUploadButtonArr[i] = new CustomUploadButton({
				elem: customUploadButtonElemArr[i]
			});
		}
	}
};

// Collects all data from input elements ([data-component="form-input"])
FormTemplate.prototype._getUserInputValues = function() {
	// find all inputs to grab values from
	var inputsArr = this._elem.querySelectorAll('[data-component="form-input"]');
	if (inputsArr.length === 0) return false;

	var res = {},
		escape = document.createElement('textarea'),
		input,
		name,
		value,
		j;

	// Function to transfrom html entities into text
	// Arguments:
	// 	1. html (required) - html string to escape
	function escapeHTML(html) {
		escape.textContent = html;
		return escape.innerHTML;
	}

	// collect data from found inputs into res object
	for (var i = 0; i < inputsArr.length; i++) {
		input = inputsArr[i];

		if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
			name = input.name;
			value = escapeHTML(input.value);

		} else if (input.classList.contains('customselect')) {
			name =  input.getAttribute('name');
			// custom select holds it's value in [data-value] attribute
			value = escapeHTML(input.dataset.value);

		} else if (input.classList.contains('custom_input_range')) {
			name =  input.getAttribute('name');
			// custom input range holds it's value in [data-value] attribute
			value = escapeHTML(input.dataset.value);

		} else if (input.classList.contains('uploadbutton')) {
			name = input.getAttribute('name');
			value = '';

			var inputFile = input.querySelector('input[type="file"]');
			// input type file can contain multiple files
			if (inputFile.files.length > 0) {
				value = [];
				for (j = 0; j < inputFile.files.length; j++) {
					value.push(inputFile.files[j]);
				}
			}
		}

		// validate input data
		if (!this._validateField(input, value)) {
			res.__validationFailed = true;
		}

		// if res already has property with this name then add index j to it to not rewrite it
		j = 1;
		while (res.hasOwnProperty(name)) {
			name += '' + j;
			j++;
		}

		// add name-value pair to res object
		res[name] = value;
	}

	return res;
};

// Validates input value
// Arguments:
// 	1. input (required) - input element
// 	2. value (required) - input value
FormTemplate.prototype._validateField = function(input, value) {
	if (
		input.classList.contains('required') &&
		(value === '' ||
			(input.matches('input[type="email"]') && !this._isValidEmailAddress(value))
		)
	) {
		// if input is required (.required) and is empty, or if input is type email and value is not a invalid email address
		input.classList.add('error');

		// listen to focus event on input to remove .error
		// phase (4 arg) is set to true because focus and blur events can't be captured via bubbling in another case
		this._addListener(input, 'focus', this._onFocus, true);
		return false;
	}

	return true;
};

// Invoked by focus event on input element
// Arguments:
// 	1. e (required) - event object
FormTemplate.prototype._onFocus = function(e) {
	// remove .error from input and stop listen to focus event
	var currentTarget = e.currentTarget;
	this._removeListener(currentTarget, 'focus', this._onFocus, true);
	currentTarget.classList.remove('error');
};

// Validates email address with regular expression
// Arguments:
// 	1. emailAddress (required) - email address string
FormTemplate.prototype._isValidEmailAddress = function(emailAddress) {
	var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
	return pattern.test(emailAddress);
};

// Creates FormData instance from passed object with input values
// Arguments:
// 	1. valuesObj (required) - object with input values
FormTemplate.prototype._createFormData = function(valuesObj) {
	// transform object into array
	var dataObjArr = this._getDataObjArr(valuesObj);
	if (!dataObjArr) return;

	var formData = new FormData();

	// add each name-value pair from array to FormData instance
	for (var i = 0; i < dataObjArr.length; i++) {
		formData.append(dataObjArr[i].name, dataObjArr[i].value);
	}

	return formData;
};

// Transform passed object with input values into array
// Arguments:
// 	1. valuesObj (required) - object with input values
FormTemplate.prototype._getDataObjArr = function(valuesObj) {
	var dataObjArr = [];

	// loop through all object values and push them into dataObjArr array
	for (var key in valuesObj) {
		if (Array.isArray(valuesObj[key])) {
			// if value of valuesObj[key] is array then add each array element separately
			for (var i = 0; i < valuesObj[key].length; i++) {
				dataObjArr.push({
					name: key,
					value: valuesObj[key][i]
				});
			}

		} else {
			dataObjArr.push({
				name: key,
				value: valuesObj[key]
			});

		}
	}

	return dataObjArr;
};

// Try exporting class via webpack
try {
	module.exports = FormTemplate;
} catch (err) {
	console.warn(err);
}
