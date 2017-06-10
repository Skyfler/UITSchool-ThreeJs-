"use strict";

var Helper = require('./helper');

function CustomSelect(options) {
	options.name = options.name || 'CustomSelect';
	Helper.call(this, options);

	this._elem = options.elem;
	this._titleElem = this._elem.querySelector('.title');
	this._listElem = this._elem.querySelector('.option_list');
	this._defaultText = this._titleElem.innerHTML;
	this._required = this._elem.classList.contains('required');
	this._isOpen = false;

	this._elem.dataset.value = '';

	this._onClick = this._onClick.bind(this);
	this._onDocumentClick = this._onDocumentClick.bind(this);
	this._onResize = this._onResize.bind(this);

	this._addListener(this._elem, 'click', this._onClick);
}

CustomSelect.prototype = Object.create(Helper.prototype);
CustomSelect.prototype.constructor = CustomSelect;

CustomSelect.prototype._onResize = function() {
	this._listElem.style.maxHeight = window.innerHeight - this._listElem.getBoundingClientRect().top + 'px';
};

CustomSelect.prototype._onClick = function(event) {
	event.preventDefault();

	if (event.target === this._titleElem) {
		this._toggle();
	} else if (event.target.classList.contains('option')) {
		this._setValue(event.target.textContent, event.target.dataset.value);
		this._elem.classList.add('option_selected');
		this._close();
	}
};

CustomSelect.prototype._onDocumentClick = function(event) {
	if (!this._elem.contains(event.target)) this._close();
};

CustomSelect.prototype._setValue = function(title, value) {
	this._titleElem.innerHTML = title;
	this._elem.dataset.value = title;
	this._value = value;

	this._sendCustomEvent(this._elem, 'customselect', {
		bubbles: true,
		detail: {
			title: title,
			value: value
		}
	});
};

CustomSelect.prototype.getElem = function() {
	return this._elem;
};

CustomSelect.prototype._toggle = function() {
	if (this._isOpen) {
		this._removeListener(window, 'resize', this._onResize);
		this._close();
	} else {
		this._open();
		this._onResize();
		this._addListener(window, 'resize', this._onResize);
	}
};

CustomSelect.prototype._open = function() {
	this._elem.classList.add('open');
	this._addListener(document, 'click', this._onDocumentClick);
	this._isOpen = true;
	this._sendCustomEvent(this._elem, 'customselectopenclose', {
		bubbles: true,
		detail: {
			open: true
		}
	});
};

CustomSelect.prototype._close = function() {
	this._elem.classList.remove('open');
	this._removeListener(document, 'click', this._onDocumentClick);
	this._isOpen = false;
	this._sendCustomEvent(this._elem, 'customselectopenclose', {
		bubbles: true,
		detail: {
			open: false
		}
	});
};

CustomSelect.prototype._getOptionElems = function() {
	return this._elem.querySelectorAll('.option');
};

CustomSelect.prototype.setOption = function(option) {
	if (!option) return;

	if (option.index && typeof option.index === 'number') {
		this._setOptionByIndex(option.index);

	} else if (option.value) {
		this._setOptionByValue(option.value);
	}
};

CustomSelect.prototype._setOptionByIndex = function(optionIndex) {
	var optionElemArr = this._getOptionElems();

	optionIndex = parseInt(optionIndex) + 1;

	if (optionElemArr[optionIndex]) {
		var option = optionElemArr[optionIndex];

		this._setValue(option.textContent, option.dataset.value);
		this._elem.classList.add('option_selected');
	} else {
		// this.resetToDefault();
	}
};

CustomSelect.prototype._setOptionByValue = function(optionValue) {
	var optionElemArr = this._getOptionElems();

	for (var i = 0; i < optionElemArr.length; i++) {
		if (optionElemArr[i].dataset.value === optionValue) {
			var option = optionElemArr[i];

			this._setValue(option.textContent, option.dataset.value);
			this._elem.classList.add('option_selected');

			return;
		}
	}

	// this.resetToDefault();
};

CustomSelect.prototype.resetToDefault = function() {
	this._elem.classList.remove('option_selected');
	this._titleElem.innerHTML = this._defaultText;
	this._elem.dataset.value = '';
};

CustomSelect.prototype.hideByDependency = function() {
	// this._elem.style.display = 'none';
	this._elem.classList.remove('required');
	this._elem.classList.remove('error');
	this._elem.classList.remove('reveal_by_dependency');
	this._elem.classList.add('hide_by_dependency');
	this.resetToDefault();
};

CustomSelect.prototype.revealByDependency = function() {
	// this._elem.style.display = '';
	this._elem.classList.remove('hide_by_dependency');
	this._elem.classList.add('reveal_by_dependency');
	if (this._required) {
		this._elem.classList.add('required');
	}
};

module.exports = CustomSelect;
