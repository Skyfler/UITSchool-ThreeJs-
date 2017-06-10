"use strict";

var Helper = require('./helper');
var Animation = require('./animation');

function ContactsModalController(options) {
	options.name = options.name || 'ContactsModalController';
	Helper.call(this, options);

	this._elem = options.elem;
	this._animationDuration = options.animationDuration || 500;

	this._onClick = this._onClick.bind(this);
//	this._onResize = this._onResize.bind(this);

	this._init(options);
}

ContactsModalController.prototype = Object.create(Helper.prototype);
ContactsModalController.prototype.constructor = ContactsModalController;

ContactsModalController.prototype._init = function() {
	if (this._elem.classList.contains('open')) {
		this._state = 'open';
	} else {
		this._state = 'closed';
	}

	this._addListener(document, 'click', this._onClick);
};

ContactsModalController.prototype._toggle = function() {
	if (this._state === 'open') {
		this._state = 'closed';
		this._elem.classList.remove('open');

	} else if (this._state === 'closed') {
		this._state = 'open';
		this._elem.classList.add('open');

	}
};

ContactsModalController.prototype._onClick = function(e) {
	var target = e.target;
	if (!target) return;
	var target = target.closest('[data-action]');
	if (!target) return;

	var action = target.dataset.action;

	if (!action) return;

	if (action === 'close_modal' && this._state === 'open') {
		this._toggle();

	} else if (action === 'open_modal') {
		var actionTargetSelector = target.dataset.tabTarget;
		if (!actionTargetSelector) return;

		var actionTarget = this._elem.querySelector(actionTargetSelector);
		if (!actionTarget) return;

		this._sendCustomEvent(document, 'signalToOpenTab', {
			bubbles: true,
			detail: {
				target: actionTarget,
				selector: actionTargetSelector,
				transition: this._state === 'open'
			}
		});

		if (this._state === 'closed') {
			this._toggle();
		}
	}
};

module.exports = ContactsModalController;
