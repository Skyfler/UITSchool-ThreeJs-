"use strict";

var Helper = require('./helper');
var Dropdown = require('./dropdown.js');

function DropdownGroup(options) {
	options.name = options.name || 'Dropdown-DropdownGroup';
	Helper.call(this, options);

	this._elem = options.elem;
	this._dropdownSelector = options.dropdownSelector;
	this._dropdownOptions = options.dropdownOptions;

	this._onDropdownToggle = this._onDropdownToggle.bind(this);

	this._createDropdowns();

	this._addListener(this._elem, 'dropdowntoggle', this._onDropdownToggle);
}

DropdownGroup.prototype = Object.create(Helper.prototype);
DropdownGroup.prototype.constructor = DropdownGroup;

DropdownGroup.prototype.remove = function() {
	if (this._dropdownArr && this._dropdownArr.length > 0) {
		for (var i = 0; i < this._dropdownArr.length; i++) {
			this._dropdownArr[i].remove();
		}
	}

	Helper.prototype.remove.apply(this, arguments);
};

DropdownGroup.prototype._createDropdowns = function() {
	var dropdownElemArr = this._elem.querySelectorAll(this._dropdownSelector);

	var dropdownOptions = JSON.parse(JSON.stringify(this._dropdownOptions));

	dropdownOptions.sendEventsOnToggle = true;
	dropdownOptions.listenToCloseSignal = true;

	this._dropdownArr = [];
	for (var i = 0; i < dropdownElemArr.length; i++) {
		dropdownOptions.elem = dropdownElemArr[i];
		this._dropdownArr[i] = new Dropdown(dropdownOptions);
	}
};

DropdownGroup.prototype._onDropdownToggle = function(e) {
	var target = e.target;

	if (target === this._opnedDropdownElem && e.detail.state === 'closed') {
		delete this._opnedDropdownElem;

	} else if (e.detail.state === 'open') {
		if (this._opnedDropdownElem) {
			this._closeCurrentDropdown();
		}

		this._opnedDropdownElem = target;
	}
};

DropdownGroup.prototype._closeCurrentDropdown = function() {
	this._sendCustomEvent(this._elem, 'signaltoclosedropdown', {
		bubbles: true,
		detail: {
			targetDropdownElem: this._opnedDropdownElem
		}
	});
};

module.exports = DropdownGroup;
