"use strict";

try {
	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function SvgGraph(options) {
	options.name = options.name || 'SvgGraph';
	Helper.call(this, options);

	this._elem = options.elem;
	this._container = options.container;
	this._xLabelsPrefix = options.xLabelsPrefix || '';
	this._xLabelsSuffix = options.xLabelsSuffix || '';
	this._yLabelsPrefix = options.yLabelsPrefix || '';
	this._yLabelsSuffix = options.yLabelsSuffix || '';
	this._titleLabelsPrefix = options.titleLabelsPrefix || '';
	this._titleLabelsSuffix = options.titleLabelsSuffix || '';
	this._animationDuration = options.animationDuration || 500;

	this._onResize = this._onResize.bind(this);
	this._onMouseOut = this._onMouseOut.bind(this);
	this._onMouseMove = this._onMouseMove.bind(this);

	this._init();
}

SvgGraph.prototype = Object.create(Helper.prototype);
SvgGraph.prototype.constructor = SvgGraph;

SvgGraph.prototype._init = function() {
	this._graphContainer = this._elem.querySelector('.graph_container');

	this._graphs = {};
	this._readGraphData();

	this._drawGraph();
	this._getGraphElements();
	this._addListener(window, 'resize', this._onResize);
//	this._addListener(this._elem, 'mouseover', this._onMouseOver);
//	this._addListener(this._elem, 'touchstart', this._onMouseOver);
	this._addListener(this._elem, 'mouseout', this._onMouseOut);
	this._addListener(this._elem, 'touchend', this._onMouseOut);
	this._addListener(this._elem, 'touchstart', this._onMouseMove);
	this._addListener(this._elem, 'mousemove', this._onMouseMove);
	this._addListener(this._elem, 'touchmove', this._onMouseMove);
};

SvgGraph.prototype._readGraphData = function() {
	var graphTemplates = this._elem.querySelectorAll('.graph_data');

	for (var i = 0, id; i < graphTemplates.length; i++) {
		id = graphTemplates[i].getAttribute('id') || ('graph_' + i);
		this._graphs[id] = this._readGraphDataTemplate(graphTemplates[i]);
	}
};

SvgGraph.prototype._readGraphDataTemplate = function(templateElem) {
	return JSON.parse(templateElem.innerHTML);
};

SvgGraph.prototype._drawGraph = function() {
	this._calculateValueCoordinates();

	var html = '';
	var labelsObj = this._createLabels();
	html += labelsObj.labelRectsHtml;
	for (var i = 0; i < this._pathsCoords.length; i++) {
		html += this._createPath(this._pathsCoords[i], this._graphNames[i]);
	}

	html += labelsObj.labelsHtml;
	html += this._createIndicator();

	this._graphContainer.innerHTML = html;
};

SvgGraph.prototype._calculateValueCoordinates = function() {
	this._setStartingEndingMinMaxValues();
	this._calculateValPerPx();

	this._pathsCoords = [];
	this._graphNames = [];
	var i = 0;
	for (var prop in this._graphs) {
		this._pathsCoords[i] = this._calculatePathCoords(this._graphs[prop]);
		this._graphNames[i] = prop;
		i++;
	}
};

SvgGraph.prototype._setStartingEndingMinMaxValues = function() {
	if (!this._graphs || Object.keys(this._graphs).length === 0) return;

	var maxX,
		maxY,
		minX;

	var graph;
	for (var prop in this._graphs) {
		graph = this._graphs[prop];

		for (var i = 0; i < graph.length; i++) {
			if (!maxX ||graph[i].x > maxX) {
				maxX = graph[i].x;
			}
			if (!maxY || graph[i].maxY > maxY) {
				maxY = graph[i].maxY;
			}
			if (!minX || graph[i].x < minX) {
				minX = graph[i].x;
			}
		}
	}

	this._startingXValue = minX;
	this._startingYValue = 0;

	var svgBox = this._elem.getBoundingClientRect();

	this._startingXValueCoordinate = 0;
	this._startingYValueCoordinate = svgBox.height;
	this._endingXValueCoordinate = svgBox.width;
	this._endingYValueCoordinate = 0;

	this._startingGraphLabelXValueCoordinate = this._startingXValueCoordinate + 30;
	this._startingGraphLabelYValueCoordinate = this._startingYValueCoordinate - 25;

	this._startingGraphLabelLineXValueCoordinate = this._startingXValueCoordinate + 60;
	this._endingGraphLabelLineXValueCoordinate = this._endingXValueCoordinate;

	this._startingGraphPathXValueCoordinate = {
		val: this._startingXValue,
		xCoord: this._startingXValueCoordinate + 75
	};
	this._startingGraphPathYValueCoordinate = {
		val: this._startingYValue,
		yCoord: this._startingYValueCoordinate - 50
	};
	this._endingGraphPathXValueCoordinate = {
		val: maxX,
		xCoord: this._endingXValueCoordinate - 25
	};
	this._endingGraphPathYValueCoordinate = {
		val: maxY,
		yCoord: this._endingYValueCoordinate + 50
	};
};

SvgGraph.prototype._calculateValPerPx = function() {
	this._valXPerPx = (this._endingGraphPathXValueCoordinate.xCoord - this._startingGraphPathXValueCoordinate.xCoord) / (this._endingGraphPathXValueCoordinate.val - this._startingGraphPathXValueCoordinate.val);
	this._valYPerPx = (this._endingGraphPathYValueCoordinate.yCoord - this._startingGraphPathYValueCoordinate.yCoord) / (this._endingGraphPathYValueCoordinate.val - this._startingGraphPathYValueCoordinate.val);
};

SvgGraph.prototype._calculatePathCoords = function(graphPointsArr) {
	var pointCoordinates = [],
		x,
		minY,
		maxY,
		y;

	for (var i = 0; i < graphPointsArr.length; i++) {
		x = graphPointsArr[i].x;
		minY = graphPointsArr[i].minY;
		maxY = graphPointsArr[i].maxY;

		y = ((maxY - minY) / 2) + minY;

		pointCoordinates[i] = {
			xCoord: this._startingGraphPathXValueCoordinate.xCoord +
			(x - this._startingGraphPathXValueCoordinate.val) * this._valXPerPx,
			yCoord: this._startingGraphPathYValueCoordinate.yCoord +
			(y - this._startingGraphPathYValueCoordinate.val) * this._valYPerPx,
			yMinCoord: this._startingGraphPathYValueCoordinate.yCoord +
			(minY - this._startingGraphPathYValueCoordinate.val) * this._valYPerPx,
			yMaxCoord: this._startingGraphPathYValueCoordinate.yCoord +
			(maxY - this._startingGraphPathYValueCoordinate.val) * this._valYPerPx,
			xValue: x,
			yValue: y,
			yMinValue: minY,
			yMaxValue: maxY
		}
	}

	return pointCoordinates;
};

SvgGraph.prototype._getGraphElements = function() {
	this._indicator = this._elem.querySelector('.indicator');
	this._indicatorDot = this._elem.querySelector('.indicator_dot');
	this._indicatorLine = this._elem.querySelector('.indicator_line');
	this._indicatorLabel = this._elem.querySelector('.indicator_label');
	this._graphPathElemsArr = this._elem.querySelectorAll('.graph_path');
};

SvgGraph.prototype._removeGraphElements = function() {
	this._indicatorDot = '';
	this._indicatorLine = '';
	this._indicatorLabel = '';
	this._graphPathElemsArr = [];
};

SvgGraph.prototype._onMouseOut = function(e) {
//	console.log(this.NAME + '. Func: onMouseOut. Event: ' + e.type);
	var target = e.target;
	if (!target) return;

	var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX,
		clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;

	var pathNameIndex = this._findPathByMousePosition(clientX, clientY);
	if (pathNameIndex) return;

	this._setIndicatorPosition(false);
}

SvgGraph.prototype._onMouseMove = function(e) {
//	console.log(this.NAME + '. Func: onMouseMove. Event: ' + e.type);
	var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX,
		clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;

	var pathNameIndex = this._findPathByMousePosition(clientX, clientY);
	if (!pathNameIndex) return;

	var pointIndex = this._findPointIndexByMousePosition(clientX, pathNameIndex);

	this._setIndicatorPosition(pathNameIndex, pointIndex);
};

SvgGraph.prototype._findPathByMousePosition = function(clientX, clientY) {
	var target = true,
		pathNameIndex,
		hiddenElemsArr = [],
		docElemScroll = document.documentElement.scrollTop,
		docBodyScroll = document.body.scrollTop;

	while (target && target !== this._elem && target !== document.body && target !== document.documentElement && !pathNameIndex) {
		target = document.elementFromPoint(clientX, clientY);
//		console.log({
//			log: this.NAME + ': while loop',
//			target: target
//		});
		if (!this._elem.contains(target)) {
			target = false;
		}
		if (!target) continue;

		pathNameIndex = this._findPathNameIndex(target);

		if (!pathNameIndex) {
			hiddenElemsArr.push(target);
			target.style.display = 'none';
		}
	}

	for (var i = 0; i < hiddenElemsArr.length; i++) {
		hiddenElemsArr[i].style.display = '';
	}

//	document.documentElement.scrollTop = docElemScroll,
//	document.body.scrollTop = docBodyScroll;

	return pathNameIndex;
}

SvgGraph.prototype._findPointIndexByMousePosition = function(mouseX, pathNameIndex) {

	var pathXPosition = mouseX - this._elem.getBoundingClientRect().left,
		pathCoords = this._pathsCoords[pathNameIndex.index],
		closestMin,
		closestMax,
		closestMinI,
		closestMaxI;
	for (var i = 0; i < pathCoords.length; i++) {
		if (pathCoords[i].xCoord <= pathXPosition &&
			(closestMin === undefined || pathCoords[i].xCoord > closestMin)) {
			closestMin = pathCoords[i].xCoord;
			closestMinI = i;
		}
		if (pathCoords[i].xCoord >= pathXPosition &&
			(closestMax === undefined || pathCoords[i].xCoord < closestMax)) {
			closestMax = pathCoords[i].xCoord;
			closestMaxI = i;
		}
	}

	var closestMinDelta = pathXPosition - closestMin,
		closestMaxDelta = closestMax - pathXPosition;

	return closestMinDelta < closestMaxDelta ? closestMinI : closestMaxI;
};

SvgGraph.prototype._findPathNameIndex = function(target) {
	for (var i = 0; i < this._graphNames.length; i++) {
		if (target.classList.contains(this._graphNames[i])) {
			return {
				name: this._graphNames[i],
				index: i
			}
		}
	}

	return false;
};

SvgGraph.prototype._setIndicatorPosition = function(pathNameIndex, pathPointIndex) {
//	console.log(this.NAME + ': setIndicatorPosition');
	pathPointIndex = pathPointIndex ? pathPointIndex : 0;

	var x, y, value1, value2, noAnimation;
	if (pathNameIndex) {
		if (this._indicatorHidden) {
			this._indicatorHidden = false;
			noAnimation = true;
		}
		x = this._pathsCoords[pathNameIndex.index][pathPointIndex].xCoord;
		y = this._pathsCoords[pathNameIndex.index][pathPointIndex].yCoord;
		value1 = this._pathsCoords[pathNameIndex.index][pathPointIndex].yValue;
		value2 = this._pathsCoords[pathNameIndex.index][pathPointIndex].xValue;
		this._indicator.style.display = 'block';
	} else {
		x = this._indicatorDotInitCorrdinates.x;
		y = this._indicatorDotInitCorrdinates.y;
		value1 = '';
		value2 = '';
		this._indicator.style.display = '';
		this._indicatorHidden = true;
	}

	if (this._indicatorDotCurrentCorrdinates.x !== x || this._indicatorDotCurrentCorrdinates.y !== y) {
		for (var i = 0; i < this._graphNames.length; i++) {
			if (this._indicator.classList.contains(this._graphNames[i])) {
				this._indicator.classList.remove(this._graphNames[i]);
			}
		}
		if (pathNameIndex) {
			this._indicator.classList.add(this._graphNames[pathNameIndex.index]);
		}

		this._moveIndicator(x, y, value1, value2, noAnimation);
	}
};

SvgGraph.prototype._createPath = function(pathCoords, titleClass) {
	var svgPath = '<path class="graph_path';
	if (titleClass) {
		svgPath += ' ' + titleClass;
	}
	svgPath += '" d="M';

	var startChart = this._startingGraphPathXValueCoordinate.xCoord + ',' + this._startingGraphPathYValueCoordinate.yCoord;
	var endChart = this._endingGraphPathXValueCoordinate.xCoord + ',' + this._startingGraphPathYValueCoordinate.yCoord;

	svgPath += ' ' + startChart;

	svgPath += ' ' + pathCoords[0].xCoord + ',' + pathCoords[0].yCoord;
	var x1, y1, x2, y2, x, y;
	for (var i = 1; i < pathCoords.length; i++) {
		x1 = (pathCoords[i].xCoord + pathCoords[i-1].xCoord) / 2;
		y1 = pathCoords[i-1].yCoord;
		x2 = (pathCoords[i].xCoord + pathCoords[i-1].xCoord) / 2;
		y2 = pathCoords[i].yCoord;
		x = pathCoords[i].xCoord;
		y = pathCoords[i].yCoord;

		svgPath += ' C ' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x + ',' + y;
	}

	svgPath += ' L ' + endChart;
	svgPath += ' z" />';
	return svgPath;
};

SvgGraph.prototype._onResize = function() {
	this._removeGraphElements();
	this._drawGraph();
	this._getGraphElements();
};

SvgGraph.prototype._createIndicator = function() {
	this._indicatorDotInitCorrdinates = this._indicatorDotCurrentCorrdinates = {
		x: 0,
		y: 0
	};
	this._indicatorLineOffsetCoordinates = {
		x1: 0,
		y1: 0,
		x2: 0,
		y2: -100
	}
	this._indicatorLabelOffsetCoordinates = {
		x: 6,
		y: -108,
	};

	var ballRadius = this._checkScreenWidth() === 'xs' ? 7 : 10;

	var indicatorBallHtml = '<circle' +
		' cx="' + this._indicatorDotInitCorrdinates.x + '" cy="' + this._indicatorDotInitCorrdinates.y + '"' +
		' r="' +  ballRadius + '" class="indicator_dot"></circle>';
	var indicatorLineHtml = '<line' +
		' x1="' + (this._indicatorDotInitCorrdinates.x + this._indicatorLineOffsetCoordinates.x1) + '" y1="' + (this._indicatorDotInitCorrdinates.y + this._indicatorLineOffsetCoordinates.y1) + '"' +
		' x2="' + (this._indicatorDotInitCorrdinates.x + this._indicatorLineOffsetCoordinates.x2) + '" y2="' + (this._indicatorDotInitCorrdinates.y + this._indicatorLineOffsetCoordinates.y2) + '"' +
		' class="indicator_line"/>';
	var indicatorTextHtml = '<text class="indicator_label" text-anchor="start" dominant-baseline="hanging"' +
		' x="' + (this._indicatorDotInitCorrdinates.x + this._indicatorLabelOffsetCoordinates.x) + '" y="' + (this._indicatorDotInitCorrdinates.y + this._indicatorLabelOffsetCoordinates.y) + '"' +
		'>' + this._createLabelContents('1700', '2016', this._indicatorLabelOffsetCoordinates.x) + '</text>';

	return '<g class="indicator" transform="translate(0, 0)" style="cursor:default;pointer-events:none;white-space:nowrap;">' + indicatorLineHtml + indicatorTextHtml + indicatorBallHtml + '</g>';
};

SvgGraph.prototype._createLabelContents = function(firstLineText, secondLineText, xOffset) {
	var secondLineYPosition = this._checkScreenWidth() === 'xs' ? 28 : 38;

	var text = '<tspan class="first_line" x="' + xOffset + '" dy="0">$' + firstLineText + '</tspan>' +
		'<tspan class="second_line" x="' + xOffset + '" dy="' + secondLineYPosition + '">Year ' + secondLineText + '</tspan>';
	return text;
};

SvgGraph.prototype._moveIndicator = function(dotCoordinateX, dotCoordinateY, firstLineText, secondLineText, noAnimation) {
//	console.log(this.NAME + ': moveIndicator');
//	var test = document.querySelector('#test');

	var self = this;
	function checkAndReSetIndicatorPosition() {
		var textBoundingClientTRect = self._indicatorLabel.getBoundingClientRect();
		if (textBoundingClientTRect.right > self._container.getBoundingClientRect().right) {
			self._indicatorLabel.innerHTML = self._createLabelContents(firstLineText, secondLineText, -textBoundingClientTRect.width - self._indicatorLabelOffsetCoordinates.x);
		}
	}

	this._indicatorDotCurrentCorrdinates = {
		x: dotCoordinateX,
		y: dotCoordinateY
	};

	var startVal = {
		x: this._indicator.transform.baseVal.getItem(0).matrix.e,
		y: this._indicator.transform.baseVal.getItem(0).matrix.f
	};
//	var indicatorTransformMatrixArr = getComputedStyle(this._indicator).transform.match(/\((.*)\)/)[1].split(', ');
//	var startVal = {
//		x: parseFloat(indicatorTransformMatrixArr[4]),
//		y: parseFloat(indicatorTransformMatrixArr[5])
//	};

	var translateX = 0 - this._indicatorDotInitCorrdinates.x + this._indicatorDotCurrentCorrdinates.x;
	var translateY = 0 - this._indicatorDotInitCorrdinates.y + this._indicatorDotCurrentCorrdinates.y;
//	this._indicator.setAttribute('transform', 'translate(' + translateX + ',' + translateY + ')');

	this._indicatorLabel.innerHTML = this._createLabelContents(firstLineText, secondLineText, this._indicatorLabelOffsetCoordinates.x);
	checkAndReSetIndicatorPosition();

	if (this._indicatorAnimation) {
		this._indicatorAnimation.stop();
	}

	if (noAnimation) {
		delete this._indicatorAnimation;

//		this._iosSvgStyleBugFix(translateX, translateY);
//		if (test) {
//			test.innerHTML = 'translateX: ' + translateX + '<br>translateY: ' + translateY;
//		}
		this._indicator.setAttribute('transform', 'translate(' + translateX + ', ' + translateY + ')');
//		this._setVendorCss(this._indicator, 'transform', 'translate(' + translateX + 'px, ' + translateY + 'px)');

		checkAndReSetIndicatorPosition();
	} else {
		this._indicatorAnimation = new Animation(
			function(timePassed){
				var timeMultiplier = Animation.quadEaseInOut(this._animationDuration, timePassed);
				var curX = startVal.x + ((translateX - startVal.x) * (timeMultiplier));
				var curY = startVal.y + ((translateY - startVal.y) * (timeMultiplier));

//				this._iosSvgStyleBugFix(curX, curY);
//				if (test) {
//					test.innerHTML = 'translateX: ' + translateX + '<br>translateY: ' + translateY;
//				}
				this._indicator.setAttribute('transform', 'translate(' + curX + ', ' + curY + ')');
//				this._setVendorCss(this._indicator, 'transform', 'translate(' + curX + 'px, ' + curY + 'px)');
			}.bind(this),
			this._animationDuration,
			function() {
				delete this._indicatorAnimation;

				this._indicatorLabel.innerHTML = this._createLabelContents(firstLineText, secondLineText, this._indicatorLabelOffsetCoordinates.x);
				checkAndReSetIndicatorPosition();
			}.bind(this)
		);

	}

};

//SvgGraph.prototype._iosSvgStyleBugFix = function(translateX, translateY) {
//	if (!this._iosBugFixStyleElem) {
//		this._iosBugFixStyleElem = document.createElement('style');
//		this._elem.appendChild(this._iosBugFixStyleElem);
//	}
//
//	this._iosBugFixStyleElem.innerHTML = '.course_statistic .indicator {' +
//			'-webkit-transform: translate(' + translateX + 'px ,' + translateY +'px)!important;' +
//			'-ms-transform: translate(' + translateX + 'px,' + translateY +'px)!important;' +
//			'-o-transform: translate(' + translateX + 'px,' + translateY +'px)!important;' +
//			'transform: translate(' + translateX + 'px,' + translateY +'px)!important;' +
//		'}';
//}

SvgGraph.prototype._createLabels = function() {
	var labelsHtml = '',
		labelRectsHtml = '';

	var labelsValsCoordsArrObj = this._calculateLabelsCoordinates();

	labelsHtml += this._createVerticalLabels(labelsValsCoordsArrObj.varticalLabelsArr);
	labelsHtml += this._createHorizontalLabels(labelsValsCoordsArrObj.horizontalLabelsArr);
	labelsHtml += this._createTitleLabels(labelsValsCoordsArrObj.titleLabelsArr);
	labelRectsHtml += this._createLabelRects(labelsValsCoordsArrObj.labelRectsArr);

	return {
		labelsHtml: labelsHtml,
		labelRectsHtml: labelRectsHtml
	};
};

SvgGraph.prototype._calculateLabelsCoordinates = function() {
	var varticalLabelsArr = [],
		horizontalLabelsArr = [],
		titleLabelsArr = [],
		labelRectsArr = [],
		pathCoords,
//		pathXTopVal,
		pathYTopVal,
//		pathXLowestVal,
		pathYLowestVal;

	function findInLabelsCoordinatesArr(labelsCoordinatesArr, labelVal) {
		for (var i = 0; i < labelsCoordinatesArr.length; i++) {
			if (labelsCoordinatesArr[i].value === labelVal) return true;
		}
		return false;
	}

	for (var j = 0; j < this._pathsCoords.length; j++) {
		pathCoords = this._pathsCoords[j];
//		pathXTopVal = undefined;
		pathYTopVal = undefined;
//		pathXLowestVal = undefined;
		pathYLowestVal = undefined;

		for (var i = 0; i < pathCoords.length; i++) {
			if (pathYTopVal === undefined || pathYTopVal.value < pathCoords[i].yMaxValue) {
				pathYTopVal = {
					value: pathCoords[i].yMaxValue,
					xCoord: this._startingGraphLabelXValueCoordinate,
					yCoord: pathCoords[i].yMaxCoord
				};
			}
			if (pathYLowestVal === undefined || pathYLowestVal.value > pathCoords[i].yMinValue) {
				pathYLowestVal = {
					value: pathCoords[i].yMinValue,
					xCoord: this._startingGraphLabelXValueCoordinate,
					yCoord: pathCoords[i].yMinCoord
				};
			}

			if (!findInLabelsCoordinatesArr(horizontalLabelsArr, pathCoords[i].xValue)) {
				horizontalLabelsArr.push({
					value: pathCoords[i].xValue,
					xCoord: pathCoords[i].xCoord,
					yCoord: this._startingGraphLabelYValueCoordinate
				});
			}
		}

		labelRectsArr.push({
			y1: pathYLowestVal,
			y2: pathYTopVal
		});

		if (!findInLabelsCoordinatesArr(varticalLabelsArr, pathYLowestVal.value)) {
			varticalLabelsArr.push(pathYLowestVal);
		}
		if (!findInLabelsCoordinatesArr(varticalLabelsArr, pathYTopVal.value)) {
			varticalLabelsArr.push(pathYTopVal);
		}

		titleLabelsArr.push({
			value: this._graphNames[j],
			xCoord: (this._endingGraphPathXValueCoordinate.xCoord - this._startingGraphPathXValueCoordinate.xCoord) / 2 + this._startingGraphPathXValueCoordinate.xCoord,
			yCoord: (pathYTopVal.yCoord - pathYLowestVal.yCoord) / 2 + pathYLowestVal.yCoord
		});
	}

	return {
		varticalLabelsArr: varticalLabelsArr,
		horizontalLabelsArr: horizontalLabelsArr,
		titleLabelsArr: titleLabelsArr,
		labelRectsArr: labelRectsArr
	}
};

SvgGraph.prototype._createVerticalLabels = function(verticalLabelsValCoordsArr) {
	var labelHtml = '',
		lineHtml = '',
		labelsHtml = '',
		linesHtml = '';

	for (var i = 0; i < verticalLabelsValCoordsArr.length; i++) {
		labelHtml = '<text' +
			' class="graph_label vertical_label" text-anchor="middle" dominant-baseline="central"' +
			' x="' + verticalLabelsValCoordsArr[i].xCoord + '" y="' + verticalLabelsValCoordsArr[i].yCoord + '">' +
			this._yLabelsPrefix + verticalLabelsValCoordsArr[i].value + this._yLabelsSuffix +
			'</text>';

		lineHtml = '<line class="vertical_label_line"' +
			' x1="' + this._startingGraphLabelLineXValueCoordinate + '" y1="' + verticalLabelsValCoordsArr[i].yCoord + '"' +
			' x2="' + this._endingGraphLabelLineXValueCoordinate + '" y2="' + verticalLabelsValCoordsArr[i].yCoord + '"' +
			'/>';

		labelsHtml += labelHtml;
		linesHtml += lineHtml;
	}

	return labelsHtml + linesHtml;
};

SvgGraph.prototype._createHorizontalLabels = function(horizontalLabelsValCoordsArr) {
	var labelHtml = '',
		labelsHtml = '';

	for (var i = 0; i < horizontalLabelsValCoordsArr.length; i++) {
		labelHtml = '<text ' +
			'class="graph_label horizontal_label" text-anchor="middle" dominant-baseline="central"' +
			' x="' + horizontalLabelsValCoordsArr[i].xCoord + '" y="' + horizontalLabelsValCoordsArr[i].yCoord + '">' +
			this._xLabelsPrefix + horizontalLabelsValCoordsArr[i].value + this._xLabelsSuffix +
			'</text>';


		labelsHtml += labelHtml;
	}

	return labelsHtml;
};

SvgGraph.prototype._createTitleLabels = function(titleLabelsValCoordsArr) {
	var labelHtml = '',
		labelsHtml = '';

	for (var i = 0; i < titleLabelsValCoordsArr.length; i++) {
		labelHtml = '<text ' +
			'class="graph_label title_label" text-anchor="middle" dominant-baseline="central"' +
			' x="' + titleLabelsValCoordsArr[i].xCoord + '" y="' + titleLabelsValCoordsArr[i].yCoord + '">' +
			this._titleLabelsPrefix + titleLabelsValCoordsArr[i].value + this._titleLabelsSuffix +
			'</text>';

		labelsHtml += labelHtml;
	}

	return labelsHtml;
};

SvgGraph.prototype._createLabelRects = function(labelRectsValCoordsArr) {
	var	labelsRectHtml = '',
		labelRectHtml = '',
		startingXCoord,
		startingYCoord,
		width,
		height;

	for (var i = 0; i < labelRectsValCoordsArr.length; i++) {
		width = this._endingGraphLabelLineXValueCoordinate - this._startingGraphLabelLineXValueCoordinate;
		height = labelRectsValCoordsArr[i].y2.yCoord - labelRectsValCoordsArr[i].y1.yCoord;

		if (width < 0) {
			startingXCoord = this._endingGraphLabelLineXValueCoordinate;
			width = -width;
		} else {
			startingXCoord = this._startingGraphLabelLineXValueCoordinate;
		}

		if (height < 0) {
			startingYCoord = labelRectsValCoordsArr[i].y2.yCoord;
			height = -height;
		} else {
			startingYCoord = labelRectsValCoordsArr[i].y1.yCoord;
		}

		labelRectHtml = '<rect class="vertical_label_rect"' +
			' fill="url(#linear-gradient)"' +
			' x="' + startingXCoord + '" y="' + startingYCoord + '"' +
			' width="' + width + '" height="' + height + '"' +
			'/>';

		labelsRectHtml += labelRectHtml;
	}

	return labelsRectHtml;
}

try {
	module.exports = SvgGraph;
} catch (err) {
	console.warn(err);
}
