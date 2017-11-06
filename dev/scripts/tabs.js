"use strict";

/**
 * Class Tabs
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that contains tab labels (.tab) that will invoke switch of tabs and tab blocks (.tab_block) with content of tabs
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. transitionDuration (required) - duration of transition of switcheing between tabs
 *		1.4. initialTabNum (optional) - index of initial active tab
 *		1.5... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
} catch (err) {
	console.warn(err);
}

function Tabs(options) {
	options.name = options.name || 'Tabs';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;
	this._transitionDuration = options.transitionDuration;

	// bind class instance as "this" for event listener functions
	this._onClick = this._onClick.bind(this);
	this._onSignalToOpenTab = this._onSignalToOpenTab.bind(this);

	// run main initialisation function
	this._init(options.initialTabNum ? options.initialTabNum - 1 : 0);
}

// Inherit prototype methods from Helper
Tabs.prototype = Object.create(Helper.prototype);
Tabs.prototype.constructor = Tabs;

// Main initialisation function
// Arguments:
// 	1. initialTabNum (required) - index of initial active tab
Tabs.prototype._init = function(initialTabNum) {
	this._tabsArr = this._elem.querySelectorAll('.tab');
	this._tabBlockArr = this._elem.querySelectorAll('.tab_block');
	// set initial active tab
	var activeTab = this._tabsArr[initialTabNum] ? this._tabsArr[initialTabNum] : this._tabsArr[0];

	// hide all tabs
	this._removeActiveClassesFromAll();

	// if activeTab exists then switch to it
	if (activeTab) {
		this._activateTab(activeTab, this._showActiveBlockWithoutTransition.bind(this));
	}

	// start listening for signal to switch tab from outer code
	this._addListener(document, 'signalToOpenTab', this._onSignalToOpenTab);
	// start reacting to user clicks
	this._addListener(this._elem, 'click', this._onClick);
};

// Invoked by click event
// Arguments:
// 	1. e (required) - event object
Tabs.prototype._onClick = function(e) {
	var target = e.target;
	if (!target) return;
	var tab = target.closest('.tab');

	// if click was on a tab then switch to it
	if (tab) {
		e.preventDefault();
		this._activateTab(tab, this._showActiveBlockWithTransition.bind(this));
	}
};

// Invoked by signalToOpenTab event
// Arguments:
// 	1. e (required) - event object, must contain selector if a tab block to be activated
Tabs.prototype._onSignalToOpenTab = function(e) {
	var targetSelector = e.detail.selector;
	var targetTbaBlock = this._elem.querySelector(targetSelector);
	// check if passed selector is from a tab block, if not then do nothing
	if (!targetTbaBlock || !targetTbaBlock.classList.contains('tab_block')) return;

	// if e.detail.transition set to true then switch to tab with transition, else without it
	if (e.detail.transition) {
		this._showActiveBlockWithTransition(targetTbaBlock);
	} else {
		this._showActiveBlockWithoutTransition(targetTbaBlock);
	}

	// find tab label for new active tab block
	var targetTab = this._elem.querySelector('[data-tab-target="#' + targetTbaBlock.id +'"]');
	if (!targetTab) return;

	// if another tab was active then deactivate it
	if (this._activeTab) {
		this._activeTab.classList.remove('active-tab');
	}

	// if tab label found then activate it
	targetTab.classList.add('active-tab');
	this._activeTab = targetTab;
};

// Removes active classes from tab labels and tab blocks
Tabs.prototype._removeActiveClassesFromAll = function() {
	this._removeActiveClassFromTabs();
	this._removeActiveClassFromTabBlocks();
};

// Removes active classes from tab labels
Tabs.prototype._removeActiveClassFromTabs = function() {
	for (var i = 0; i < this._tabsArr.length; i++) {
		if (this._tabsArr[i].classList.contains('active-tab')) {
			this._tabsArr[i].classList.remove('active-tab');
		}
	}
};

// Removes active classes from tab blocks
Tabs.prototype._removeActiveClassFromTabBlocks = function() {
	for (var i = 0; i < this._tabBlockArr.length; i++) {
		if (this._tabBlockArr[i].classList.contains('active-tab-block')) {
			this._tabBlockArr[i].classList.remove('active-tab-block');
		}
		if (this._tabBlockArr[i].classList.contains('fade')) {
			this._tabBlockArr[i].classList.remove('fade');
		}
	}
};

// Sets new active tab
// Arguments:
// 	1. tabElem (required) - tab label with [data-tab-target] attribute which contains selector of tab block or it's child element
// 	1. showBlockFunction (required) - function to use for tab switch
Tabs.prototype._activateTab = function(tabElem, showBlockFunction) {
	if (!tabElem || this._activeTab === tabElem) return;

	// find which tab label
	var tabLink = tabElem.closest("[data-tab-target]");
	if (!tabLink) return;

	// get tab block selector
	var tabBlockId = tabLink.dataset.tabTarget;
	if (!tabBlockId) return;

	// find tab block
	var tabBlock = this._elem.querySelector(tabBlockId);
	if (!tabBlock) return;

	if (this._activeTab) {
		this._activeTab.classList.remove('active-tab');
	}

	// set new active tab label
	tabElem.classList.add('active-tab');
	this._activeTab = tabElem;

	// show new active tab block
	showBlockFunction(tabBlock);
};

// Sets new active tab with transition
// Arguments:
// 	1. tabElem (tabBlock) - tab block to set active
Tabs.prototype._showActiveBlockWithTransition = function(tabBlock) {
	// if timer for transition class is set then remove it
	if (this._tabChangeTimer) {
		clearTimeout(this._tabChangeTimer);
	}
	if (this._activeTabBlock) {
		this._activeTabBlock.classList.remove('fade');
	}

	// set timer for transition
	this._tabChangeTimer = setTimeout(function(){
		// show new active tab block
		this._removeActiveClassFromTabBlocks();
		tabBlock.classList.add('active-tab-block');
		this._activeTabBlock = tabBlock;
		this._tabChangeTimer = setTimeout(function(){
			tabBlock.classList.add('fade');
		}.bind(this), 100);
	}.bind(this), this._transitionDuration * 1000);
};

// Sets new active tab without transition
// Arguments:
// 	1. tabElem (tabBlock) - tab block to set active
Tabs.prototype._showActiveBlockWithoutTransition = function(tabBlock) {
	// if timer for transition class is set then remove it
	if (this._tabChangeTimer) {
		clearTimeout(this._tabChangeTimer);
	}

	// show new active tab block
	this._removeActiveClassFromTabBlocks();
	tabBlock.classList.add('active-tab-block');
	tabBlock.classList.add('fade');
	this._activeTabBlock = tabBlock;
};

// Try exporting class via webpack
try {
	module.exports = Tabs;
} catch (err) {
	console.warn(err);
}
