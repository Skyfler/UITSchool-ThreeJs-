"use strict";

var Helper = require('./helper');
var CustomSelect = require('./customSelect');
var CustomInputRange = require('./customInputRange');
var CustomUploadButton = require('./customUploadButton');

function FormTemplate(options) {
	options.name = options.name || 'FormTemplate';
	Helper.call(this, options);

	this._elem = options.elem;

	this._onFocus = this._onFocus.bind(this);

	this._initCustomElements();
}

FormTemplate.prototype = Object.create(Helper.prototype);
FormTemplate.prototype.constructor = FormTemplate;

FormTemplate.prototype.remove = function() {
	var i;

	if (this._customSelectArr && this._customSelectArr.length > 0) {
		for (i = 0; i < this._customSelectArr.length; i++) {
			this._customSelectArr[i].remove();
		}
	}

	if (this._customInputRangeArr && this._customInputRangeArr.length > 0) {
		for (i = 0; i < this._customInputRangeArr.length; i++) {
			this._customInputRangeArr[i].remove();
		}
	}

	if (this._customUploadButtonArr && this._customUploadButtonArr.length > 0) {
		for (i = 0; i < this._customUploadButtonArr.length; i++) {
			this._customUploadButtonArr[i].remove();
		}
	}

	Helper.prototype.remove.apply(this, arguments);
};

FormTemplate.prototype._initCustomElements = function() {
	var i;

	var customSelectElemArr = this._elem.querySelectorAll('.customselect');

	if (customSelectElemArr.length > 0) {
		this._customSelectArr = [];

		for (i = 0; i < customSelectElemArr.length; i++) {
			this._customSelectArr[i] = new CustomSelect({
				elem: customSelectElemArr[i]
			});
		}
	}

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

FormTemplate.prototype._getUserInputValues = function() {
	var inputsArr = this._elem.querySelectorAll('[data-component="form-input"]');
	if (inputsArr.length === 0) return false;

	var res = {},
		escape = document.createElement('textarea'),
		input,
		name,
		value,
		j;

	function escapeHTML(html) {
		escape.textContent = html;
		return escape.innerHTML;
	}

	for (var i = 0; i < inputsArr.length; i++) {
		input = inputsArr[i];

		if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
			name = input.name;
			value = escapeHTML(input.value);

		} else if (input.classList.contains('customselect')) {
			name =  input.getAttribute('name');
			value = escapeHTML(input.dataset.value);

		} else if (input.classList.contains('custom_input_range')) {
			name =  input.getAttribute('name');
			value = escapeHTML(input.dataset.value);

		} else if (input.classList.contains('uploadbutton')) {
			name = input.getAttribute('name');
			value = '';

			var inputFile = input.querySelector('input[type="file"]');

			if (inputFile.files.length > 0) {
				value = [];
				for (j = 0; j < inputFile.files.length; j++) {
					value.push(inputFile.files[j]);
				}
			}
		}

		if (!this._validateField(input, value)) {
			res.__validationFailed = true;
		}

		j = 1;
		while (res.hasOwnProperty(name)) {
			name += '' + j;
			j++;
		}

		res[name] = value;
	}

	return res;
};

FormTemplate.prototype._validateField = function(input, value) {
	if (
		input.classList.contains('required') &&
		(value === '' ||
			(input.matches('input[type="email"]') && !this._isValidEmailAddress(value))
		)
	) {
		input.classList.add('error');

		this._addListener(input, 'focus', this._onFocus, true);
		return false;
	}

	return true;
};

FormTemplate.prototype._onFocus = function(e) {
	var currentTarget = e.currentTarget;
	this._removeListener(currentTarget, 'focus', this._onFocus, true);
	currentTarget.classList.remove('error');
};

FormTemplate.prototype._isValidEmailAddress = function(emailAddress) {
	var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
	return pattern.test(emailAddress);
};

FormTemplate.prototype._createFormData = function(valuesObj) {
	var dataObjArr = this._getDataObjArr(valuesObj);
	if (!dataObjArr) return;

	var formData = new FormData();

	for (var i = 0; i < dataObjArr.length; i++) {
		formData.append(dataObjArr[i].name, dataObjArr[i].value);
	}

	return formData;
};

FormTemplate.prototype._getDataObjArr = function(valuesObj) {
	var dataObjArr = [];

	for (var key in valuesObj) {

		if (Array.isArray(valuesObj[key])) {
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

module.exports = FormTemplate;
