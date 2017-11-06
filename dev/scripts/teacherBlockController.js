"use strict";

/**
 * Class TeacherBlockController
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	animation.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - contant elem of theacher block page slide (.course_teacher_block_content)
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. pageSlideElem (required) - theacher block page slide (.course_teacher_block)
 *		1.4. mainTitleElem (required) - title element of theacher block page slide (.main_title)
 *		1.5. svgElemSelector (required) - selector of svg element
 *		1.6. circleBlockElem (required) - circle element (.teacher_img_outer_container)
 *		1.7. firstBlockElem (required) - element with teacher description (.teacher_about)
 *		1.8. secondBlockElem (required) - element with teacher skills (.teacher_skills)
 *		1.9. thirdBlockElem (required) - element with teacher experience (.teacher_expirience)
 *		1.10... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (e) {
	console.log(e);
}

function TeacherBlockController(options) {
	options.name = options.name || 'TeacherBlockController';
	// run Helper constructor
	Helper.call(this, options);

	this._elem = options.elem;
	this._pageSlideElem = options.pageSlideElem;
	this._mainTitleElem = options.mainTitleElem;
	this._svgElemSelector = options.svgElemSelector || 'svg';

	this._circleBlock = {
		elem: options.circleBlockElem
	};
	this._firstBlock = {
		elem: options.firstBlockElem
	};
	this._secondBlock = {
		elem: options.secondBlockElem
	};
	this._thirdBlock = {
		elem: options.thirdBlockElem
	};

	// bind class instance as "this" for event listener functions
	this._onResize = this._onResize.bind(this);
	this._onClick = this._onClick.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
TeacherBlockController.prototype = Object.create(Helper.prototype);
TeacherBlockController.prototype.constructor = TeacherBlockController;

// Main initialisation function
TeacherBlockController.prototype._init = function() {
	this._svgElem = this._elem.querySelector(this._svgElemSelector);
	if (!this._svgElem) return;

	// Find all templates elements with teachers data and show data from the first
	this._handleTemplates();

	this._addListener(this._elem, 'click', this._onClick);
	this._addListener(window, 'resize', this._onResize);
};

// Sets initial state of all elements
TeacherBlockController.prototype._setInitState = function() {
	// check screen width
	this._checkMode();
	// set height of main svg element
	this._setSvgElemHeight();
	// calculate center and border coordinates of svg element
	this._calculateBasicValues();
	// calculate styles for four blocks
	this._calculateStylesForHtmlElems();
	// set styles for four blocks
	this._setStylesForHtmlElems();
	// generate svg connection lines
	this._draw();
};

// Searches for template elements with teacher data and displays data from 1st
TeacherBlockController.prototype._handleTemplates = function() {
	this._templates = this._elem.querySelectorAll('.temp_teacher_data');
	if (this._templates.length === 0) return;

	for (var i = 0; i < this._templates.length; i++) {
		this._templates[i].dataset.templateId = i + 1;
	}

	// show data from 1st template
	this._setActiveTemplate(this._templates[0]);
};

// Controlls change of current data in the elements to data from passed template
// Arguments:
// 	1. template (required) - template element to get data
// 	2. animated (optional) - if set to true then data change will be animated through opacity
TeacherBlockController.prototype._setActiveTemplate = function(template, animated) {
	if (!animated) {
		// if animated is not set (or set to false) then display new data instantly
		// insert new data
		this._insertTemplData(template);
		// create thumbnails for inactive templates
		this._createThumbnails(template);
		// get thumbnail elements
		this._getThumbnails();
		// set all elements into initial positions
		this._setInitState();
		// start looping animation of thumbnails
		this._animateThumbnails();

	} else if (!this._switchAnimation) {
		// create new fading animtion
		var duration = 500;
		this._switchAnimation = new Animation(
			function(timePassed) {
				// calculate timing function value for current moment of animation
				var timeMultiplier = Animation.linear(duration, timePassed),
					animationProgress = 1 - timeMultiplier;

				// set opcity for current moment of animation
				this._circleBlock.elem.style.opacity = animationProgress;
				this._firstBlock.elem.style.opacity = animationProgress;
				this._secondBlock.elem.style.opacity = animationProgress;
				this._thirdBlock.elem.style.opacity = animationProgress;
				this._svgElem.style.opacity = animationProgress;
				for (var i = 0; i < this._thumbnailsArr.length; i++) {
					this._thumbnailsArr[i].style.opacity = animationProgress;
				}
			}.bind(this),
			duration,
			function() {
				delete this._switchAnimation;

				if (this._currentThumbAnimation) {
					this._currentThumbAnimation.stop();
					delete this._currentThumbAnimation;
				}

				// after all element hidden change insert data from new active template
				this._insertTemplData(template);
				// create thumbnails for inactive templates
				this._createThumbnails(template);
				// get thumbnail elements
				this._getThumbnails();
				for (var i = 0; i < this._thumbnailsArr.length; i++) {
					this._thumbnailsArr[i].style.opacity = 0;
				}
				// set initial state of all element
				this._setInitState();

				// create new apparence animation
				this._switchAnimation = new Animation(
					function(timePassed) {
						// calculate timing function value for current moment of animation
						var timeMultiplier = Animation.linear(duration, timePassed),
							animationProgress = 1 * timeMultiplier;

						// set opcity for current moment of animation
						this._circleBlock.elem.style.opacity = animationProgress;
						this._firstBlock.elem.style.opacity = animationProgress;
						this._secondBlock.elem.style.opacity = animationProgress;
						this._thirdBlock.elem.style.opacity = animationProgress;
						this._svgElem.style.opacity = animationProgress;
						for (var i = 0; i < this._thumbnailsArr.length; i++) {
							this._thumbnailsArr[i].style.opacity = animationProgress;
						}
					}.bind(this),
					duration,
					function() {
						delete this._switchAnimation;
						// start looping animation of thumbnails
						this._animateThumbnails();
					}.bind(this)
				);
			}.bind(this)
		);

	}
};

// Inserts data from passed template into elements
// Arguments:
// 	1. templateElem (required) - template element to get data
TeacherBlockController.prototype._insertTemplData = function(templateElem) {
	// get all elements that will get data from teplate content, they must contain [data-template-target] attrubute with selector of element inside template
	var elemsToPlaceData = this._elem.querySelectorAll('[data-template-target]'),
		targetSelector,
		targetElem,
		dataToInsert,
		attributeToChange;

	for (var i = 0; i < elemsToPlaceData.length; i++) {
		if (elemsToPlaceData[i].tagName === 'IMG') {
			// if element is image then in will recive src attribute from template
			attributeToChange = 'src';
		} else {
			// else element will recive inner html from template
			attributeToChange = 'innerHTML';
		}

		dataToInsert = '';

		// get selector of element inside template to pull data
		targetSelector = elemsToPlaceData[i].dataset.templateTarget;
		if (targetSelector) {

			// find element inside template with that selector
			targetElem = templateElem.content.querySelector(targetSelector);
			if (targetElem) {

				// get data from found element
				if (attributeToChange === 'src') {
					dataToInsert = targetElem.getAttribute(attributeToChange);

				} else {
					dataToInsert = targetElem[attributeToChange];

				}
			}
		}

		// insert found data
		elemsToPlaceData[i][attributeToChange] = dataToInsert;
	}
};

// Creates tumbnail elements for inactive templates
// Arguments:
//	1. curTemplateElem (required) - current active template
TeacherBlockController.prototype._createThumbnails = function(curTemplateElem) {
	var thumbnailsContainer = this._elem.querySelector('.thumbnails');
	if (!thumbnailsContainer) return;

	var thumbnailsHtml = '',
		thumbnailSrcElem,
		src,
		templateId;

	// look for tumbnail elements inside inactive templates
	for (var i = 0; i < this._templates.length; i++) {
		src = '';

		if (this._templates[i] === curTemplateElem) continue;

		// tumbnail element inside template must have [data-thumbnail] attribute
		thumbnailSrcElem = this._templates[i].content.querySelector('[data-thumbnail]');
		if (!thumbnailSrcElem) continue;

		// get src from thumbnail element
		src = thumbnailSrcElem.getAttribute('src');
		if (!src) continue;

		// get template id for thumbnail
		templateId = this._templates[i].dataset.templateId;

		// create thumbnail html
		thumbnailsHtml += '<img src="' + src + '" alt="" class="thumbnail" data-target-template-id="' + templateId + '">';
	}

	// insert all thumbnails html into thumbnail container
	thumbnailsContainer.innerHTML = thumbnailsHtml;
};

// Displays template data if it's thumbnail was clicked
// Arguments:
//	1. target (required) - thumbnail element for inactive template
TeacherBlockController.prototype._onThumbnailClick = function(target) {
	// thumbnail must have [data-target-template-id] attribute
	var targetTemplateId = target.dataset.targetTemplateId;
	if (!targetTemplateId) return;

	// search for template with that id
	for (var i = 0, targetTemplate; i < this._templates.length && !targetTemplate; i++) {
		if (this._templates[i].dataset.templateId === targetTemplateId) {
			targetTemplate = this._templates[i];
		}
	}

	if (!targetTemplate) return;

	// if template is found then display data from it
	this._setActiveTemplate(targetTemplate, true);
}

// Checks window width mode
TeacherBlockController.prototype._checkMode = function() {
	if (window.innerWidth >= 1200) {
		this._mode = 'lg-screen';
	} else if (window.innerWidth >= 992 && window.innerWidth < 1200) {
		this._mode = 'md-screen';
	} else if (window.innerWidth >= 768 && window.innerWidth < 992) {
		this._mode = 'sm-screen';
	} else if (window.innerWidth < 768) {
		this._mode = 'xs-screen';
	}
};

// Sets height for main svg element dependiing on window width
TeacherBlockController.prototype._setSvgElemHeight = function() {
	var height;

	if (this._mode === 'lg-screen') {
		height = this._pageSlideElem.offsetHeight - this._mainTitleElem.offsetHeight - 68;

	} else if (this._mode === 'md-screen') {
		this._firstBlock.elem.style.width = this._elem.offsetWidth + 'px';
		height = this._circleBlock.elem.offsetWidth + this._firstBlock.elem.offsetHeight - 10;

	} else if (this._mode === 'sm-screen') {
		this._firstBlock.elem.style.width = this._elem.offsetWidth + 'px';
		height = this._circleBlock.elem.offsetWidth + this._firstBlock.elem.offsetHeight + 30;

	} else if (this._mode === 'xs-screen' && this._checkScreenWidth(350)) {
		height = this._circleBlock.elem.offsetWidth;

	} else if (this._checkScreenWidth(0, 349)) {
		height = this._circleBlock.elem.offsetWidth;

	}

	this._svgElem.style.height = height  + 'px';
};

// Searches for template elements
TeacherBlockController.prototype._getThumbnails = function() {
	this._thumbnailsArr = this._elem.querySelectorAll('.thumbnail');
};

// Calculates center and border coordinates of svg element
TeacherBlockController.prototype._calculateBasicValues = function() {
	this._xLeftCoord = 0;
	this._xRightCoord = this._svgElem.getBoundingClientRect().width;
	this._yTopCoord = 0;
	this._yBottomCoord = this._svgElem.getBoundingClientRect().height;

	this._xCenterCoord = (this._xRightCoord - this._xLeftCoord) / 2 + this._xLeftCoord;
	this._yCenterCoord = (this._yBottomCoord - this._yTopCoord) / 2 + this._yTopCoord;
};

// Generates svg connection lines
TeacherBlockController.prototype._draw = function() {
	var svgHtml = '';
	// generates main circle
	svgHtml += this._createCentrallCircle();
	// generates connection lines
	svgHtml += this._createLinkLines();

	var pointCoords;

	this._svgElem.innerHTML = svgHtml;
};

// Calculates coordinates on circle for particular angle
// Arguments:
//	1. centerCircleXCoordinate (required) - x coordinate of circle center
//	2. centerCircleYCoordinate (required) - y coordinate of circle center
//	3. circleRadius (required) - radius of the circle
//	4. angleDegs (required) - angle (in degrees) for calculating position
TeacherBlockController.prototype._calculatePointOnCircleCoordinates = function(centerCircleXCoordinate, centerCircleYCoordinate, circleRadius, angleDegs) {
	var angleRads = angleDegs * (Math.PI/180);
	var x = centerCircleXCoordinate + circleRadius * Math.sin(angleRads);
	var y = centerCircleYCoordinate + circleRadius * Math.cos(angleRads);

	return {
		x: x,
		y: y
	};
};

// Generates html of the main circle
TeacherBlockController.prototype._createCentrallCircle = function() {
	var radius = this._circleBlock.radius;
	var circleHtml = '<circle class="centrall_circle"' +
		' cx="' + (this._circleBlock.left + radius) + '" cy="' + (this._circleBlock.top + radius) + '" r="' + radius + '"' +
		'></circle>';
	return circleHtml;
};

// Creates link lines which positions depend on screen width
TeacherBlockController.prototype._createLinkLines = function() {
	var html = '';

	if (this._mode === 'xs-screen' && this._checkScreenWidth(350)) {

	} else if (this._mode === 'sm-screen' || this._mode === 'md-screen') {
		html += this._createLinkLine(this._firstBlock, 'top-right', 320);
		html += this._createLinkLine(this._secondBlock, 'bottom-right', 240);
		html += this._createLinkLine(this._thirdBlock, 'bottom-left', 110);

	} else if (this._mode === 'lg-screen') {
		html += this._createLinkLine(this._firstBlock, 'bottom-right', 260);
		html += this._createLinkLine(this._secondBlock, 'bottom-left', 120);
		html += this._createLinkLine(this._thirdBlock, 'bottom-left', 80);

	}

	return html;
};

// Generates html of link line
// Arguments:
//	1. blockElem (required) - elem which corner will be used as starting coordinates
//	2. blockCorner (required) - string representing corner, can be: top-right, bottom-right, bottom-left, top-left
//	3. circlePointAngle (required) - angle (in degrees) which will be used to calculate ending coordinates of the line placed on the circle
TeacherBlockController.prototype._createLinkLine = function(blockElem, blockCorner, circlePointAngle) {
	var widthMultiplier,
		heightMultiplier;

	// get multipliers for current corner
	if ((blockCorner === 'top-right') || (blockCorner === 'bottom-right')) {
		widthMultiplier = 1;
	} else {
		widthMultiplier = 0;
	}
	if ((blockCorner === 'bottom-left') || (blockCorner === 'bottom-right')) {
		heightMultiplier = 1;
	} else {
		heightMultiplier = 0;
	}

	// get coordinates of the ending position
	var circlePointCoords = this._calculatePointOnCircleCoordinates(this._circleBlock.left + this._circleBlock.radius, this._circleBlock.top + this._circleBlock.radius, this._circleBlock.radius, circlePointAngle);

	// get coordinates of the starting position
	var blockX = blockElem.elem.offsetLeft + blockElem.titleElem.offsetLeft + Math.pow(-1, widthMultiplier) * ((blockElem.titleElem.offsetWidth - blockElem.titleElem.clientWidth) / 2) + blockElem.titleElem.offsetWidth * widthMultiplier;
	var blockY = blockElem.elem.offsetTop + blockElem.titleElem.offsetTop + Math.pow(-1, heightMultiplier) * ((blockElem.titleElem.offsetHeight - blockElem.titleElem.clientHeight) / 2) + blockElem.titleElem.offsetHeight * heightMultiplier;
	var circleX = circlePointCoords.x;
	var circleY = circlePointCoords.y;

	var lineHtml = '<line class="link_line" ' +
			' x1="' + blockX + '" y1="' + blockY + '"' +
			' x2="' + circleX + '" y2="' + circleY + '"' +
			'/>';
	var connectionPointHtml = '<circle class="connection_point"' +
		' cx="' + circleX + '" cy="' + circleY + '" r="' + 3 + '"' +
		'></circle>';

	return lineHtml + connectionPointHtml;
};

// Caluclates styles for all elements
TeacherBlockController.prototype._calculateStylesForHtmlElems = function() {
	this._calculateStylesForCircleElem();
	this._calculateStylesForFirstBlockElem();
	this._calculateStylesForSecondBlockElem();
	this._calculateStylesForThirdBlockElem();
};

// Calculates styles for circle element depending on window width
TeacherBlockController.prototype._calculateStylesForCircleElem = function() {
	if (!this._circleBlock.elem) return;

	this._circleBlock.width = this._circleBlock.elem.offsetWidth;
	this._circleBlock.height = this._circleBlock.width;
	this._circleBlock.radius = this._circleBlock.width / 2;
	this._circleBlock.left = this._xCenterCoord - this._circleBlock.radius;

	if (this._checkScreenWidth(0, 349)) {
		this._circleBlock.top = 0;

	} else if (this._mode === 'xs-screen') {
		this._circleBlock.top = 0;

	} else if (this._mode === 'sm-screen') {
		this._circleBlock.top = 0;

	} else if (this._mode === 'md-screen') {
		this._circleBlock.top = 0;

	} else if (this._mode === 'lg-screen') {
		this._circleBlock.top = this._yCenterCoord - this._circleBlock.radius;

	}
};

// Calculates styles for first block element depending on window width
TeacherBlockController.prototype._calculateStylesForFirstBlockElem = function() {
	if (!this._firstBlock.elem) return;

	this._firstBlock.titleElem = this._firstBlock.elem.querySelector('.title');

	if (this._mode === 'xs-screen') {
		this._firstBlock.width = this._elem.offsetWidth;
		this._firstBlock.top = 0;
		this._firstBlock.left = 0;

	} else if (this._mode === 'sm-screen') {
		this._firstBlock.width = this._elem.offsetWidth;
		this._firstBlock.top = this._circleBlock.top + this._circleBlock.height + 30;
		this._firstBlock.left = 0;

	} else if (this._mode === 'md-screen') {
		this._firstBlock.width = this._elem.offsetWidth;
		this._firstBlock.top = this._circleBlock.top + this._circleBlock.height - 10;
		this._firstBlock.left = 0;

	 } else if (this._mode === 'lg-screen') {
		this._firstBlock.width = (this._elem.offsetWidth - this._circleBlock.width) / 2 - 60;

		this._firstBlock.elem.style.width = this._firstBlock.width + 'px';

		this._firstBlock.top = (this._svgElem.getBoundingClientRect().height - this._firstBlock.elem.offsetHeight) / 2 - 20;
		this._firstBlock.left = 0;

	}
};

// Calculates styles for second block element depending on window width
TeacherBlockController.prototype._calculateStylesForSecondBlockElem = function() {
	if (!this._secondBlock.elem) return;

	this._secondBlock.titleElem = this._secondBlock.elem.querySelector('.title');

	if (this._checkScreenWidth(0, 349)) {
		this._secondBlock.top = 0;
		this._secondBlock.left = 0;

	} else if (this._mode === 'xs-screen') {
		this._secondBlock.top = 0;
		this._secondBlock.left = 0;

	} else if (this._mode === 'sm-screen' || this._mode === 'md-screen') {
		this._secondBlock.top = this._circleBlock.top;
		this._secondBlock.left = 0;

	} else if (this._mode === 'lg-screen') {
		this._secondBlock.top = this._circleBlock.top;
		this._secondBlock.left = this._circleBlock.left + this._circleBlock.width + 80;

	}
};

// Calculates styles for third block element depending on window width
TeacherBlockController.prototype._calculateStylesForThirdBlockElem = function() {
	if (!this._thirdBlock.elem) return;

	this._thirdBlock.titleElem = this._thirdBlock.elem.querySelector('.title');

	if (this._checkScreenWidth(0, 349)) {
		this._thirdBlock.top = 0;
		this._thirdBlock.left = 0;

	} else if (this._mode === 'xs-screen') {
		this._thirdBlock.top = 0;
		this._thirdBlock.left = 0;

	} else if (this._mode === 'sm-screen' || this._mode === 'md-screen') {
		this._thirdBlock.top = this._circleBlock.top;
		this._thirdBlock.left = this._elem.offsetWidth - this._thirdBlock.elem.offsetWidth;

	} else if (this._mode === 'lg-screen') {
		this._thirdBlock.top = this._yCenterCoord + 60;
		this._thirdBlock.left = this._circleBlock.left + this._circleBlock.width + 120;

	}
};

// Sets calculated styles for all elements
TeacherBlockController.prototype._setStylesForHtmlElems = function() {
	this._setStylesForCircleElem();
	this._setStylesForFirstElem();
	this._setStylesForSecondElem();
	this._setStylesForThirdElem();
	this._setStylesForThumbnails();
};

// Adds [data-no-page-scroll-area] attribute to element if it has scroll to prevent page scroll
// Arguments:
//	1. elem (required) - element to check for scroll
TeacherBlockController.prototype._setPageScrollArea = function(elem) {
	if (elem.scrollHeight > elem.offsetHeight && !elem.dataset.noPageScrollArea) {
		elem.dataset.noPageScrollArea = true;
	} else if (elem.scrollHeight === elem.offsetHeight && elem.dataset.noPageScrollArea === "true") {
		elem.removeAttribute('data-no-page-scroll-area');
	}

	elem.scrollTop = 0;
};

// Sets calculated styles for circle elem
TeacherBlockController.prototype._setStylesForCircleElem = function() {
	if (!this._circleBlock.elem) return;

	this._circleBlock.elem.style.height = this._circleBlock.height + 'px';
	this._circleBlock.elem.style.top = this._circleBlock.top + 'px';
	this._circleBlock.elem.style.left = this._circleBlock.left + 'px';
};

// Sets calculated styles for first block elem
TeacherBlockController.prototype._setStylesForFirstElem = function() {
	if (!this._firstBlock.elem) return;

	this._firstBlock.elem.style.width = this._firstBlock.width + 'px';
	this._firstBlock.elem.style.top = this._firstBlock.top + 'px';
	this._firstBlock.elem.style.left = this._firstBlock.left + 'px';

	this._setPageScrollArea(this._firstBlock.elem.querySelector('.description'));
};

// Sets calculated styles for second block elem
TeacherBlockController.prototype._setStylesForSecondElem = function() {
	if (!this._secondBlock.elem) return;

	this._secondBlock.elem.style.top = this._secondBlock.top + 'px';
	this._secondBlock.elem.style.left = this._secondBlock.left + 'px';

	this._setPageScrollArea(this._secondBlock.elem.querySelector('.skill_list'));
};

// Sets calculated styles for third block elem
TeacherBlockController.prototype._setStylesForThirdElem = function() {
	if (!this._thirdBlock.elem) return;

	this._thirdBlock.elem.style.top = this._thirdBlock.top + 'px';
	this._thirdBlock.elem.style.left = this._thirdBlock.left + 'px';

	this._setPageScrollArea(this._thirdBlock.elem.querySelector('.description'));
};

// Sets calculated styles for first thumbnail elements
TeacherBlockController.prototype._setStylesForThumbnails = function() {
	var imgCenterCoords;
	this._thumbnailStartAngle = 320;
	this._thumbnailEndAngle = 300;
	this._thumbnailDiffAngle = this._checkScreenWidth(0, 450) ? 20 + (450 - window.innerWidth) / 18 : 20;
	this._thumbnailAnimationDelay = 3000;
	this._thumbnailAnimationDuration = 2000;

	for (var i = 0; i < this._thumbnailsArr.length; i++) {
		imgCenterCoords = this._calculatePointOnCircleCoordinates(this._circleBlock.left + this._circleBlock.radius, this._circleBlock.top + this._circleBlock.radius, this._circleBlock.radius, this._thumbnailStartAngle - this._thumbnailDiffAngle * i);

		this._thumbnailsArr[i].style.top = imgCenterCoords.y - 30 + 'px';
		this._thumbnailsArr[i].style.left = imgCenterCoords.x - 30 + 'px';
	}
};

// Start looped animation of thumbnail elements
TeacherBlockController.prototype._animateThumbnails = function() {
	// if animation is already in progress the stop it
	if (this._currentThumbAnimation) {
		this._currentThumbAnimation.stop();
		delete this._currentThumbAnimation;
	}
	var self = this;
	// set start and target angle on circle
	var startAngle = this._thumbnailStartAngle;
	var endAngle = this._thumbnailEndAngle;

	// Function which creates animation and will be looped
	function animateThumbnails() {
		// create new animation
		self._currentThumbAnimation = new Animation(
			function(timePassed) {
				// calculate timing function value for current moment of animation
				var timeMultiplier = Animation.quadEaseInOut(self._thumbnailAnimationDuration, timePassed);
				// calculate current angle on circle
				var curAngle = startAngle + ((endAngle - startAngle) * (timeMultiplier));
				var imgCenetrCoords = [];

				// calculate current position on circle for each thumbnail
				for (var i = 0; i < self._thumbnailsArr.length; i++) {
					imgCenetrCoords[i] = self._calculatePointOnCircleCoordinates(self._circleBlock.left + self._circleBlock.radius, self._circleBlock.top + self._circleBlock.radius, self._circleBlock.radius, curAngle - self._thumbnailDiffAngle * i);
				}

				for (i = 0; i < self._thumbnailsArr.length; i++) {
					self._thumbnailsArr[i].style.top = imgCenetrCoords[i].y - 30 + 'px';
					self._thumbnailsArr[i].style.left = imgCenetrCoords[i].x - 30 + 'px';
				}
			},
			self._thumbnailAnimationDuration,
			function() {
				delete self._currentThumbAnimation;

				// switch start and target angle on circle
				var temp = startAngle;
				startAngle = endAngle;
				endAngle = temp;

				// if timer for loop is already set then cencel it
				if (self._animationTimer) {
					clearTimeout(self._animationTimer);
				}

				// set timer to continue loop
				self._animationTimer = setTimeout(function() {
					delete self._animationTimer;
					// start new animation
					animateThumbnails();
				}, self._thumbnailAnimationDelay);
			}
		);
	}

	// if timer for loop is already set then cencel it
	if (this._animationTimer) {
		clearTimeout(this._animationTimer);
	}

	// set timer to start loop
	this._animationTimer = setTimeout(function() {
		delete self._animationTimer;
		// start new animation
		animateThumbnails();
	}, this._thumbnailAnimationDelay);
};

// Invoked by click event
// Arguments:
//	1. e (required) - event object
TeacherBlockController.prototype._onClick = function(e) {
	var target = e.target;

	// check if click was on thumbnail
	this._onThumbnailClick(target);
};

// Invoked by resize event on window
TeacherBlockController.prototype._onResize = function() {
	if (!this._svgElem) return;

	// recalculate and reset positions for all elements
	this._setInitState();
	this._animateThumbnails();
};

// Try exporting class via webpack
try {
	module.exports = TeacherBlockController;
} catch (e) {
	console.log(e);
}
