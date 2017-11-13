"use strict";

/**
 * Class IndexMenuController
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	verticalCarouselmenu.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - html element that contains left menu column (#carousel_menu_left) and right menu column (#carousel_menu_right)
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. switchBreakpoint (optional) - window width breakpoint (px) after which menu will be in collapsing mode, and before which menu will be in scrolling mode
 *		1.4. columnBreakpoint (optional) - window width breakpoint (px) after which menu will be split in two columns, and before which menu will be joined in one column
 *		1.5. activeClass (optional) - class that will be added to currentely actime menu column
 *		1.6... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
    var Helper = require('./helper');
    var VerticalCarouselMenu = require('./verticalCarouselmenu');
} catch (err) {
    console.warn(err);
}

function IndexMenuController(options) {
    options.name = options.name || 'IndexMenuController';
    // run Helper constructor
    Helper.call(this, options);

    this._elem = options.elem;
    this._switchBreakpoint = options.switchBreakpoint || 0;
    this._columnBreakpoint = options.columnBreakpoint || 0;
    this._activeClass = options.activeClass || 'active_menu';

    // bind class instance as "this" for event listener functions
    this._onResize = this._onResize.bind(this);
    this._onMouseOver = this._onMouseOver.bind(this);

    // run main initialisation function
    this._init();
}

// Inherit prototype methods from Helper
IndexMenuController.prototype = Object.create(Helper.prototype);
IndexMenuController.prototype.constructor = IndexMenuController;

// Reassigned remove function from Helper
IndexMenuController.prototype.remove = function() {
    // cancel left column menu
    if (this._carouselMenuLeft && this._carouselMenuLeft.remove) {
        this._carouselMenuLeft.remove();
    }
    // cancel right column menu
    if (this._carouselMenuRight && this._carouselMenuRight.remove) {
        this._carouselMenuRight.remove();
    }

    // call remove function from Helper
    Helper.prototype.remove.apply(this, arguments);
};

// Main initialisation function
IndexMenuController.prototype._init = function() {
    // set this._elem height
    this._controllHeight();

    // check for current menu mode
    if (window.innerWidth < this._switchBreakpoint) {
        this._mode = 'scrolling';
    } else {
        this._mode = 'collapsing';
    }

    // first initialisation will be with 2 columns
    this._columns = 2;

    this._carouselMenuLeftLICopyArr = [];
    this._carouselMenuRightLICopyArr = [];

    this._carouselMenuLeftElem = this._elem.querySelector('#carousel_menu_left');
    this._carouselMenuRightElem = this._elem.querySelector('#carousel_menu_right');

    // find menu items of both menus
    var listItemsRight = this._carouselMenuRightElem.querySelectorAll('.carousel_list_item');
    var listItemsLeft = this._carouselMenuLeftElem.querySelectorAll('.carousel_list_item');

    // find list items containers of both menus
    this._listItemContainerRight = this._carouselMenuRightElem.querySelector('.carousel_list_item_container');
    this._listItemContainerLeft = this._carouselMenuLeftElem.querySelector('.carousel_list_item_container');

    // copy create copy arrays of list items for both menus
    for (var i = 0; i < listItemsRight.length; i++) {
        this._carouselMenuRightLICopyArr[i] = listItemsRight[i].cloneNode(true);
    }
    for (var i = 0; i < listItemsLeft.length; i++) {
        this._carouselMenuLeftLICopyArr[i] = listItemsLeft[i].cloneNode(true);
    }

    // initialise both menus
    if (this._carouselMenuLeftElem) {
        this._carouselMenuLeft = new VerticalCarouselMenu({
            elem: this._carouselMenuLeftElem,
            openedMenuItemHeightDiff: 30,
            mode: this._mode,
            heightElem: this._elem
        });
    }
    if (this._carouselMenuRightElem) {
        this._carouselMenuRight = new VerticalCarouselMenu({
            elem: this._carouselMenuRightElem,
            openedMenuItemHeightDiff: 30,
            mode: this._mode,
            heightElem: this._elem
        });
    }

    // add active class to left menu (or right menu if no left menu)
    if (this._carouselMenuLeft && this._carouselMenuLeft.remove) {
        this._carouselMenuLeftElem.classList.add(this._activeClass);
        this._carouselMenuLeft.setActive(true);
        this._activeMenu = this._carouselMenuLeftElem;
        this._carouselMenuLeft.sendInfoOnSelectedSlideIcon();

    } else if (this._carouselMenuRight && this._carouselMenuRight.remove && !this._carouselMenuLeft) {
        this._carouselMenuRightElem.classList.add(this._activeClass);
        this._carouselMenuRight.setActive(true);
        this._activeMenu = this._carouselMenuRightElem;
        this._carouselMenuLeft.sendInfoOnSelectedSlideIcon();

    }

    // check for columns breakpoint
    this._controllColumnsBreakpoint();

    // send signal that menu is initialised
    this._sendCustomEvent(document, 'indexMenuInitialisationComplete', {bubbles: true});

    // start listening for bubbling mouseover  and touchstart events and resize event on window
    this._addListener(window, 'resize', this._onResize);
    this._addListener(this._elem, 'mouseover', this._onMouseOver);
    this._addListener(this._elem, 'touchstart', this._onMouseOver);
};

// Invoked by resize event on window
// Arguments:
// 	1. e (required) - event object
IndexMenuController.prototype._onResize = function() {
    // check height and breakpoints
    this._controllHeight();
    this._controllColumnsBreakpoint();
    this._controllSwitchBreakpoint();
};

// Switches between collapsing and scrolling mode if needed
IndexMenuController.prototype._controllSwitchBreakpoint = function() {
    if (window.innerWidth < this._switchBreakpoint && this._mode === 'collapsing') {
        // if window width is lower than switch breakpoint and menu in collapsing mode then switch to scrolling mode
        if (this._carouselMenuLeftElem) {
            this._carouselMenuLeftElem.classList.remove(this._activeClass);
        }
        if (this._carouselMenuRightElem) {
            this._carouselMenuRightElem.classList.remove(this._activeClass);
        }

        if (this._carouselMenuLeft) {
            this._carouselMenuLeft._switchMenuMode();
            this._carouselMenuLeft.setActive(true);
            this._carouselMenuLeftElem.classList.add(this._activeClass);
            this._activeMenu = this._carouselMenuLeftElem;
            this._carouselMenuLeft.sendInfoOnSelectedSlideIcon();
        }
        if (this._carouselMenuRight) {
            this._carouselMenuRight._switchMenuMode();
            if (!this._carouselMenuLeft) {
                this._carouselMenuRight.setActive(true);
                this._carouselMenuRightElem.classList.add(this._activeClass);
                this._activeMenu = this._carouselMenuRightElem;
                this._carouselMenuRight.sendInfoOnSelectedSlideIcon();
            }
        }
        this._mode = 'scrolling';

    } else if (window.innerWidth >= this._switchBreakpoint && this._mode === 'scrolling') {
        // if window width is higher than switch breakpoint and menu in scrolling mode then switch to collapsing mode
        if (this._carouselMenuLeftElem) {
            this._carouselMenuLeftElem.classList.remove(this._activeClass);
        }
        if (this._carouselMenuRightElem) {
            this._carouselMenuRightElem.classList.remove(this._activeClass);
        }

        if (this._carouselMenuLeft) {
            this._carouselMenuLeft._switchMenuMode();
            this._carouselMenuLeft.sendInfoOnSelectedSlideIcon();
        }
        if (this._carouselMenuRight) {
            this._carouselMenuRight._switchMenuMode();
            if (!this._carouselMenuLeft) {
                this._carouselMenuRight.sendInfoOnSelectedSlideIcon();
            }
        }
        this._mode = 'collapsing';

    }
};

// Switches between 1 and 2 columns mode if needed
IndexMenuController.prototype._controllColumnsBreakpoint = function() {
    if (window.innerWidth < this._columnBreakpoint && this._columns === 2) {
        // if window width is lower than columns breakpoint and menu in 2 columns mode then switch to 1 columns mode
        this._switchFromTwoColumnsToOne();
        this._columns = 1;

    } else if (window.innerWidth >= this._columnBreakpoint && this._columns === 1) {
        // if window width is higher than columns breakpoint and menu in 1 columns mode then switch to 2 columns mode
        this._switchFromOneColumnToTwo();
        this._columns = 2;

    }
};

// Switches to one column mode
IndexMenuController.prototype._switchFromTwoColumnsToOne = function() {
    this._carouselMenuLeftElem.classList.remove(this._activeClass);
    this._carouselMenuRightElem.classList.remove(this._activeClass);

    // remove instances of both menus
    this._carouselMenuRight.remove();
    this._carouselMenuLeft.remove();
    delete this._carouselMenuRight;
    delete this._carouselMenuLeft;

    var listItemContainerRightNewContent = document.createDocumentFragment();

    // copy menu items from both menus into document fragment
    for (var i = 0; i < this._carouselMenuRightLICopyArr.length; i++) {
        listItemContainerRightNewContent.appendChild(this._carouselMenuRightLICopyArr[i].cloneNode(true));
    }
    for (var i = 0; i < this._carouselMenuLeftLICopyArr.length; i++) {
        listItemContainerRightNewContent.appendChild(this._carouselMenuLeftLICopyArr[i].cloneNode(true));
    }

    // remove inner html from both menu elements
    this._listItemContainerLeft.innerHTML = '';
    this._listItemContainerRight.innerHTML = '';
    // add document fragment with menu items from both menus to right menu
    this._listItemContainerRight.appendChild(listItemContainerRightNewContent);

    // initialise right menu
    this._carouselMenuRight = new VerticalCarouselMenu({
        elem: this._carouselMenuRightElem,
        openedMenuItemHeightDiff: 30,
        mode: this._mode,
        heightElem: this._elem
    });

    // make right menu active
    this._carouselMenuRightElem.classList.add(this._activeClass);
    this._activeMenu = this._carouselMenuRightElem;
    this._carouselMenuRight.setActive(true);
    this._carouselMenuRight.sendInfoOnSelectedSlideIcon();
};

// Switches to two columns mode
IndexMenuController.prototype._switchFromOneColumnToTwo = function() {
    this._carouselMenuRightElem.classList.remove(this._activeClass);
    // remove instance of right menu
    this._carouselMenuRight.remove();
    delete this._carouselMenuRight;

    var listItemContainerLeftNewContent = document.createDocumentFragment();
    var listItemContainerRightNewContent = document.createDocumentFragment();

    // copy menu items from right menu into right menu document fragment
    for (var i = 0; i < this._carouselMenuRightLICopyArr.length; i++) {
        listItemContainerRightNewContent.appendChild(this._carouselMenuRightLICopyArr[i].cloneNode(true));
    }
    // copy menu items from left menu into left menu document fragment
    for (var i = 0; i < this._carouselMenuLeftLICopyArr.length; i++) {
        listItemContainerLeftNewContent.appendChild(this._carouselMenuLeftLICopyArr[i].cloneNode(true));
    }

    // remove inner html from both menu elements
    this._listItemContainerLeft.innerHTML = '';
    this._listItemContainerRight.innerHTML = '';
    // add document fragments with menu items in respective menu elements
    this._listItemContainerLeft.appendChild(listItemContainerLeftNewContent);
    this._listItemContainerRight.appendChild(listItemContainerRightNewContent);

    // initialise both menus
    this._carouselMenuRight = new VerticalCarouselMenu({
        elem: this._carouselMenuRightElem,
        openedMenuItemHeightDiff: 30,
        mode: this._mode,
        heightElem: this._elem
    });
    this._carouselMenuLeft = new VerticalCarouselMenu({
        elem: this._carouselMenuLeftElem,
        openedMenuItemHeightDiff: 30,
        mode: this._mode,
        heightElem: this._elem
    });

    // make right menu active
    this._carouselMenuRight.setActive(false);
    this._carouselMenuLeftElem.classList.add(this._activeClass);
    this._activeMenu = this._carouselMenuLeftElem;
    this._carouselMenuLeft.setActive(true);
    this._carouselMenuLeft.sendInfoOnSelectedSlideIcon();
};

// Invoked by mouseover event
// Arguments:
// 	1. e (required) - event object
IndexMenuController.prototype._onMouseOver = function(e) {
    var target = e.target;
    // controll active class on menus
    this._controllActiveClass(target);
};

// Controlls active class on menus
// Arguments:
// 	1. elem (required) - target of mouseover event
IndexMenuController.prototype._controllActiveClass = function(elem) {
    // check which menu cotains element that was hovered
    var containsRightMenuElem = this._carouselMenuRightElem.contains(elem);
    var containsLeftMenuElem = this._carouselMenuLeftElem.contains(elem);

    if (containsRightMenuElem && this._activeMenu === this._carouselMenuLeftElem && this._carouselMenuRight && this._carouselMenuRight.remove) {
        // if hovered element is in right menu, left menu is active and right menu is initialised then make right menu active
        this._activeMenu = this._carouselMenuRightElem;
        this._carouselMenuLeftElem.classList.remove(this._activeClass);
        if (this._carouselMenuLeft) {
            this._carouselMenuLeft.setActive(false);
        }
        this._carouselMenuRightElem.classList.add(this._activeClass);
        this._carouselMenuRight.setActive(true);
        this._activeMenu = this._carouselMenuRightElem;

        this._carouselMenuRight.sendInfoOnSelectedSlideIcon();

    } else if (containsLeftMenuElem && this._activeMenu === this._carouselMenuRightElem && this._carouselMenuLeft && this._carouselMenuLeft.remove) {
        // if hovered element is in left menu, right menu is active and left menu is initialised then make left menu active
        this._activeMenu = this._carouselMenuLeftElem;
        this._carouselMenuRightElem.classList.remove(this._activeClass);
        this._carouselMenuRight.setActive(false);
        this._carouselMenuLeftElem.classList.add(this._activeClass);
        this._carouselMenuLeft.setActive(true);
        this._activeMenu = this._carouselMenuLeftElem;

        this._carouselMenuLeft.sendInfoOnSelectedSlideIcon();
    }
};

// Controlls height of this._elem
IndexMenuController.prototype._controllHeight = function() {
    var height = 0;
    var width = this._checkScreenWidth();
    if (width === 'xs') {
        height = window.innerHeight - 90 - 90;
    } else if (width === 'sm' || width === 'md') {
        height = window.innerHeight - 90 - 130;
    } else if (width === 'lg') {
        height = window.innerHeight - 130 - 130;
    }

    this._elem.style.height = height + 'px';
};

// Try exporting class via webpack
try {
    module.exports = IndexMenuController;
} catch (err) {
    console.warn(err);
}
