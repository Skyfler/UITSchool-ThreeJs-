"use strict";

var Helper = require('./helper');
var Animation = require('./animation');

function TeacherBlockController(options) {
	options.name = options.name || 'TeacherBlockController';
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

	this._onResize = this._onResize.bind(this);
	this._onClick = this._onClick.bind(this);

	this._init();
}

TeacherBlockController.prototype = Object.create(Helper.prototype);
TeacherBlockController.prototype.constructor = TeacherBlockController;

TeacherBlockController.prototype._init = function() {
	this._svgElem = this._elem.querySelector(this._svgElemSelector);
	if (!this._svgElem) return;

	this._handleTemplates();
	this._getThumbnails();

	this._setInitState();

	this._addListener(this._elem, 'click', this._onClick);
	this._addListener(window, 'resize', this._onResize);
};

TeacherBlockController.prototype._setInitState = function() {
	this._checkMode();
	this._setSvgElemHeight();
	this._calculateBasicValues();
	this._calculateStylesForHtmlElems();
	this._setStylesForHtmlElems();
	this._draw();
};

TeacherBlockController.prototype._handleTemplates = function() {
	this._templates = this._elem.querySelectorAll('.temp_teacher_data');
	if (this._templates.length === 0) return;

	for (var i = 0; i < this._templates.length; i++) {
		this._templates[i].dataset.templateId = i + 1;
	}

	this._setActiveTemplate(this._templates[0]);
};

TeacherBlockController.prototype._setActiveTemplate = function(template) {
	this._insertTemplData(template);
	this._createThumbnails(template);
};

TeacherBlockController.prototype._insertTemplData = function(templateElem) {
	var elemsToPlaceData = this._elem.querySelectorAll('[data-template-target]'),
		targetSelector,
		targetElem,
		dataToInsert,
		attributeToChange;

	for (var i = 0; i < elemsToPlaceData.length; i++) {
		if (elemsToPlaceData[i].tagName === 'IMG') {
			attributeToChange = 'src';
		} else {
			attributeToChange = 'innerHTML';
		}

		dataToInsert = '';

		targetSelector = elemsToPlaceData[i].dataset.templateTarget;
		if (targetSelector) {

			targetElem = templateElem.content.querySelector(targetSelector);
			if (targetElem) {

				if (attributeToChange === 'src') {
					dataToInsert = targetElem.getAttribute(attributeToChange);

				} else {
					dataToInsert = targetElem[attributeToChange];

				}
			}
		}

		elemsToPlaceData[i][attributeToChange] = dataToInsert;
	}
};

TeacherBlockController.prototype._createThumbnails = function(curTemplateElem) {
	var thumbnailsContainer = this._elem.querySelector('.thumbnails');
	if (!thumbnailsContainer) return;

	var thumbnailsHtml = '',
		thumbnailSrcElem,
		src,
		templateId;

	for (var i = 0; i < this._templates.length; i++) {
		src = '';

		if (this._templates[i] === curTemplateElem) continue;

		thumbnailSrcElem = this._templates[i].content.querySelector('[data-thumbnail]');
		if (!thumbnailSrcElem) continue;

		src = thumbnailSrcElem.getAttribute('src');
		if (!src) continue;

		templateId = this._templates[i].dataset.templateId;

		thumbnailsHtml += '<img src="' + src + '" alt="" class="thumbnail" data-target-template-id="' + templateId + '">';
	}

	thumbnailsContainer.innerHTML = thumbnailsHtml;
};

TeacherBlockController.prototype._onThumbnailClick = function(target) {
	var targetTemplateId = target.dataset.targetTemplateId;
	if (!targetTemplateId) return;

	for (var i = 0, targetTemplate; i < this._templates.length && !targetTemplate; i++) {
		if (this._templates[i].dataset.templateId === targetTemplateId) {
			targetTemplate = this._templates[i];
		}
	}

	if (!targetTemplate) return;

	this._setActiveTemplate(targetTemplate);
	this._getThumbnails();

	this._setInitState();
}

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
//		height = this._circleBlock.elem.offsetWidth + this._firstBlock.elem.offsetHeight + 30 + 10 +
//			(this._secondBlock.elem.offsetHeight > this._thirdBlock.elem.offsetHeight ? this._secondBlock.elem.offsetHeight : this._thirdBlock.elem.offsetHeight);
		height = this._circleBlock.elem.offsetWidth;

	} else if (this._checkScreenWidth(0, 349)) {
		height = this._circleBlock.elem.offsetWidth;

	}

	this._svgElem.style.height = height  + 'px';
};

TeacherBlockController.prototype._getThumbnails = function() {
	this._thumbnailsArr = this._elem.querySelectorAll('.thumbnail');
};

TeacherBlockController.prototype._calculateBasicValues = function() {
	this._xLeftCoord = 0;
	this._xRightCoord = this._svgElem.getBoundingClientRect().width;
	this._yTopCoord = 0;
	this._yBottomCoord = this._svgElem.getBoundingClientRect().height;

	this._xCenterCoord = (this._xRightCoord - this._xLeftCoord) / 2 + this._xLeftCoord;
	this._yCenterCoord = (this._yBottomCoord - this._yTopCoord) / 2 + this._yTopCoord;
};

TeacherBlockController.prototype._draw = function() {
	var svgHtml = '';
	svgHtml += this._createCentrallCircle();
	svgHtml += this._createLinkLines();

	var pointCoords;
//	for (var i = 0; i <= 360; i += 10) {
//		pointCoords = this._calculatePointOnCircleCoordinates(this._circleBlock.left + this._circleBlock.radius, this._circleBlock.top + this._circleBlock.radius, this._circleBlock.radius, i);
//		svgHtml += '<circle class="test_circle" stroke="red" fill="transparent" data-angle="' + i + '"' +
//		' cx="' + pointCoords.x + '" cy="' + pointCoords.y + '" r="' + 5 + '"' +
//		'></circle>';
//	}

	this._svgElem.innerHTML = svgHtml;
};

TeacherBlockController.prototype._calculatePointOnCircleCoordinates = function(centerCircleXCoordinate, centerCircleYCoordinate, circleRadius, angleDegs) {
	var angleRads = angleDegs * (Math.PI/180);
	var x = centerCircleXCoordinate + circleRadius * Math.sin(angleRads);
	var y = centerCircleYCoordinate + circleRadius * Math.cos(angleRads);

	return {
		x: x,
		y: y
	};
};

TeacherBlockController.prototype._createCentrallCircle = function() {
	var radius = this._circleBlock.radius;
	var circleHtml = '<circle class="centrall_circle"' +
		' cx="' + (this._circleBlock.left + radius) + '" cy="' + (this._circleBlock.top + radius) + '" r="' + radius + '"' +
		'></circle>';
	return circleHtml;
};

TeacherBlockController.prototype._createLinkLines = function() {
	var html = '';

	if (this._mode === 'xs-screen' && this._checkScreenWidth(350)) {
//		html += this._createLinkLine(this._firstBlock, 'top-right', 320);
//		html += this._createLinkLine(this._secondBlock, 'bottom-right', 190);
//		html += this._createLinkLine(this._thirdBlock, 'bottom-left', 170);

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

TeacherBlockController.prototype._createLinkLine = function(blockElem, blockCorner, circlePointAngle) {
	var widthMultiplier,
		heightMultiplier;

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

	var circlePointCoords = this._calculatePointOnCircleCoordinates(this._circleBlock.left + this._circleBlock.radius, this._circleBlock.top + this._circleBlock.radius, this._circleBlock.radius, circlePointAngle);

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

TeacherBlockController.prototype._calculateStylesForHtmlElems = function() {
	this._calculateStylesForCircleElem();
	this._calculateStylesForFirstBlockElem();
	this._calculateStylesForSecondBlockElem();
	this._calculateStylesForThirdBlockElem();
};

TeacherBlockController.prototype._calculateStylesForCircleElem = function() {
	if (!this._circleBlock.elem) return;

	this._circleBlock.width = this._circleBlock.elem.offsetWidth;
	this._circleBlock.height = this._circleBlock.width;
	this._circleBlock.radius = this._circleBlock.width / 2;
	this._circleBlock.left = this._xCenterCoord - this._circleBlock.radius;

	if (this._checkScreenWidth(0, 349)) {
		this._circleBlock.top = 0;

	} else if (this._mode === 'xs-screen') {
//		this._circleBlock.top = this._secondBlock.elem.offsetHeight > this._thirdBlock.elem.offsetHeight ? this._secondBlock.elem.offsetHeight : this._thirdBlock.elem.offsetHeight + 10;
		this._circleBlock.top = 0;

	} else if (this._mode === 'sm-screen') {
		this._circleBlock.top = 0;

	} else if (this._mode === 'md-screen') {
		this._circleBlock.top = 0;

	} else if (this._mode === 'lg-screen') {
		this._circleBlock.top = this._yCenterCoord - this._circleBlock.radius;

	}
};

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

TeacherBlockController.prototype._calculateStylesForThirdBlockElem = function() {
	if (!this._thirdBlock.elem) return;

	this._thirdBlock.titleElem = this._thirdBlock.elem.querySelector('.title');

	if (this._checkScreenWidth(0, 349)) {
		this._thirdBlock.top = 0;
		this._thirdBlock.left = 0;

	} else if (this._mode === 'xs-screen') {
		this._thirdBlock.top = 0;
//		this._thirdBlock.left = this._elem.offsetWidth - this._thirdBlock.elem.offsetWidth;
		this._thirdBlock.left = 0;

	} else if (this._mode === 'sm-screen' || this._mode === 'md-screen') {
		this._thirdBlock.top = this._circleBlock.top;
		this._thirdBlock.left = this._elem.offsetWidth - this._thirdBlock.elem.offsetWidth;

	} else if (this._mode === 'lg-screen') {
		this._thirdBlock.top = this._yCenterCoord + 60;
		this._thirdBlock.left = this._circleBlock.left + this._circleBlock.width + 120;

	}
};

TeacherBlockController.prototype._setStylesForHtmlElems = function() {
	this._setStylesForCircleElem();
	this._setStylesForFirstElem();
	this._setStylesForSecondElem();
	this._setStylesForThirdElem();
	this._setStylesForThumbnails();
};

TeacherBlockController.prototype._setPageScrollArea = function(elem) {
	if (elem.scrollHeight > elem.offsetHeight && !elem.dataset.noPageScrollArea) {
		elem.dataset.noPageScrollArea = true;
	} else if (elem.scrollHeight === elem.offsetHeight && elem.dataset.noPageScrollArea === "true") {
		elem.removeAttribute('data-no-page-scroll-area');
	}

	elem.scrollTop = 0;
};

TeacherBlockController.prototype._setStylesForCircleElem = function() {
	if (!this._circleBlock.elem) return;

	this._circleBlock.elem.style.height = this._circleBlock.height + 'px';
	this._circleBlock.elem.style.top = this._circleBlock.top + 'px';
	this._circleBlock.elem.style.left = this._circleBlock.left + 'px';
};

TeacherBlockController.prototype._setStylesForFirstElem = function() {
	if (!this._firstBlock.elem) return;

	this._firstBlock.elem.style.width = this._firstBlock.width + 'px';
	this._firstBlock.elem.style.top = this._firstBlock.top + 'px';
	this._firstBlock.elem.style.left = this._firstBlock.left + 'px';

	this._setPageScrollArea(this._firstBlock.elem.querySelector('.description'));
};

TeacherBlockController.prototype._setStylesForSecondElem = function() {
	if (!this._secondBlock.elem) return;

	this._secondBlock.elem.style.top = this._secondBlock.top + 'px';
	this._secondBlock.elem.style.left = this._secondBlock.left + 'px';

	this._setPageScrollArea(this._secondBlock.elem.querySelector('.skill_list'));
};

TeacherBlockController.prototype._setStylesForThirdElem = function() {
	if (!this._thirdBlock.elem) return;

	this._thirdBlock.elem.style.top = this._thirdBlock.top + 'px';
	this._thirdBlock.elem.style.left = this._thirdBlock.left + 'px';

	this._setPageScrollArea(this._thirdBlock.elem.querySelector('.description'));
};

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

	this._animatingThumbnails();
};

TeacherBlockController.prototype._animatingThumbnails = function() {
	if (this._currentAnimation) {
		this._currentAnimation.stop();
		delete this._currentAnimation;
	}
	var self = this;
	var startAngle = this._thumbnailStartAngle;
	var endAngle = this._thumbnailEndAngle;

	function animatingThumbnails() {
		self._currentAnimation = new Animation(
			function(timePassed){
				var timeMultiplier = Animation.quadEaseInOut(self._thumbnailAnimationDuration, timePassed);
				var curAngle = startAngle + ((endAngle - startAngle) * (timeMultiplier));
				var imgCenetrCoords = [];

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
				delete self._currentAnimation;

				var temp = startAngle;
				startAngle = endAngle;
				endAngle = temp;

				if (self._animationTimer) {
					clearTimeout(self._animationTimer);
				}

				self._animationTimer = setTimeout(function() {
					delete self._animationTimer;
					animatingThumbnails();
				}, self._thumbnailAnimationDelay);
//				animatingThumbnails();
			}
		);
	}

	if (this._animationTimer) {
		clearTimeout(this._animationTimer);
	}

	this._animationTimer = setTimeout(function() {
		delete self._animationTimer;
		animatingThumbnails();
	}, this._thumbnailAnimationDelay);
//	animatingThumbnails();
};

TeacherBlockController.prototype._onClick = function(e) {
	var target = e.target;

	this._onThumbnailClick(target);
};

TeacherBlockController.prototype._onResize = function() {
	if (!this._svgElem) return;

	this._setInitState();
};

module.exports = TeacherBlockController;
