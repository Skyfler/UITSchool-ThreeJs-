"use strict";

var Helper = require('./helper');

function SimpleTabs(options) {
	options.name = options.name || 'SimpleTabs';
	Helper.call(this, options);

	this._elem = options.elem;

	this._onClick = this._onClick.bind(this);
	this._init();
}

SimpleTabs.prototype = Object.create(Helper.prototype);
SimpleTabs.prototype.constructor = SimpleTabs;

SimpleTabs.prototype._init = function() {
	this._tabs = this._elem.querySelectorAll('.tab');
	this._tabsBlocks = this._elem.querySelectorAll('.tab_block');

	this._removeSelectedClass();
	this._selectTab(this._tabs[0]);

	this._addListener(this._elem, 'click', this._onClick)
};

SimpleTabs.prototype._onClick = function(e) {
	var target = e.target;

	this._selectTab(target, e);
};

SimpleTabs.prototype._selectTab = function(target, e) {
	var targetTab = target.closest('[data-tab-target]');
	if (!targetTab || targetTab.classList.contains('selected')) return;

	var targetTabBlockClass = targetTab.dataset.tabTarget;
	if (!targetTabBlockClass) return;

	if (e) e.preventDefault();

	var i = 0,
		targetTabBlock;

	do {
		if (this._tabsBlocks[i].classList.contains(targetTabBlockClass)) {
			targetTabBlock = this._tabsBlocks[i];
		}

		i++;
	} while (i < this._tabsBlocks.length && !targetTabBlock);

	if (!targetTabBlock) return;

	this._removeSelectedClass();
	targetTab.classList.add('selected');
	targetTabBlock.classList.add('selected');
};

SimpleTabs.prototype._removeSelectedClass = function() {
	for (var i = 0; i < this._tabs.length; i++) {
		this._tabs[i].classList.remove('selected');
	}
	for (var i = 0; i < this._tabsBlocks.length; i++) {
		this._tabsBlocks[i].classList.remove('selected');
	}
};

module.exports = SimpleTabs;
