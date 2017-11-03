"use strict";

/**
 * Class ContactsModalController
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element modal window
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function ContactsModalController(options) {
	options.name = options.name || 'ContactsModalController';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;

	// bind class instance as "this" for event listener functions
	this._onClick = this._onClick.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
ContactsModalController.prototype = Object.create(Helper.prototype);
ContactsModalController.prototype.constructor = ContactsModalController;

// Main initialisation function
ContactsModalController.prototype._init = function() {
	if (this._elem.classList.contains('open')) {
		this._state = 'open';
	} else {
		this._state = 'closed';
	}

	// start listening for bubbling click event
	this._addListener(document, 'click', this._onClick);
};

// Opens or closes modal window
ContactsModalController.prototype._toggle = function() {
	if (this._state === 'open') {
		this._state = 'closed';
		this._elem.classList.remove('open');

	} else if (this._state === 'closed') {
		this._state = 'open';
		this._elem.classList.add('open');

	}
};

// Invoked by click event
// Arguments:
// 	1. e (required) - event object
ContactsModalController.prototype._onClick = function(e) {
	var target = e.target;
	if (!target) return;
	target = target.closest('[data-action]');
	if (!target) return;

	var action = target.dataset.action;
	if (!action) return;

	if (action === 'close_modal' && this._state === 'open') {
		// if click was on the element that has [data-action="close_modal"] attribute or it's child and modal is open then close modal
		this._toggle();

	} else if (action === 'open_modal') {
		var actionTargetSelector = target.dataset.tabTarget;
		if (!actionTargetSelector) return;

		var actionTarget = this._elem.querySelector(actionTargetSelector);
		if (!actionTarget) return;

		// if click was on the element that has [tabTarget] attribute or it's child than send signal to open target tab
		this._sendCustomEvent(document, 'signalToOpenTab', {
			bubbles: true,
			detail: {
				target: actionTarget,
				selector: actionTargetSelector,
				transition: this._state === 'open'
			}
		});

		// if click was on the element that has [data-action="open_modal"] attribute or it's child and modal is open then close modal
		if (this._state === 'closed') {
			this._toggle();
		}
	}
};

// Try exporting class via webpack
try {
	module.exports = ContactsModalController;
} catch (err) {
	console.warn(err);
}
