"use strict";

/**
 * File that used as the webpack entry and initialises all main classes' instances
 *
 * Required files:
 * 	polyfills.js
 * 	extendStandartPrototypes.js
 * 	preloader.js
 * 	menu.js
 * 	dropdown.js
 * 	indexMenuController.js
 * 	scrollScreenPage.js
 * 	dropdown-dropdownGroup.js
 * 	slider.js
 * 	contactFormController.js
 * 	animatedPlaceholder.js
 * 	sideMenu.js
 * 	contactsModalController.js
 * 	beforeLeaveModalController.js
 * 	tabs.js
 * 	gmapController.js
 * 	svgGraph.js
 * 	teacherBlockController.js
 * 	threeMainController-centerMain.js
 * 	threeMainController-innerPageBG.js
 * 	threeMainController-breforeLeaveAnimation.js
 * 	footerCirclesController.js
 * 	courseInfoHeight.js
 * 	scrollToSlide.js
 * 	sectionStartDateBgController.js
 * 	elemPageSlideChecker.js
 * 	sideContactButtonWave.js
 * 	OnlineBtnController.js
 */

(function ready() {

	var _polyfills = require('./polyfills');
	var _extendStandartPrototypes = require('./extendStandartPrototypes');
	var Preloader = require('./preloader');
	var Menu = require('./menu');
	var Dropdown = require('./dropdown');
	var IndexMenuController = require('./indexMenuController');
	var ScrollScreenPage = require('./scrollScreenPage');
	var DropdownGroup = require('./dropdown-dropdownGroup');
	var Slider = require('./slider');
	var ContactFormController = require('./contactFormController');
	var AnimatedPlaceholder = require('./animatedPlaceholder');
	var SideMenu = require('./sideMenu');
	var ContactsModalController = require('./contactsModalController');
	var BeforeLeaveModalController = require('./beforeLeaveModalController');
	var Tabs = require('./tabs');
	var GMapController = require('./gmapController');
	var SvgGraph = require('./svgGraph');
	var TeacherBlockController = require('./teacherBlockController');
	var ThreeCenterMain = require('./threeMainController-centerMain');
	var ThreeInnerPageBG = require('./threeMainController-innerPageBG');
	var BreforeLeaveAnimation = require('./threeMainController-breforeLeaveAnimation');
	var FooterCirclesController = require('./footerCirclesController');
	var CourseInfoHeight = require('./courseInfoHeight');
	var ScrollToSlide = require('./scrollToSlide');
	var SectionStartDateBgController = require('./sectionStartDateBgController');
	var ElemPageSlideChecker = require('./elemPageSlideChecker');
	var SideContactButtonWave = require('./sideContactButtonWave');
	var OnlineBtnController = require('./onlineBtnController');

	// initialise all polyfills
	_polyfills.init();
	// initialise all prototype extensions
	_extendStandartPrototypes.init();

	// initialise preloader
	var preloader = new Preloader({
		animationDuration: 500
	});

	// initialise side menu on course pages
	var sideMenuElem = document.querySelector('.side_menu');
	if (sideMenuElem) {
		var sideMenu = new SideMenu({
			elem: sideMenuElem
		});
	}

	// initialise webGL animation on index page
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
				javascript: ['img/main_center/JS.svg'],
				copyright: ['img/main_center/copyright.svg']
			},
			urlsToLoad_innerShape_A: [
				'img/main_center/flourish.svg',
			],
			urlsToLoad_innerShape_B: [
				'img/main_center/flourish_2.svg',
			],
//			url3DModel: 'obj/square.obj',
//			url3DModel: 'obj/square_min.obj',
			url3DModel: 'obj/1.obj',					// путь к 3d модели (относительно index)
			widthCancelModesArr: ['xs'],
			widthActiveModesArr: ['sm', 'md', 'lg'],
			allow3DModel: false							// установить true чтобы включить загрузку 3d модели
		});
	}

	// initialise webGL animation on before leave modal
	var modalAnimationElem = document.querySelector('#modal_animation');
	if (modalAnimationElem) {
		var modalAnimation = new BreforeLeaveAnimation({
			renderElem: modalAnimationElem,
			idleAnimationDuration: 10000,
			urlsToLoad_innerShape_A: [
				'img/before_leave/eye1.svg',
			],
			urlsToLoad_innerShape_B: [
				'img/before_leave/eye2.svg',
			],
			urlsToLoad_innerShape_C: [
				'img/before_leave/eye3.svg',
			],
			widthCancelModesArr: ['xs'],
			widthActiveModesArr: ['sm', 'md', 'lg'],
		});
	}

	// initialise webGL animation on course pages
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

	// initialise webGL animation on contacts page
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

	// initialise main menu
	var mainMenu = new Menu({
		elem: document.querySelector('#main_menu'),
		openBtnSelector: '[data-component="dropdown_toggle"]',
		dropdownContainerSelector: '.dropdown_container',
		offsetElem: sideMenuElem
	});

	// initialise all dropdowns
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

	// initialise two columns courses menu on index page
	var indexMenuElem = document.querySelector('#index_menu');
	if (indexMenuElem) {
		var indexMenu = new IndexMenuController({
			elem: indexMenuElem,
			switchBreakpoint: 1200,
			columnBreakpoint: 992
		});
	}

	// initialise start date background controller on course pages
	var sectionStartDateElem = document.querySelector('#course_start_date');
	if (sectionStartDateElem) {
		var sectionStartDateBgController = new SectionStartDateBgController({
			elem: sectionStartDateElem
		});
	}

	// initialise page slide scroller on pages where #page_scroller is present (courses, online courses, contacts)
	var scrollScreenPageElem = document.querySelector('#page_scroller');
	if (scrollScreenPageElem) {
		var scrollScreenPage = new ScrollScreenPage({
			elem: scrollScreenPageElem,
			animationDuration: 1000,
			slidePartsBreakpoint: 1200,
			widthCancelModesArr: ['xs', 'sm', 'md'],
			widthActiveModesArr: ['lg']
		});

		// initialise page slide checkers for side contact buttons on course pages
		var contactButtonElems = document.querySelectorAll('.inner_page_contact_button'),
			contactButtons = [];
		for (var i = 0; i < contactButtonElems.length; i++) {
			contactButtons.push( new ElemPageSlideChecker({
				elem: contactButtonElems[i],
				pageScrollerElem: scrollScreenPageElem
			}) );
		}

		// initialise wave animation for side contact buttons on course pages
		var containerElem = document.querySelector('.inner_page_contact_button_container');
		if (containerElem) {
			var sideContactButtonWave = new SideContactButtonWave({
				elemsArr: Array.prototype.slice.call(contactButtonElems),
				containerElem: containerElem
			});
		}

		// initialise page slide scroller (for pages where are page slides)
		var scrollToSlide = new ScrollToSlide({
			scrollDuration: 600
		});
	}

	// initialise contact forms modal with tabs
	var modalTabsContainerElem = document.querySelector('.modal_contacts_tabs');
	if (modalTabsContainerElem) {
		var modalContactsTabsController = new ContactsModalController({
			elem: modalTabsContainerElem
		});

		var modalContactsTabs = new Tabs({
			elem: modalTabsContainerElem,
			transitionDuration: 0.15
		});
	}

	// initialise before leave modal
	var beforeLeaveModalElem = document.querySelector('.modal_before_leave');
	if (beforeLeaveModalElem) {
		var beforeLeaveModal = new BeforeLeaveModalController({
			elem: beforeLeaveModalElem
		});
	}

	// initialise tabs on course start date slide on course pages
	var tabsContainerElem = document.querySelector('.tabs_container');
	if (tabsContainerElem) {
		var tabs = new Tabs({
			elem: tabsContainerElem,
			transitionDuration: 0.15
		});
	}

	// initialise dropdown group on course program page slide on course pages
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

	// initialise feedback slider on course pages
	var mainSliderElem = document.querySelector('#main_slider');
	if (mainSliderElem) {
		var mainSlider = new Slider({
			elem: mainSliderElem,
			delay: 0
		});
	}

	// initialise all custom placeholders
	var customPlaceholderElemArr = document.querySelectorAll('.custom_placeholder');
	if (customPlaceholderElemArr.length > 0) {
		var customPlaceholderArr = [];

		for (var i = 0; i < customPlaceholderElemArr.length; i++) {
			customPlaceholderArr[i] = new AnimatedPlaceholder({
				elem: customPlaceholderElemArr[i]
			});
		}
	}

	// initialise contact form from contact form section (courses, online courses)
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
	// initialise contact form on contact modal in contact form tab
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
	// initialise contact form on contact modal in callback form tab
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
	// initialise contact form on before leave modal
	var modalBeforeLeaveCallbackFormElem = document.querySelector('#modal_bewfore_leave_callback_form');
	if (modalBeforeLeaveCallbackFormElem) {
		var modalBeforeLeaveCallbackForm = new ContactFormController({
			elem: modalBeforeLeaveCallbackFormElem,
			actionUrl: modalBeforeLeaveCallbackFormElem.action,
			succsessNotificationHTML: '<div class="success_notification">' +
				'<p>Ваша заявка принята!</p>' +
				'<p>Наши менеджеры свяжутся с вами в ближайшее время ;)</p>' +
				'</div>'
		});
	}

	// object with key-value pairs which represent page class and option value in course select resprectivelly
	var courseSelectDefaultValuesObj = {
		'page-java_android': 'android',
		'page-contextual_advertising': 'context_ads',
		'page-web_design': 'webdesign',
		'page-english_for_it': 'it_eng',
		'page-front_end': 'frontend',
		'page-hr': 'hr',
		'page-java': 'java',
		'page-java_advanced': 'java',
		'page-javascript': 'js',
		'page-php': 'php',
		'page-pm': 'pm',
		'page-qa_automation': 'aqa',
		'page-qa': 'qa',
		'page-it_sales': 'sales',
		'page-seo': 'seo',
		'page-smm': 'smm',
		'page-copyright': 'copyright',
	}

	// get page class from document element and find course select option value in courseSelectDefaultValuesObj
	var htmlElemClassListArr = Array.prototype.slice.call(document.documentElement.classList, 0),
		courseSelectDefaultValue = false;
	for (var i = 0; i < htmlElemClassListArr.length; i++) {
		if (courseSelectDefaultValuesObj[htmlElemClassListArr[i]]) {
			courseSelectDefaultValue = courseSelectDefaultValuesObj[htmlElemClassListArr[i]];
			i = htmlElemClassListArr.length;
		}
	}

	// if course select option value was found then set it as active in course selects on the current page
	if (courseSelectDefaultValue) {
		var contactCourseSelect = document.querySelector('#contact_form-course_select');
		if (contactCourseSelect) {
			contactCourseSelect.setOption({value: courseSelectDefaultValue});
		}
		var modalContactCourseSelect = document.querySelector('#modal_contact_form-course_select');
		if (modalContactCourseSelect) {
			modalContactCourseSelect.setOption({value: courseSelectDefaultValue});
		}
	}

	// initialise google map (contacts page)
	var mapElem = document.querySelector('.map');
	if (mapElem) {
		var pos = {lat: 49.99335, lng: 36.23237};
		var gMap = new GMapController({
			elem: mapElem,
			gMapLoaded: gMapLoaded,
			gMapOptions: {
				zoom: 18,
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
			},
			{
				icon: 'img/icon_subway.png',
				position: {lat: 49.993262, lng: 36.231644},
				title: 'Метро "Исторический музей"'
			},
			{
				icon: 'img/icon_subway.png',
				position: {lat: 49.993027, lng: 36.231606},
				title: 'Метро "Исторический музей"'
			}]
		});
	}

	// initialise teacher block controller on course pages
	var teacherBlockElem = document.querySelector('.course_teacher_block');
	if (teacherBlockElem) {
		var teacherBlockController = new TeacherBlockController({
			elem: teacherBlockElem.querySelector('.course_teacher_block_content'),
			pageSlideElem: teacherBlockElem,
			mainTitleElem: teacherBlockElem.querySelector('.main_title'),
			circleBlockElem: teacherBlockElem.querySelector('.teacher_img_outer_container'),
			firstBlockElem: teacherBlockElem.querySelector('.teacher_about'),
			secondBlockElem: teacherBlockElem.querySelector('.teacher_skills'),
			thirdBlockElem: teacherBlockElem.querySelector('.teacher_expirience')
		});
	}

	// initialise svg graph on course pages
	var svgGraphElem = document.querySelector('.graph');
	if (svgGraphElem) {
		var svgGraph = new SvgGraph({
			elem: svgGraphElem,
			container: document.querySelector('.svg_graph_container'),
			yLabelsPrefix: '$'
		});
	}

	// initialise course info height controller on course pages
	var courseInfoElem = document.querySelector('#course_info');
	if (courseInfoElem) {
		var heightController = new CourseInfoHeight({
			elem: courseInfoElem
		});
	}

	// initialise tabs on course info slide on course pages
	var courseInfoTabsContainerElem = document.querySelector('.course_info_tabs_container');tabs
	if (courseInfoTabsContainerElem && courseInfoTabsContainerElem.querySelector('.tabs')) {
		var courseInfoTabs = new Tabs({
			elem: courseInfoTabsContainerElem,
			transitionDuration: 0.15
		});
	}

	// initalise circling contact buttons from footer in right bottom corner (index page, contacts page)
	var rightPanel = document.querySelector('footer .right_panel');
	if (rightPanel)  {
		var footerCirclesController = new FooterCirclesController({
			elem: rightPanel
		});
	}

	// initialise online courses button
	var onlineCoursesBtnElem = document.querySelector('.page-index .online_courses_btn');
	if (onlineCoursesBtnElem)  {
		var onlineCoursesBtn = new OnlineBtnController({
			elem: onlineCoursesBtnElem,
		});
	}

})();
