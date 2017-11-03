"use strict";

/**
 * Class ModalWindow
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that contains left menu column (#carousel_menu_left) and right menu column (#carousel_menu_right)
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. modalClass (required) - class string that will be added to modal element
 *		1.4. modalInnerHTML (required) - html string that will be shown in the modal element
 *		1.5. buttons (optional) - object that contains key-value pairs which represent button action and button text respectively
 *		1.6. callback (optional) - function which will be called after user clicks on one of the buttons in modal
 *		1.7... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function ModalWindow(options) {
	options.name = options.name || 'ModalWindow';
	// run Helper constructor
	Helper.call(this, options);

	// create modal html string
	this._windowOuterHTML = this._createModalHTML(options.modalClass, options.modalInnerHTML, options.buttons);
	this._callback = options.callback;

	// bind class instance as "this" for event listener functions
	this._closeModalWindow = this._closeModalWindow.bind(this);
	// display modal
	this._showModalWindow();
}

// Inherit prototype methods from Helper
ModalWindow.prototype = Object.create(Helper.prototype);
ModalWindow.prototype.constructor = ModalWindow;

// Generates modal window html string
// Arguments:
// 	1. modalClass (required) - class string that will be added to modal element
// 	2. modalInnerHTML (required) - html string that will be shown in the modal element
// 	3. buttons (optional) - object that contains key-value pairs which represent button action and button text respectively
ModalWindow.prototype._createModalHTML = function(modalClass, modalInnerHTML, buttons) {
	var buttonsHTML = '';

	// create buttons html
	for (var key in buttons) {
		buttonsHTML += '<button class="btn ' + key + '-btn" data-action="' + key + '">' + buttons[key] + '</button>';
	}

	// if no buttons were passed then add deafult OK button
	if (!buttonsHTML) {
		buttonsHTML = '<button class="btn ok-btn" data-action="ok">ОК</button>';
	}

	return '<div class="' + modalClass + '">' +
		modalInnerHTML +
		buttonsHTML +
		'</div>';
};

// Displays modal to user
ModalWindow.prototype._showModalWindow = function() {
	// create backgound cover that will prevent user from interacting with page until modal is not closed
	this._cover = document.createElement('div');
	this._cover.style.cssText = 'z-index: 1000; position: fixed; height: 100%; width: 100%; top: 0; left: 0; background: rgba(255, 255, 255, 0.25)';
	// add modal html string into cover element
	this._cover.innerHTML = this._windowOuterHTML;

	// insert resulting element into document
	document.body.insertAdjacentElement('afterBegin', this._cover);
	document.body.style.overflow = 'hidden';
	// start listening for user action
	this._addListener(this._cover, 'click', this._closeModalWindow);
};

// Invoked by click event inside cover element
// Arguments:
// 	1. e (required) - event object
ModalWindow.prototype._closeModalWindow = function(e) {
	var target = e.target;
	var button = target.closest('button');
	if (target.tagName !== 'BUTTON' || !target.dataset.action) return;

	// get action that user have chosen
	var userAction = target.dataset.action;

	// send signal that modal was closed and resulting action
	this._sendCustomEvent(document, 'modalAction', {
		bubbles: true,
		detail: {
			action: userAction
		}
	});

	// remove cover element
	document.body.removeChild(this._cover);
	delete this._cover;
	document.body.style.overflow = '';
	// stop listening for user action
	this._removeListener(this._cover, 'click', this._closeModalWindow);

	if (this._callback) {
		this._callback(userAction);
	}

	// destroy modal instance
	this.remove();
};

// Try exporting class via webpack
try {
	module.exports = ModalWindow;
} catch (err) {
	console.warn(err);
}
