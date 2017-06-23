"use strict";

(function ready() {

	var _polyfills = require('./polyfills');
	var _extendStandartPrototypes = require('./extendStandartPrototypes');
	var Menu = require('./menu');
	var Dropdown = require('./dropdown');
	var IndexMenuController = require('./indexMenuController');
	var ScrollScreenPage = require('./scrollScreenPage');
//	var SimpleTabs = require('./simpleTabs');
	var DropdownGroup = require('./dropdown-dropdownGroup');
	var Slider = require('./slider');
	var ContactFormController = require('./contactFormController');
	var AnimatedPlaceholder = require('./animatedPlaceholder');
	var SideMenu = require('./sideMenu');
	var ContactsModalController = require('./contactsModalController');
	var Tabs = require('./tabs');
	var GMapController = require('./gmapController');
	var SvgGraph = require('./svgGraph');
	var TeacherBlockController = require('./teacherBlockController');
	var ThreeCenterMain = require('./threeMainController-centerMain');
	var ThreeInnerPageBG = require('./threeMainController-innerPageBG');
	var FooterCirclesController = require('./footerCirclesController');
	var CourseInfoHeight = require('./courseInfoHeight');
	var ScrollToSlide = require('./scrollToSlide');
	var PageSlideNumbering = require('./pageSlideNumbering');

	_polyfills.init();
	_extendStandartPrototypes.init();

	var sideMenuElem = document.querySelector('.side_menu');
	if (sideMenuElem) {
		var sideMenu = new SideMenu({
			elem: sideMenuElem
		});
	}

	var scrollToSlide = new ScrollToSlide({
		scrollDuration: 600
	});

	var threeCenterMainElem = document.querySelector('.page-index .bg_canvas');
	if (threeCenterMainElem) {
		var threeCenterMain = new ThreeCenterMain({
			renderElem: threeCenterMainElem,
			idleAnimationDuration: 15000,
			urlsToLoadObj_courses: {
				basic: ['img/main_center/basic.svg'],
				android: ['img/main_center/android.svg'],
				english: ['img/main_center/english.svg'],
				hr: ['img/main_center/HR.svg'],
				htmlCss: ['img/main_center/html_css.svg'],
				itProjectManagement: ['img/main_center/IT_Project_Management.svg'],
				php: ['img/main_center/php.svg'],
				java: ['img/main_center/java.svg'],
				qa: ['img/main_center/QA.svg'],
				quAutomation: ['img/main_center/QA_automation.svg'],
				seo: ['img/main_center/SEO.svg'],
				smm: ['img/main_center/SMM.svg'],
				webDesign: ['img/main_center/web_design.svg'],
				sales: ['img/main_center/IT_Sales.svg'],
				advertising: ['img/main_center/ADS.svg'],
				javascript: ['img/main_center/JS.svg']
			},
			urlsToLoad_innerShape_A: [
				'img/main_center/flourish.svg',
			],
			urlsToLoad_innerShape_B: [
				'img/main_center/flourish_2.svg',
			],
			widthCancelModesArr: ['xs'],
			widthActiveModesArr: ['sm', 'md', 'lg']
		});
	}

	var threeBGElemCourse = document.querySelector('.page-course .bg_canvas');
	if (threeBGElemCourse) {
		var initalGeometryIndex = document.querySelector('[data-geometry-index]') ? document.querySelector('[data-geometry-index]').dataset.geometryIndex : 0;
		var initalMeshColor = document.querySelector('[data-mesh-color]') ? document.querySelector('[data-mesh-color]').dataset.meshColor : 'ffffff';
		var threeBGCourse = new ThreeInnerPageBG({
			renderElem: threeBGElemCourse,
			idleAnimationDuration: 15000,
			switchAnimationDuration: 1000,
			urlsToLoad_A: [
				'img/uits_dots/1_start_a.svg',
				'img/uits_dots/2a.svg',
				'img/uits_dots/3a.svg',
				'img/uits_dots/4a.svg',
				'img/uits_dots/5a.svg',
				'img/uits_dots/6a.svg',
				'img/uits_dots/7a.svg',
				'img/uits_dots/8_partners_a.svg',
				'img/uits_dots/9_Enroll_for_a_course_a.svg',
				'img/uits_dots/10a.svg'
			],
			urlsToLoad_B: [
				'img/uits_dots/1_start_b.svg',
				'img/uits_dots/2b.svg',
				'img/uits_dots/3b.svg',
				'img/uits_dots/4b.svg',
				'img/uits_dots/5b.svg',
				'img/uits_dots/6b.svg',
				'img/uits_dots/7b.svg',
				'img/uits_dots/8_partners_b.svg',
				'img/uits_dots/9_Enroll_for_a_course_b.svg',
				'img/uits_dots/10b.svg'
			],
			initalGeometryIndex: initalGeometryIndex,
			initalMeshColor: initalMeshColor,
			widthCancelModesArr: ['xs', 'sm', 'md'],
			widthActiveModesArr: ['lg']
		});
	}

	var threeBGElemContacts = document.querySelector('.page-contacts .bg_canvas');
	if (threeBGElemContacts) {
		var initalGeometryIndex = document.querySelector('[data-geometry-index]') ? document.querySelector('[data-geometry-index]').dataset.geometryIndex : 0;
		var initalMeshColor = document.querySelector('[data-mesh-color]') ? document.querySelector('[data-mesh-color]').dataset.meshColor : 'ffffff';
		var threeBGContacts = new ThreeInnerPageBG({
			renderElem: threeBGElemContacts,
			idleAnimationDuration: 15000,
			switchAnimationDuration: 1000,
			urlsToLoad_A: [
				'img/uits_dots/1_start_a.svg'
			],
			urlsToLoad_B: [
				'img/uits_dots/1_start_b.svg'
			],
			initalGeometryIndex: initalGeometryIndex,
			initalMeshColor: initalMeshColor,
			widthCancelModesArr: ['xs', 'sm'],
			widthActiveModesArr: ['md', 'lg']
		});
	}

	var mainMenu = new Menu({
		elem: document.querySelector('#main_menu'),
		openBtnSelector: '[data-component="dropdown_toggle"]',
		dropdownContainerSelector: '.dropdown_container',
		offsetElem: sideMenuElem
	});

	var dropdownElemArr = document.querySelectorAll('.dropdown');
	if (dropdownElemArr.length > 0) {
		var dropdownArr = [];

		for (var i = 0; i < dropdownElemArr.length; i++) {
			dropdownArr[i] = new Dropdown({
				elem: dropdownElemArr[i],
				transitionDuration: 0.5,
				openBtnSelector: '[data-component="dropdown_toggle"]',
				dropdownContainerSelector: '.dropdown_container',
				dropdownBarSelector: '.dropdown_bar',
				closeOnResize: true
			});
		}
	}

	var indexMenuElem = document.querySelector('#index_menu');
	if (indexMenuElem) {
		/**/
//		var escape = document.createElement('textarea');
//		function escapeHTML(html) {
//			escape.textContent = html;
//			return escape.innerHTML;
//		}
//
//		document.addEventListener('mousedown', function(e){
//			var test = document.querySelector('#test');
//			test.innerHTML += e.type + '</br>';
//			test.scrollTop = test.scrollHeight;
//		});
//		document.addEventListener('touchstart', function(e){
//			var test = document.querySelector('#test');
//			test.innerHTML += e.type + '</br>';
//			test.scrollTop = test.scrollHeight;
//		});
//
//		document.addEventListener('mousemove', function(e){
//			var test = document.querySelector('#test');
//			test.innerHTML += e.type + '</br>';
//			test.scrollTop = test.scrollHeight;
//		});
//		document.addEventListener('touchmove', function(e){
//			var test = document.querySelector('#test');
//			test.innerHTML += e.type + '</br>';
//			test.scrollTop = test.scrollHeight;
//		});
//
//		document.addEventListener('mouseup', function(e){
//			var test = document.querySelector('#test');
//			test.innerHTML += e.type + '</br>';
//			test.scrollTop = test.scrollHeight;
//		});
//		document.addEventListener('touchtouchend', function(e){
//			var test = document.querySelector('#test');
//			test.innerHTML += e.type + '</br>';
//			test.scrollTop = test.scrollHeight;
//		});
		/**/
		var indexMenu = new IndexMenuController({
			elem: indexMenuElem,
			switchBreakpoint: 1200,
			columnBreakpoint: 992
		});
	}

	var scrollScreenPageElem = document.querySelector('#page_scroller');
	if (scrollScreenPageElem) {
		var scrollScreenPage = new ScrollScreenPage({
			elem: scrollScreenPageElem,
//            pageSlideHeightString: "window.innerHeight - (document.querySelector('header').offsetHeight + document.querySelector('footer').offsetHeight)",
			animationDuration: 1000,
			slidePartsBreakpoint: 1200
		});

		var pageSlideNumbering = new PageSlideNumbering({
			elem: scrollScreenPageElem
		});
	}

//	var tabsElem = document.querySelector('.tabs_container');
//	if (tabsElem) {
//		var tabs = new SimpleTabs({
//			elem: tabsElem
//		});
//	}

	var modalTabsContainerElem = document.querySelector('.modal_contacts_tabs');
	if (modalTabsContainerElem) {
		var modalContactsTabsController = new ContactsModalController({
			elem: modalTabsContainerElem,
		});

		var modalContactsTabs = new Tabs({
			elem: modalTabsContainerElem,
			transitionDuration: 0.15
		});
	}

	var tabsContainerElem = document.querySelector('.tabs_container');
	if (tabsContainerElem) {
		var tabs = new Tabs({
			elem: tabsContainerElem,
			transitionDuration: 0.15
		});
	}

	var dropdownGroupElemArr = document.querySelectorAll('.dropdown_group');
	if (dropdownGroupElemArr.length > 0) {
		var dropdownGroupArr = [];

		for (var i = 0; i < dropdownGroupElemArr.length; i++) {
			dropdownGroupArr[i] = new DropdownGroup({
				elem: dropdownGroupElemArr[i],
				dropdownSelector: '.droppownGroupItem',
				dropdownOptions: {
					transitionDuration: 0.5,
					openBtnSelector: '[data-component="dropdown_toggle"]',
					dropdownContainerSelector: '.dropdown_container',
					dropdownBarSelector: '.dropdown_bar',
					closeOnResize: true
				}
			});
		}
	}

	var mainSliderElem = document.querySelector('#main_slider');
	if (mainSliderElem) {
		var mainSlider = new Slider({
			elem: mainSliderElem,
			delay: 0
		});
	}

	var contactFormElem = document.querySelector('#contact_form');
	if (contactFormElem) {
		var contactForm = new ContactFormController({
			elem: contactFormElem,
			actionUrl: contactFormElem.action,
			succsessNotificationHTML: '<div class="success_notification">' +
				'<p>Ваша заявка принята!</p>' +
				'<p>Наши менеджеры свяжутся с вами в ближайшее время ;)</p>' +
				'</div>'
		});
	}
	var modalContactFormElem = document.querySelector('#modal_contact_form');
	if (modalContactFormElem) {
		var modalContactForm = new ContactFormController({
			elem: modalContactFormElem,
			actionUrl: modalContactFormElem.action,
			succsessNotificationHTML: '<div class="success_notification">' +
				'<p>Ваша заявка принята!</p>' +
				'<p>Наши менеджеры свяжутся с вами в ближайшее время ;)</p>' +
				'</div>'
		});
	}
	var modalCallbackFormElem = document.querySelector('#modal_callback_form');
	if (modalCallbackFormElem) {
		var modalCallbackForm = new ContactFormController({
			elem: modalCallbackFormElem,
			actionUrl: modalCallbackFormElem.action,
			succsessNotificationHTML: '<div class="success_notification">' +
				'<p>Ваша заявка принята!</p>' +
				'<p>Наши менеджеры свяжутся с вами в ближайшее время ;)</p>' +
				'</div>'
		});
	}

	var customPlaceholderElemArr = document.querySelectorAll('.custom_placeholder');
	if (customPlaceholderElemArr.length > 0) {
		var customPlaceholderArr = [];

		for (var i = 0; i < customPlaceholderElemArr.length; i++) {
			customPlaceholderArr[i] = new AnimatedPlaceholder({
				elem: customPlaceholderElemArr[i]
			});
		}
	}

	var mapElem = document.querySelector('.map');
	if (mapElem) {
		var pos = {lat: 49.99335, lng: 36.23237};
		var gMap = new GMapController({
			elem: mapElem,
			gMapLoaded: gMapLoaded,
			gMapOptions: {
				zoom: 17,
				center: pos,
				streetViewControl: false,
				mapTypeControl: false,
				scrollwheel: false,
				styles: [
					{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}
				]
			},
			markers: [{
				icon: 'img/icon_map_marker.png',
				position: pos,
				title: 'г. Харьков, ул. Сумская, 2'
			}]
		});
	}

	var teacherBlockElem = document.querySelector('.course_teacher_block');
	if (teacherBlockElem) {
		var teacherBlockController = new TeacherBlockController({
			elem: teacherBlockElem.querySelector('.course_teacher_block_content'),
			pageSlideElem: teacherBlockElem,
			mainTitleElem: teacherBlockElem.querySelector('.main_title'),
			circleBlockElem: teacherBlockElem.querySelector('.teacher_img_outer_container'),
			firstBlockElem: teacherBlockElem.querySelector('.teacher_about'),
			secondBlockElem: teacherBlockElem.querySelector('.teacher_skills'),
			thirdBlockElem: teacherBlockElem.querySelector('.teacher_expirience'),
		});
	}

	var svgGraphElem = document.querySelector('.graph');
	if (svgGraphElem) {
		var svgGraph = new SvgGraph({
			elem: svgGraphElem,
			container: document.querySelector('.svg_graph_container'),
			yLabelsPrefix: '$'
		});
	}

	var courseInfoElem = document.querySelector('#course_info');
	if (courseInfoElem) {
		var heightController = new CourseInfoHeight({
			elem: courseInfoElem
		});
	}

	var rightPanel = document.querySelector('footer .right_panel');
	if (rightPanel)  {
		var footerCirclesController = new FooterCirclesController({
			elem: rightPanel
		});
	}

})();
