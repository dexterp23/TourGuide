var local_chk = 1; //0 ili 14 za testiranje
/*
0 - local app full
1 - mob app full
10 - local app, ima login
12 - local za mob, ima login
14 - local za mob, nema login
20 - mob app ima login
*/

if (local_chk == 1 || local_chk == 20) {
	var global_host = "http://tourguide.teamsnapp.com"; //hosting
} else if (local_chk == 0 || local_chk == 10 || local_chk == 12 || local_chk == 14) {
	//var global_host = "http://127.0.0.2/tour_guide"; //local
	var global_host = "http://192.168.0.13/tour_guide"; //local
}
//putanja u mobu: file://android_asset/www/

var global_app_title = "Tour Guide";
var global_ajax_timeout = 20000;//20sec
var global_login_data = new Array();
var global_latitude = 0;
var global_longitude = 0;
var global_accuracy;
var global_accuracy_value = 8000;
if (local_chk == 1 || local_chk == 20 || local_chk == 14) { //mob
	global_accuracy_value = 500;
} 
var global_list_pgg = new Array();
var global_search_results_by = 20;
var global_lang = "en";
var global_countdownInterval;
var global_browser;
var global_audio_back_player = null;
var global_audio_player_array = new Array();
var global_audio_id_current=  '';
var global_audio_back_volume_high = 0.5;
var global_audio_back_volume_low = 0.1;
var global_audio_volume_high = 1;
/*
var global_audio_player = null;
var global_audio_timer;
var global_audio_array = new Array();
var global_audio_play_chk = 0;
var global_audio_player_duration = 0;
var global_audio_update_chk = 0;
var global_audio_update_time = 0;
*/
var global_disclaimer_chk = 0;
var global_geolocationWatchTimer;
var global_geolocationWatchTimer_chk = 0;
var global_popup_scroll_slider;
var global_platform;
var global_model;
var global_width;
var global_height;
var global_settings_data = new Array();
var global_tours_data = new Array();
var global_points_data = new Array();
var global_points_data_hide = new Array();
var global_ID_check_point_key;
var global_ID_tours;
var global_tour_map;
var global_infowindow;
var global_direction_map;
var global_point_distance_chk = 0;
var global_coordinate_key_test = 0;
var global_marker
var global_directionsDisplay;
var global_user_location_infowindow;
var global_user_location_marker;
var global_before_point_chk = 0;
var global_current_page;
var global_distance_on_point; //setuje se na SetMapDistance
var global_distance_before_point; //setuje se na SetMapDistance
var global_travelMode; //setuje se na SetMapDistance
var global_distance_hide; //setuje se na SetMapDistance
var global_distance_near_me = 1600; //metara
var global_functions_array = new Array();
var global_audio_slider;
var global_net_chk = 0;
var global_gps_chk = 0;
var global_geolocation_callback = '';
var global_geolocation_clearWatch_chk = true;
var global_geolocation_clear = 0;
var global_tour_map_infowindow = new Array();
var global_tour_map_marker = new Array();
var global_user_tours_array = new Array();
var global_skiped_checkpoint_array = new Array();
var global_photo_callback;
var global_fileURL;


//data
// za sada smo iskljucili logovanje. u index.html je u meniju iskljuceno logout i my profile dugme
global_login_data['ID_users'] = 72; 
global_login_data['e_mail'] = "ivandexter26@yahoo.com";
global_login_data['f_name'] = "Tour";
global_login_data['l_name'] = "Guide";
/*
if (local_chk == 10 || local_chk == 12) { //local_chk == 99 nebi trebalo da bude ovde
	global_login_data['ID_users'] = 72; 
	global_login_data['e_mail'] = "ivandexter26@yahoo.com";
	global_login_data['f_name'] = "Tour";
	global_login_data['l_name'] = "Guide";
	//global_latitude = "34.1400687";
	//global_longitude = "-118.4061716";
} else if (local_chk == 20) {
	global_login_data['ID_users'] = 72; 
	global_login_data['e_mail'] = "ivandexter26@yahoo.com";
	global_login_data['f_name'] = "Tour";
	global_login_data['l_name'] = "Guide";
	//global_latitude = "34.1400687";
	//global_longitude = "-118.4061716";
}
*/
//data end


/* INIT */
	
	jQuery.noConflict();
	$.ui.autoLaunch = false;
	$.ui.animateHeaders = false;
	$.ui.useOSThemes = false;
	$.ui.autoLaunch = false;
			
	$(document).ready(function(){
		if (local_chk == 0 || local_chk == 10) { //local
			global_platform = "Android";
			$.ui.setSideMenuWidth('260px');
			loginSet();
			homePage();
		}
		global_browser = WhichBrowser();
	});
						
	
	var onDeviceReady=function(){                             // called when Cordova is ready
		if( window.Cordova && navigator.splashscreen ) {     // Cordova API detected
			$.ui.setSideMenuWidth('260px');
			$.ui.disableSideMenu();
			navigator.splashscreen.hide() ;                 // hide splash screen
			//global_platform = "iOS";
			if (local_chk == 1 || local_chk == 20 || local_chk == 12 || local_chk == 14) {
				document.addEventListener("offline", getNetChk, false);
				document.addEventListener("online", getNetChk, false);
				global_platform = device.platform;
				global_model = device.model;
				Keyboard.shrinkView(true);
				loginSet();
				homePage();
			}
		}
	} ;
	document.addEventListener("deviceready", onDeviceReady, false) ;
	window.addEventListener("resize", function(){ sizeIt(); }, false);

/* INIT END */




function homePage () {
	
	homePage_init ();
	
	//TourPage(1);
	/*
	setTimeout(function() {
		TourPage_ListTab ();
	}, 1000);
	/*
	setTimeout(function() {
		global_point_distance_chk = 1; 
		PointPageChk();
	}, 2000);
	*/
	//PointPageChk (0);
	//nextPage('test');

}


function homePage_init () {
	
	$.ui.hideMask();
	$.ui.clearHistory();
	clearInterval(global_countdownInterval);
	syncUser();
	global_width = window.innerWidth;
	global_height = window.innerHeight;
	StartApp();

}


function StartApp () {
	
	if (parseInt (global_login_data['ID_users']) > 0) {
		WelcomePage ();
	} else {
		loginPage ();
	}
	
}


function aboutPage () {
	
	nextPage('aboutPage');

}


