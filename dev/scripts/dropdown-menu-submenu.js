"use strict";

var Dropdown = require('./dropdown.js');

function SubMenu(options) {
	options.name = options.name || 'Dropdown-SubMenu';
	Dropdown.call(this, options);
}

SubMenu.prototype = Object.create(Dropdown.prototype);
SubMenu.prototype.constructor = Dropdown;

SubMenu.prototype._toggleDropdown = function(target, e) {
	if (Dropdown.prototype._toggleDropdown.apply(this, arguments)) {
		this._sendCustomEvent(this._elem, 'submenutoggle', {
			bubbles: true,
			detail: {
				height: parseFloat(this._dropdownContainer.style.height),
				state: this._state
			}
		});
	}
};

SubMenu.prototype.toggleDropdownManual = function() {
	Dropdown.prototype._toggleDropdown.apply(this, arguments);
};

module.exports = SubMenu;
