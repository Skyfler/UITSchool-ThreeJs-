"use strict";

/**
 * Class SvgGraph
 *
 * Inherits methods from Helper class (helper.js)
 *
 * Required files:
 * 	helper.js
 * 	animation.js
 *
 * Arguments:
 * 	1. options (required) - object with possible options:
 * 		1.1. elem (required) - svg element that will used to draw graph
 *		1.2. name (optional) - name for class instance to show in console
 *		1.3. container (required) - html element container of options.elem
 *		1.4. xLabelsPrefix (optional) - string that will be prepended to label on x axis
 *		1.5. xLabelsSuffix (optional) - string that will be appended to label on x axis
 *		1.6. yLabelsPrefix (optional) - string that will be prepended to label on y axis
 *		1.7. yLabelsSuffix (optional) - string that will be appended to label on y axis
 *		1.8. titleLabelsPrefix (optional) - string that will be prepended to title label
 *		1.9. titleLabelsSuffix (optional) - string that will be appended to title label
 *		1.10. animationDuration (optional) - animation deration of move of the indicator
 *		1.11... options from Helper class (helper.js)
 */

// Try requiring files via webpack
try {
	var Helper = require('./helper');
	var Animation = require('./animation');
} catch (err) {
	console.warn(err);
}

function SvgGraph(options) {
	options.name = options.name || 'SvgGraph';
	// run Helper constructor
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

	// bind class instance as "this" for event listener functions
	this._onResize = this._onResize.bind(this);
	this._onMouseOut = this._onMouseOut.bind(this);
	this._onMouseMove = this._onMouseMove.bind(this);

	// run main initialisation function
	this._init();
}

// Inherit prototype methods from Helper
SvgGraph.prototype = Object.create(Helper.prototype);
SvgGraph.prototype.constructor = SvgGraph;

// Main initialisation function
SvgGraph.prototype._init = function() {
	// find g element inside svg where ghraph will be drawn
	this._graphContainer = this._elem.querySelector('.graph_container');

	// read graph data from template elements inside this._elem
	this._graphs = {};
	this._readGraphData();

	this._drawGraph();
	this._getGraphElements();

	// start listening to window resize to redraw graph
	this._addListener(window, 'resize', this._onResize);
	// start listening to hover on graph to show indicator
	this._addListener(this._elem, 'mouseout', this._onMouseOut);
	this._addListener(this._elem, 'touchend', this._onMouseOut);
	this._addListener(this._elem, 'touchstart', this._onMouseMove);
	this._addListener(this._elem, 'mousemove', this._onMouseMove);
	this._addListener(this._elem, 'touchmove', this._onMouseMove);
};

// Generates object this._graphs from graphs data stored template elements
SvgGraph.prototype._readGraphData = function() {
	// find all template elements with graph data
	var graphTemplates = this._elem.querySelectorAll('.graph_data');

	// collect all data into this._graphs object
	for (var i = 0, id; i < graphTemplates.length; i++) {
		id = graphTemplates[i].getAttribute('id') || ('graph_' + i);
		this._graphs[id] = this._readGraphDataTemplate(graphTemplates[i]);
	}
};

// Reads graph data in JSON format from template element
// Arguments:
// 	1. templateElem (required) - template element which contains graph data
SvgGraph.prototype._readGraphDataTemplate = function(templateElem) {
	return JSON.parse(templateElem.innerHTML);
};

// Generates graph elements and labels
SvgGraph.prototype._drawGraph = function() {
	// calculate coordinates of all elements and labels
	this._calculateValueCoordinates();

	var html = '';
	// generate labels' html
	var labelsObj = this._createLabels();

	html += labelsObj.labelRectsHtml;

	// generate path elements
	for (var i = 0; i < this._pathsCoords.length; i++) {
		html += this._createPath(this._pathsCoords[i], this._graphNames[i]);
	}

	html += labelsObj.labelsHtml;

	// generate indicator
	html += this._createIndicator();

	this._graphContainer.innerHTML = html;
};

// Calculates positions for graph element and labels
SvgGraph.prototype._calculateValueCoordinates = function() {
	// calcuate border coordinates and values of the graph
	this._setStartingEndingMinMaxValues();
	// calculate pixel ratio per point of value at x and y axis
	this._calculateValPerPx();

	this._pathsCoords = [];
	this._graphNames = [];
	// calculate coordinates coordinates for paths elements
	var i = 0;
	for (var prop in this._graphs) {
		this._pathsCoords[i] = this._calculatePathCoords(this._graphs[prop]);
		this._graphNames[i] = prop;
		i++;
	}
};

// Calculates border coordinates and values of the graph
SvgGraph.prototype._setStartingEndingMinMaxValues = function() {
	if (!this._graphs || Object.keys(this._graphs).length === 0) return;

	var maxX,
		maxY,
		minX;

	// find max value on x axis (min value on x axis will be 0) and max and min values on y axis
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

	// set graph starting and ending coordinates
	this._startingXValueCoordinate = 0;
	this._startingYValueCoordinate = svgBox.height;
	this._endingXValueCoordinate = svgBox.width;
	this._endingYValueCoordinate = 0;

	// set coordinates of x and y labels with little offset from borders
	this._startingGraphLabelXValueCoordinate = this._startingXValueCoordinate + 30;
	this._startingGraphLabelYValueCoordinate = this._startingYValueCoordinate - 25;

	// set coordinates of vertical label lines
	this._startingGraphLabelLineXValueCoordinate = this._startingXValueCoordinate + 60;
	this._endingGraphLabelLineXValueCoordinate = this._endingXValueCoordinate;

	// set maximal and minimal coordinates and values for path elements
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

// Calculates pixel ratio per oint of value on x and y axis
SvgGraph.prototype._calculateValPerPx = function() {
	this._valXPerPx = (this._endingGraphPathXValueCoordinate.xCoord - this._startingGraphPathXValueCoordinate.xCoord) / (this._endingGraphPathXValueCoordinate.val - this._startingGraphPathXValueCoordinate.val);
	this._valYPerPx = (this._endingGraphPathYValueCoordinate.yCoord - this._startingGraphPathYValueCoordinate.yCoord) / (this._endingGraphPathYValueCoordinate.val - this._startingGraphPathYValueCoordinate.val);
};

// Calculates coordinates for path element
// Arguments:
// 	1. graphPointsArr (required) - array of points on path that have x value (year), max y and min y values
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

		// y coordinate will be avarage of min and max y coordinate
		y = ((maxY - minY) / 2) + minY;

		// calculate coordinates
		pointCoordinates[i] = {
			// coordinate of point on x axis
			xCoord: this._startingGraphPathXValueCoordinate.xCoord +
			(x - this._startingGraphPathXValueCoordinate.val) * this._valXPerPx,
			// coordinate of point on y axis
			yCoord: this._startingGraphPathYValueCoordinate.yCoord +
			(y - this._startingGraphPathYValueCoordinate.val) * this._valYPerPx,
			// coordinte of min value of point on y axis (for labels)
			yMinCoord: this._startingGraphPathYValueCoordinate.yCoord +
			(minY - this._startingGraphPathYValueCoordinate.val) * this._valYPerPx,
			// coordinte of max value of point on y axis (for labels)
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

// Gets generated graph elements to display indicator
SvgGraph.prototype._getGraphElements = function() {
	this._indicator = this._elem.querySelector('.indicator');
	this._indicatorDot = this._elem.querySelector('.indicator_dot');
	this._indicatorLine = this._elem.querySelector('.indicator_line');
	this._indicatorLabel = this._elem.querySelector('.indicator_label');
	this._graphPathElemsArr = this._elem.querySelectorAll('.graph_path');
};

// Removes graph elements
SvgGraph.prototype._removeGraphElements = function() {
	this._indicatorDot = '';
	this._indicatorLine = '';
	this._indicatorLabel = '';
	this._graphPathElemsArr = [];
};

// Invoked by mouseout and touchend events
// Arguments:
// 	1. e (required) - event object
SvgGraph.prototype._onMouseOut = function(e) {
	var target = e.target;
	if (!target) return;

	// get coordinates of mouse|touch
	var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX,
		clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;

	// find path element with this coordinates
	var pathNameIndex = this._findPathByMousePosition(clientX, clientY);
	// if path element is found then do nothing
	if (pathNameIndex) return;

	// hide indicator
	this._setIndicatorPosition(false);
}

// Invoked by mousemove and touchmove events
// Arguments:
// 	1. e (required) - event object
SvgGraph.prototype._onMouseMove = function(e) {
	// get coordinates of mouse|touch
	var clientX = (e.clientX === undefined) ? e.changedTouches[0].clientX : e.clientX,
		clientY = (e.clientY === undefined) ? e.changedTouches[0].clientY : e.clientY;

	// find path element with this coordinates
	var pathNameIndex = this._findPathByMousePosition(clientX, clientY);
	// if path element is not found then do nothing
	if (!pathNameIndex) return;

	// find closest point on path
	var pointIndex = this._findPointIndexByMousePosition(clientX, pathNameIndex);

	// show indicator on found point
	this._setIndicatorPosition(pathNameIndex, pointIndex);
};

// Searches for path element with passed coordinates
// Arguments:
// 	1. clientX (required) - x coordinate
// 	2. clientY (required) - y coordinate
SvgGraph.prototype._findPathByMousePosition = function(clientX, clientY) {
	var target = true,
		pathNameIndex,
		hiddenElemsArr = [],
		// remember scroll of body and document to restore it later
		docElemScroll = document.documentElement.scrollTop,
		docBodyScroll = document.body.scrollTop;

	// loop through all elements under point with passed coordinates and hide them until path element is found or until document element is reached
	while (target && target !== this._elem && target !== document.body && target !== document.documentElement && !pathNameIndex) {
		// get element by point
		target = document.elementFromPoint(clientX, clientY);
		// if element is not in the svg elem (this._elem) then go for next iteration
		if (!this._elem.contains(target)) {
			target = false;
		}
		if (!target) continue;

		// search for path name and index in array by element
		pathNameIndex = this._findPathNameIndex(target);

		// if element is not path then hide it
		if (!pathNameIndex) {
			hiddenElemsArr.push(target);
			target.style.display = 'none';
		}
	}

	// reveal all hidden elements after search
	for (var i = 0; i < hiddenElemsArr.length; i++) {
		hiddenElemsArr[i].style.display = '';
	}

	return pathNameIndex;
}

// Searchesfor point on path by passed x coordinate
// Arguments:
// 	1. mouseX (required) - x coordinate of mouse
// 	2. pathNameIndex (required) - object that contains:
//		2.1 name (required) - graph name
//		2.2 index (required) - graph index in the array
SvgGraph.prototype._findPointIndexByMousePosition = function(mouseX, pathNameIndex) {
	// get x coordinate on svg elem
	var pathXPosition = mouseX - this._elem.getBoundingClientRect().left,
	// get path point coordinates
		pathCoords = this._pathsCoords[pathNameIndex.index],
		closestMin,
		closestMax,
		closestMinI,
		closestMaxI;

	// find point coordinate on path that is closest to mouse x coordinate
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

// Checks if passed element is path from array of graph names and returns object with name and index
// Arguments:
// 	1. target (required) - element to test for path
SvgGraph.prototype._findPathNameIndex = function(target) {
	for (var i = 0; i < this._graphNames.length; i++) {
		// if element contains class from graph names array then it's path
		if (target.classList.contains(this._graphNames[i])) {
			return {
				name: this._graphNames[i],
				index: i
			}
		}
	}

	return false;
};

// Moves indicator to point on graph or hides it
// Arguments:
// 	1. pathNameIndex (optional) - object, if not passed then indicator will be hidden, must contain:
//		1.1 name (required) - graph name
//		1.2 index (required) - graph index in the array
// 	2. pathPointIndex (required if pathNameIndex is passed) - index of point in points array of path
SvgGraph.prototype._setIndicatorPosition = function(pathNameIndex, pathPointIndex) {
	pathPointIndex = pathPointIndex ? pathPointIndex : 0;

	var x, y, value1, value2, noAnimation;
	if (pathNameIndex) {
		// if pathNameIndex is apssed then get coordinates and values of the point
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
		// else set initial coordinates for indicator
		x = this._indicatorDotInitCorrdinates.x;
		y = this._indicatorDotInitCorrdinates.y;
		value1 = '';
		value2 = '';
		this._indicator.style.display = '';
		this._indicatorHidden = true;
	}

	// if new coordinates for indicator is different from pervious then move indicator with aimation
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

// Creates path html
// Arguments:
// 	1. pathCoords (required) - array of objects that must contain xCoord and yCoord
// 	2. titleClass (required) - name of path
SvgGraph.prototype._createPath = function(pathCoords, titleClass) {
	// start path html
	var svgPath = '<path class="graph_path';
	if (titleClass) {
		svgPath += ' ' + titleClass;
	}
	svgPath += '" d="M';

	// get starting and endig coordinates of the path
	var startChart = this._startingGraphPathXValueCoordinate.xCoord + ',' + this._startingGraphPathYValueCoordinate.yCoord;
	var endChart = this._endingGraphPathXValueCoordinate.xCoord + ',' + this._startingGraphPathYValueCoordinate.yCoord;

	svgPath += ' ' + startChart;

	svgPath += ' ' + pathCoords[0].xCoord + ',' + pathCoords[0].yCoord;
	var x1, y1, x2, y2, x, y;
	// set coords for each point
	for (var i = 1; i < pathCoords.length; i++) {
		x1 = (pathCoords[i].xCoord + pathCoords[i-1].xCoord) / 2;
		y1 = pathCoords[i-1].yCoord;
		x2 = (pathCoords[i].xCoord + pathCoords[i-1].xCoord) / 2;
		y2 = pathCoords[i].yCoord;
		x = pathCoords[i].xCoord;
		y = pathCoords[i].yCoord;

		svgPath += ' C ' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x + ',' + y;
	}

	// close path html
	svgPath += ' L ' + endChart;
	svgPath += ' z" />';

	return svgPath;
};

// Invoked by scroll event on window
SvgGraph.prototype._onResize = function() {
	// remove current graph elements
	this._removeGraphElements();
	// redraw graph
	this._drawGraph();
	// get new graph elements
	this._getGraphElements();
};

// Creates indicator html
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

// Create content of indicator label
// Arguments:
// 	1. firstLineText (required) - text to set to first line
// 	2. secondLineText (required) - text to set to second line
// 	3. xOffset (required) - x coordinate of label (to display label on right or left side of the indicator)
SvgGraph.prototype._createLabelContents = function(firstLineText, secondLineText, xOffset) {
	var secondLineYPosition = this._checkScreenWidth() === 'xs' ? 28 : 38;

	var text = '<tspan class="first_line" x="' + xOffset + '" dy="0">$' + firstLineText + '</tspan>' +
		'<tspan class="second_line" x="' + xOffset + '" dy="' + secondLineYPosition + '">Year ' + secondLineText + '</tspan>';
	return text;
};

// Moves indicator to new position
// Arguments:
// 	1. dotCoordinateX (required) - new x coordinate of indicator
// 	2. dotCoordinateY (required) - new y coordinate of indicator
// 	3. firstLineText (required) - text to set to first line
// 	4. secondLineText (required) - text to set to second line
// 	5. noAnimation (optional) - if set to true then indicator will be moved without animation
SvgGraph.prototype._moveIndicator = function(dotCoordinateX, dotCoordinateY, firstLineText, secondLineText, noAnimation) {
	var self = this;

	// Checks if indicator text is beyond svg elem and changes it's position
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

	// calculate translate for new coordinates
	var translateX = 0 - this._indicatorDotInitCorrdinates.x + this._indicatorDotCurrentCorrdinates.x;
	var translateY = 0 - this._indicatorDotInitCorrdinates.y + this._indicatorDotCurrentCorrdinates.y;

	// set net text for indicator and check it's position
	this._indicatorLabel.innerHTML = this._createLabelContents(firstLineText, secondLineText, this._indicatorLabelOffsetCoordinates.x);
	checkAndReSetIndicatorPosition();

	if (this._indicatorAnimation) {
		this._indicatorAnimation.stop();
	}

	if (noAnimation) {
		// if noAnimation is true then set new transform coordinates
		delete this._indicatorAnimation;

		this._indicator.setAttribute('transform', 'translate(' + translateX + ', ' + translateY + ')');

		// recheck text position
		checkAndReSetIndicatorPosition();
	} else {
		// create new animation to move indicator
		this._indicatorAnimation = new Animation(
			function(timePassed){
				// calculate timing function value for current moment of animation
				var timeMultiplier = Animation.quadEaseInOut(this._animationDuration, timePassed);

				// calculate current tarnslate
				var curX = startVal.x + ((translateX - startVal.x) * (timeMultiplier));
				var curY = startVal.y + ((translateY - startVal.y) * (timeMultiplier));

				this._indicator.setAttribute('transform', 'translate(' + curX + ', ' + curY + ')');
			}.bind(this),
			this._animationDuration,
			function() {
				delete this._indicatorAnimation;

				// set new text again and recheck it's position
				this._indicatorLabel.innerHTML = this._createLabelContents(firstLineText, secondLineText, this._indicatorLabelOffsetCoordinates.x);
				checkAndReSetIndicatorPosition();
			}.bind(this)
		);

	}
};

// Genareates labels' html for graph
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

// Calculates labels' coordinates
SvgGraph.prototype._calculateLabelsCoordinates = function() {
	var varticalLabelsArr = [],
		horizontalLabelsArr = [],
		titleLabelsArr = [],
		labelRectsArr = [],
		pathCoords,
		pathYTopVal,
		pathYLowestVal;

	// Checks if label with passed value already exists in passed labels array
	// Arguments:
	// 	1. labelsCoordinatesArr (required) - array to search for label
	// 	2. labelVal (required) - label value to check
	function findInLabelsCoordinatesArr(labelsCoordinatesArr, labelVal) {
		for (var i = 0; i < labelsCoordinatesArr.length; i++) {
			if (labelsCoordinatesArr[i].value === labelVal) return true;
		}
		return false;
	}

	// loop through all paths
	for (var j = 0; j < this._pathsCoords.length; j++) {
		pathCoords = this._pathsCoords[j];
		pathYTopVal = undefined;
		pathYLowestVal = undefined;

		// loop through all points of path
		for (var i = 0; i < pathCoords.length; i++) {
			// find max y value and coordinate fot path
			if (pathYTopVal === undefined || pathYTopVal.value < pathCoords[i].yMaxValue) {
				pathYTopVal = {
					value: pathCoords[i].yMaxValue,
					xCoord: this._startingGraphLabelXValueCoordinate,
					yCoord: pathCoords[i].yMaxCoord
				};
			}
			// find min y value and coordinate fot path
			if (pathYLowestVal === undefined || pathYLowestVal.value > pathCoords[i].yMinValue) {
				pathYLowestVal = {
					value: pathCoords[i].yMinValue,
					xCoord: this._startingGraphLabelXValueCoordinate,
					yCoord: pathCoords[i].yMinCoord
				};
			}

			// add all unique x values and their coordinates to horizontal labels array
			if (!findInLabelsCoordinatesArr(horizontalLabelsArr, pathCoords[i].xValue)) {
				horizontalLabelsArr.push({
					value: pathCoords[i].xValue,
					xCoord: pathCoords[i].xCoord,
					yCoord: this._startingGraphLabelYValueCoordinate
				});
			}
		}

		// rectangles will take all height from lovest to highest y coordinates
		labelRectsArr.push({
			y1: pathYLowestVal,
			y2: pathYTopVal
		});

		// add all unique y labels to vertical labels array
		if (!findInLabelsCoordinatesArr(varticalLabelsArr, pathYLowestVal.value)) {
			varticalLabelsArr.push(pathYLowestVal);
		}
		if (!findInLabelsCoordinatesArr(varticalLabelsArr, pathYTopVal.value)) {
			varticalLabelsArr.push(pathYTopVal);
		}

		// title labels will be at the center of x coordinate of the graph and at the middle between highest and lowest coordinate of y label for current path
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

// Generates labels' html for y axis
// Arguments:
// 	1. verticalLabelsValCoordsArr (required) - array with objects that contain xCoord, yCoord and value for each label
SvgGraph.prototype._createVerticalLabels = function(verticalLabelsValCoordsArr) {
	var labelHtml = '',
		lineHtml = '',
		labelsHtml = '',
		linesHtml = '';

	for (var i = 0; i < verticalLabelsValCoordsArr.length; i++) {
		// create y axis text label
		labelHtml = '<text' +
			' class="graph_label vertical_label" text-anchor="middle" dominant-baseline="central"' +
			' x="' + verticalLabelsValCoordsArr[i].xCoord + '" y="' + verticalLabelsValCoordsArr[i].yCoord + '">' +
			this._yLabelsPrefix + verticalLabelsValCoordsArr[i].value + this._yLabelsSuffix +
			'</text>';
		// create line through graph representing text label
		lineHtml = '<line class="vertical_label_line"' +
			' x1="' + this._startingGraphLabelLineXValueCoordinate + '" y1="' + verticalLabelsValCoordsArr[i].yCoord + '"' +
			' x2="' + this._endingGraphLabelLineXValueCoordinate + '" y2="' + verticalLabelsValCoordsArr[i].yCoord + '"' +
			'/>';

		labelsHtml += labelHtml;
		linesHtml += lineHtml;
	}

	return labelsHtml + linesHtml;
};

// Generates labels' html for x axis
// Arguments:
// 	1. horizontalLabelsValCoordsArr (required) - array with objects that contain xCoord, yCoord and value for each label
SvgGraph.prototype._createHorizontalLabels = function(horizontalLabelsValCoordsArr) {
	var labelHtml = '',
		labelsHtml = '';

	for (var i = 0; i < horizontalLabelsValCoordsArr.length; i++) {
		// create x axis text label
		labelHtml = '<text ' +
			'class="graph_label horizontal_label" text-anchor="middle" dominant-baseline="central"' +
			' x="' + horizontalLabelsValCoordsArr[i].xCoord + '" y="' + horizontalLabelsValCoordsArr[i].yCoord + '">' +
			this._xLabelsPrefix + horizontalLabelsValCoordsArr[i].value + this._xLabelsSuffix +
			'</text>';


		labelsHtml += labelHtml;
	}

	return labelsHtml;
};

// Generates labels' html for title labels
// Arguments:
// 	1. titleLabelsValCoordsArr (required) - array with objects that contain xCoord, yCoord and value for each label
SvgGraph.prototype._createTitleLabels = function(titleLabelsValCoordsArr) {
	var labelHtml = '',
		labelsHtml = '';

	for (var i = 0; i < titleLabelsValCoordsArr.length; i++) {
		// create title text label
		labelHtml = '<text ' +
			'class="graph_label title_label" text-anchor="middle" dominant-baseline="central"' +
			' x="' + titleLabelsValCoordsArr[i].xCoord + '" y="' + titleLabelsValCoordsArr[i].yCoord + '">' +
			this._titleLabelsPrefix + titleLabelsValCoordsArr[i].value + this._titleLabelsSuffix +
			'</text>';

		labelsHtml += labelHtml;
	}

	return labelsHtml;
};

// Generates html for rectangles which will be filled with gradient
// Arguments:
// 	1. labelRectsValCoordsArr (required) - array with objects that contain two objects: y1 and y2, each must contain yCoord
SvgGraph.prototype._createLabelRects = function(labelRectsValCoordsArr) {
	var	labelsRectHtml = '',
		labelRectHtml = '',
		startingXCoord,
		startingYCoord,
		width,
		height;

	for (var i = 0; i < labelRectsValCoordsArr.length; i++) {
		// width will be same as of lines for y labels
		width = this._endingGraphLabelLineXValueCoordinate - this._startingGraphLabelLineXValueCoordinate;
		// height will be defference between two labels' y coordinates
		height = labelRectsValCoordsArr[i].y2.yCoord - labelRectsValCoordsArr[i].y1.yCoord;

		// if width is negative then reverse it
		if (width < 0) {
			startingXCoord = this._endingGraphLabelLineXValueCoordinate;
			width = -width;
		} else {
			startingXCoord = this._startingGraphLabelLineXValueCoordinate;
		}

		// if height is negative then reverse it
		if (height < 0) {
			startingYCoord = labelRectsValCoordsArr[i].y2.yCoord;
			height = -height;
		} else {
			startingYCoord = labelRectsValCoordsArr[i].y1.yCoord;
		}

		// create recatangle
		labelRectHtml = '<rect class="vertical_label_rect"' +
			' fill="url(#linear-gradient)"' +
			' x="' + startingXCoord + '" y="' + startingYCoord + '"' +
			' width="' + width + '" height="' + height + '"' +
			'/>';

		labelsRectHtml += labelRectHtml;
	}

	return labelsRectHtml;
}

// Try exporting class via webpack
try {
	module.exports = SvgGraph;
} catch (err) {
	console.warn(err);
}
