"use strict";

try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function ModalWindow(options) {
	options.name = options.name || 'ModalWindow';
	Helper.call(this, options);

	this._windowOuterHTML = this._createModalHTML(options.modalClass, options.modalInnerHTML, options.buttons);
	this._callback = options.callback;

	this._closeModalWindow = this._closeModalWindow.bind(this);
	this._showModalWindow();
}

ModalWindow.prototype = Object.create(Helper.prototype);
ModalWindow.prototype.constructor = ModalWindow;

ModalWindow.prototype._createModalHTML = function(modalClass, modalInnerHTML, buttons) {
	var buttonsHTML = '';

	for (var key in buttons) {
		buttonsHTML += '<button class="btn ' + key + '-btn" data-action="' + key + '">' + buttons[key] + '</button>';
	}

	if (!buttonsHTML) {
		buttonsHTML = '<button class="btn ok-btn" data-action="ok">ОК</button>';
	}

	return '<div class="' + modalClass + '">' +
		modalInnerHTML +
		buttonsHTML +
		'</div>';
};

ModalWindow.prototype._showModalWindow = function() {
	this._cover = document.createElement('div');
	this._cover.style.cssText = 'z-index: 1000; position: fixed; height: 100%; width: 100%; top: 0; left: 0; background: rgba(255, 255, 255, 0.25)';
	this._cover.innerHTML = this._windowOuterHTML;

	document.body.insertAdjacentElement('afterBegin', this._cover);
	document.body.style.overflow = 'hidden';
	this._addListener(this._cover, 'click', this._closeModalWindow);
};

ModalWindow.prototype._closeModalWindow = function(e) {
	var target = e.target;
	var button = target.closest('button');
	if (target.tagName !== 'BUTTON' || !target.dataset.action) return;

	var userAction = target.dataset.action;

	this._sendCustomEvent(document, 'modalAction', {
		bubbles: true,
		detail: {
			action: userAction
		}
	});

	document.body.removeChild(this._cover);
	delete this._cover;
	document.body.style.overflow = '';
	this._removeListener(this._cover, 'click', this._closeModalWindow);

	if (this._callback) {
		this._callback(userAction);
	}

	this.remove();
};

try {
	module.exports = ModalWindow;
} catch (err) {
	console.warn(err);
}
