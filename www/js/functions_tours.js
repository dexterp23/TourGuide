function WelcomePage () {
	
	clearInterval(global_countdownInterval);
	$.ui.launch();
	nextPage('CitiesListPage');
	$.ui.clearHistory();
	
	ToursListPage();
	
	//resetujemo data
	global_tours_data['ID_tours'] = 0;
	global_ID_check_point_key = null;
	
	//gasimo player
	if (typeof(global_audio_back_player) !== 'undefined' && global_audio_back_player) AudioBackPause();
	if (global_audio_id_current) AudioPause (global_audio_id_current);
	global_functions_array = new Array();
	global_audio_end_chk = 2;
	
	//gasimo navigaciju
	navigator.geolocation.clearWatch(global_geolocationWatchTimer);
	global_geolocationWatchTimer_chk = 0;
	global_gps_chk = 0;
	global_geolocation_clear = 1;
	
	//setujemo screen
	ScreenBrightness(false);
	
}



function ToursListPage () {
	
	$.ui.showMask();
	
	if (global_geolocationWatchTimer_chk == 0) {
		global_geolocation_clear = 0;
		if (local_chk == 1 || local_chk == 20 || local_chk == 14) {
			updateLocation (false, true);
		} else {
			updateLocationTest (false, true);
		}
	}
	
	//setCookie ('user_tours', JSON.stringify([]), 3650); //reset cookie
	var user_tours = getCookie("user_tours");
	if (user_tours) global_user_tours_array = $.parseJSON(user_tours);
	
	jQuery.ajax({
		url: global_host + '/action_mobile.php',
		dataType: 'jsonp',
		data: {page: 'ToursList', lang: global_lang, ID_users: global_login_data['ID_users']},
		timeout: global_ajax_timeout,
		success: function(dataReceived) {
			
			$.ui.hideMask();
			
			var html_cities_list = '';
			var html_my_tours = '';
			var html_neara_me = '';
			
			if (dataReceived[0].length > 0) {
				for (var key in dataReceived[0]) {
					
					var ID_tours = dataReceived[0][key]['ID_tours'];
					var array_checkpoint = dataReceived[0][key]['array_checkpoint'];
					html_cities_list += ToursList_html (dataReceived[0][key]);
					if (jQuery.inArray(parseInt(ID_tours), global_user_tours_array) >= 0) html_my_tours += ToursList_html (dataReceived[0][key]);
					
					var neara_me_chk = 0
					for (var key_checkpoint in array_checkpoint) {
						var distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(parseFloat (global_latitude), parseFloat (global_longitude)), new google.maps.LatLng(parseFloat (array_checkpoint[key_checkpoint]['lat']), parseFloat (array_checkpoint[key_checkpoint]['lng'])));
						if (distance <= global_distance_near_me) {
							neara_me_chk = 1;
							break;
						}
					}
					
					if (neara_me_chk == 1) html_neara_me += ToursList_html (dataReceived[0][key]);
					
				}
			}

			
			if (!html_cities_list) html_cities_list += '<li class="no_list">No Tours</li>';
			$('#CitiesListPage .search_results_hold').html(html_cities_list);
			if (!html_my_tours) html_my_tours += '<li class="no_list">No Tours</li>';
			$('#MyToursPage .search_results_hold').html(html_my_tours);
			if (!html_neara_me) html_neara_me += '<li class="no_list">No Tours</li>';
			$('#NearMePage .search_results_hold').html(html_neara_me);
			
		},
		error : function() {
			$.ui.hideMask();
			if (global_net_chk == 0) custom_alert ("Cannot connect to server, please try again.", "NoNetAlert");
		}
	});
	
}



function ToursList_html (data) {
	
	var html = '';
	
	html += '<li>';
		html += '<a href="javascript: void(0);" onClick="TourPage('+data['ID_tours']+');">';
			html += '<div class="background_list" style="background-image: url('+data['photo']+');"></div>';
			html += '<div class="background_hold"></div>';
			html += '<div class="gps_type '+((parseInt(data['gps_type']) == 1) ? 'gps_type_1' : 'gps_type_2')+'"></div>';
			html += '<div class="content_hold">';
				html += '<div class="title ellipsis">'+data['title']+'</div>';
				html += '<div class="description ellipsis">'+data['description']+'&nbsp;</div>';
				html += '<div class="info">';
					html += data['checkpoint_num']+' Stops';
					html += '<span class="sep">|</span>';
					html += data['distance_tour']+' Miles';
					html += '<span class="sep">|</span>';
					html += data['duration_tour']+' Minutes';
					//html += '<span class="sep">|</span>';
					//html += data['gps_type']+' Tour';
				html += '</div>';
			html += '</div>';
		html += '</a>';
	html += '</li>';
	
	return html;
	
}



function ToursList_CitiesListTab () {
	nextPage('CitiesListPage');
	$.ui.clearHistory();
}



function ToursList_NyToursTab () {
	nextPage('MyToursPage');
	$.ui.clearHistory();
}



function ToursList_NearMePageTab () {
	nextPage('NearMePage');
	$.ui.clearHistory();
}



function TourPage (ID_tours) {
	
	//gasimo navigaciju
	navigator.geolocation.clearWatch(global_geolocationWatchTimer);
	global_geolocationWatchTimer_chk = 0;
	global_geolocation_clear = 1;
	
	ScreenBrightness(true);
	global_ID_tours = ID_tours;
	global_point_distance_chk = 0;
	
	if (jQuery.inArray(ID_tours, global_user_tours_array) < 0) {
		global_user_tours_array.push(ID_tours);
		setCookie ('user_tours', JSON.stringify(global_user_tours_array), 3650);
	}

	if (global_tours_data['ID_tours'] != global_ID_tours) {
	
		$.ui.showMask();
		
		if (global_geolocationWatchTimer_chk == 0) {
			global_geolocation_clear = 0;
			if (local_chk == 1 || local_chk == 20 || local_chk == 14) {
				updateLocation ('UserLocationOnMap();', true);
			} else {
				updateLocationTest ('UserLocationOnMap();', true);
			}
		}
		
		var skiped_checkpoints = getCookie("skiped_checkpoints");
		if (skiped_checkpoints) global_skiped_checkpoint_array = $.parseJSON(skiped_checkpoints);
		if (typeof(global_skiped_checkpoint_array[global_ID_tours]) == 'undefined') global_skiped_checkpoint_array[global_ID_tours] = new Array();
		var skiped_checkpoint_array = global_skiped_checkpoint_array[global_ID_tours];
		
		jQuery.ajax({
			url: global_host + '/action_mobile.php',
			dataType: 'jsonp',
			data: {page: 'TourPage', lang: global_lang, ID_tours: ID_tours, ID_users: global_login_data['ID_users']},
			timeout: global_ajax_timeout,
			success: function(dataReceived) {
				
				//console.log (dataReceived);
				
				$.ui.hideMask();
				
				global_settings_data = dataReceived[0];
				global_tours_data = dataReceived[1];
				global_points_data = dataReceived[2];
				global_points_data_hide = dataReceived[3];
				
				var html = '';
				if (global_points_data.length > 0) {
					for (var key in global_points_data) {
						
						var skiped = 0;
						if (jQuery.inArray(parseInt(key), skiped_checkpoint_array) >= 0) skiped = 1
						html += PointsList_html (global_points_data[key], key, skiped);
						
					}
				}
				if (global_points_data.length == 0) html += '<li>No Checkpoints</li>';
				
				$('#TourPage_2 .tour_list_hold').html(html);
				$('#TourPage h1, #TourPage_2 h1').html(global_tours_data['title']);
				$('#TourPage footer .text, #TourPage_2 footer .text').show();
				$('#TourPage footer .footer_back_button, #TourPage_2 footer .footer_back_button').hide();
		
				nextPage('TourPage');
				$.ui.clearHistory();
				
				$('#top_menu_page .button').removeClass('active');
				$('#top_menu_page .map').addClass('active');

				//pustamo background music
				AudioBackLoad (global_tours_data['song']);
				AudioBackPlay ();
				
				//ucitavamo audio od ture
				AudioLoad (global_tours_data['audio_on_start'], 'audio_on_start');
				AudioLoad (global_tours_data['audio_at_end'], 'audio_at_end');
				AudioLoad (global_tours_data['audio_left'], 'audio_left');
				AudioLoad (global_tours_data['audio_right'], 'audio_right');
				
				//pustamo audio pocetak ture
				AudioPlay ('audio_on_start');
				
				//setujemo distance
				SetMapDistance (global_tours_data['gps_type']);

				//setujemo mapu
				$('#TourPage .tour_map_hold').css({'width':global_width+'px', 'height':(global_height - 50 - 50 - 40)+'px'});
				var homeLatlng = new google.maps.LatLng(global_latitude,global_longitude);
				
				global_tour_map = new google.maps.Map(document.getElementById('tour_map'), {
				  center: homeLatlng,
				  zoom: 16
				});
				global_tour_map.setCenter(homeLatlng);

				for (var key in global_points_data){
					//ubacujemo lokacije na mapu
					var skiped = 0;
					if (jQuery.inArray(parseInt(key), skiped_checkpoint_array) >= 0) skiped = 1
					AddLocatiOnMap(key, skiped);
					
					//ucitavamo sve audio fajlove
					AudioLoad (global_points_data[key]['audio_start'], 'audio_start_'+key);
					AudioLoad (global_points_data[key]['audio_end'], 'audio_end_'+key);
					AudioLoad (global_points_data[key]['audio_desc'], 'audio_desc_'+key);
				}
				
				for (var key in global_points_data_hide){
					//ucitavamo sve audio fajlove za hide chacekpoint
					AudioLoad (global_points_data_hide[key]['audio_end'], 'audio_end_hide_'+key);
				}
				
				
				//PointPageChk (0); //test
				//global_ID_check_point_key = 0;
				//PointPage();
				/*
				AudioPlayer_Data ('song', 1);				
				setTimeout(function() {
					AudioPlayerUpdate ('audio_end');
				}, 5000);
				*/
				
			},
			error : function() {
				$.ui.hideMask();
				if (global_net_chk == 0) custom_alert ("Cannot connect to server, please try again.", "NoNetAlert");
			}
		});
	
	} else {
		
		$('#TourPage footer .footer_back_button, #TourPage_2 footer .footer_back_button').show();
		$('#TourPage footer .text, #TourPage_2 footer .text').hide();
		
		nextPage('TourPage');
		$.ui.clearHistory();
		$('header #backButton').attr("onClick","WelcomePage();");
		$('#top_menu_page .button').removeClass('active');
		$('#top_menu_page .map').addClass('active');
		
		if (global_geolocationWatchTimer_chk == 0) {
			global_geolocation_clear = 0;
			if (local_chk == 1 || local_chk == 20 || local_chk == 14) {
				updateLocation ('UserLocationOnMap();', true);
			} else {
				updateLocationTest ('UserLocationOnMap();', true);
			}
		} else {
			UserLocationOnMap();
		}
		
		//setujemo marker
		OpenCurrentPointMarker();
		
		//gasimo audio
		if (global_audio_id_current) AudioPause (global_audio_id_current);
		global_functions_array = new Array();
		global_audio_end_chk = 0;
		AudioBackVolume (global_audio_back_volume_high);
		
		//pustamo tour_end audio
		var key_next = parseInt(global_ID_check_point_key) + 1;
		if (typeof(global_points_data[key_next]) == 'undefined') {
			AudioPlay ('audio_at_end');
			$('footer .text').show();
			$('footer .footer_back_button').hide();
		}

	}

}



function TourPage_MapTab () {
	nextPage('TourPage');
	$.ui.clearHistory();
}



function TourPage_ListTab () {
	nextPage('TourPage_2');
	$.ui.clearHistory();
}




function UserLocationOnMap () {
	
	if (typeof(global_user_location_infowindow) !== 'undefined') global_user_location_infowindow.close();
	if (typeof(global_user_location_marker) !== 'undefined') global_user_location_marker.setMap(null);
	
	var infowindow = new google.maps.InfoWindow({
	  content: '<div style="font-weight:bold; color: black;">Your Location</div>',
	  disableAutoPan : true
	});
	
	var market_point = new google.maps.LatLng(global_latitude,global_longitude);
	
	var marker = new google.maps.Marker({
	  position: market_point,
	  map: global_tour_map,
	  title: 'Your Location'
	});
	global_user_location_marker = marker;
	
	infowindow.open(global_tour_map, marker);
	global_user_location_infowindow = infowindow;
	
	marker.addListener('click', function() {
	  infowindow.open(global_tour_map, marker);
	});
	
	//global_tour_map.panTo(market_point);
	
}



function AddLocatiOnMap (key, skiped) {
	
	var data = global_points_data;
	var key_next = parseInt(key)+1;
	if (typeof(data[key_next]) == 'undefined') key_next = parseInt(key);
	var color = '#FFD62F';
	if (key == 0 || parseInt(global_points_data.length) == parseInt(key)+1) color = '#f25151';
	if (skiped == 1)  color = '#cccccc';
	
	var html = '';
	html += '<div style="font-weight:bold; margin-bottom:5px; color: black;">#'+data[key]['checkpoint_br']+' '+data[key]['title']+'</div>';
	html += '<img src="'+data[key]['thumb']+'" />';
	//html += '<div style="margin-bottom:5px; color: black;">'+data[key]['description']+'</div>';
	html += '<a href="javascript: void(0);" onclick="PointPageChk('+key+', true);" class="page_button">START</a>';
	html += '<a href="javascript: void(0);" onClick="SkipCheckpoint('+key+');" class="page_button">'+((skiped == 1) ? 'SKIPED' : 'SKIP')+'</a>';
	
	var LocationLatlng = new google.maps.LatLng(parseFloat (data[key]['lat']), parseFloat (data[key]['lng']));
	
	var circle = {
		path: google.maps.SymbolPath.CIRCLE,
		fillColor: color,
		fillOpacity: 1,
		scale: 7,
		strokeColor: 'black',
		strokeWeight: 1
	};
	
	//var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
	var marker = new google.maps.Marker({
		position: LocationLatlng,
		title: '#'+data[key]['checkpoint_br']+' '+data[key]['title'],
		html: html,
		icon: circle
	});
	marker.setMap(global_tour_map);
	var infowindow =  new google.maps.InfoWindow({});
	
	google.maps.event.addListener(marker, 'click', function() {
		if (typeof(global_infowindow) !== 'undefined') global_infowindow.close();
		
		if (typeof(global_tour_map_infowindow[key]['content']) !== 'undefined') {
			var content = global_tour_map_infowindow[key]['content'];
		} else {
			var content	= this.html;
		}
		
		infowindow.setContent(content);
		infowindow.setPosition(this.LocationLatlng);
		infowindow.open(global_tour_map, this);
		global_infowindow = infowindow;
	});
	
	global_tour_map_infowindow[key] = infowindow;
	global_tour_map_marker[key] = marker;
	
	//setujemo marker
	var key_count = parseInt (key) + 1;
	if (parseInt (key_count) == parseInt (global_points_data.length)) {
		setTimeout(function() {
			global_tour_map.setZoom(16);
			global_tour_map.panTo(new google.maps.LatLng(parseFloat (data[0]['lat']), parseFloat (data[0]['lng'])));	
			OpenCurrentPointMarker();
		}, 1500);
	}

	//direction
	if (parseInt(key) != key_next) {
		var request = {
		  origin:new google.maps.LatLng(parseFloat (data[key]['lat']), parseFloat (data[key]['lng'])),
		  destination:new google.maps.LatLng(parseFloat (data[key_next]['lat']), parseFloat (data[key_next]['lng'])),
		  travelMode: global_travelMode, //DRIVING, WALKING, BICYCLING 
		  avoidHighways: true,
		  unitSystem: google.maps.UnitSystem.IMPERIAL, //UnitSystem.METRIC, UnitSystem.IMPERIAL
		};
		
		var directionsService = new google.maps.DirectionsService();
		var directionsDisplay = new google.maps.DirectionsRenderer();

		directionsDisplay.setMap(global_tour_map);
		directionsDisplay.setOptions({
				suppressMarkers: true,
				polylineOptions: {
					strokeWeight: 2,
					strokeOpacity: 1,
					strokeColor:  '#4fc9f0' 
				}
			});
		directionsService.route(request, function (response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
			}
		});
	}
	//direction end

}




function OpenCurrentPointMarker () {

	//setujemo checkpoint onaj koji gledamo ili prvi na listi
	var id_checkpoint = global_ID_check_point_key;
	if (id_checkpoint == null) id_checkpoint = 0;
	var infowindow = global_tour_map_infowindow[id_checkpoint];
	var marker = global_tour_map_marker[id_checkpoint];
	infowindow.setContent(marker.html);
	infowindow.setPosition(marker.LocationLatlng);
	infowindow.open(global_tour_map, marker);
	global_infowindow = infowindow;
	
}




function PointsList_html (data, key, skiped) {
	
	var html = '';
	
	html += '<li class="checkpoint_id_'+key+'">';
		html += '<a href="javascript: void(0);" onClick="SkipCheckpoint('+key+');" class="skip_button page_button">'+((skiped == 1) ? 'SKIPED' : 'SKIP')+'</a>';
		html += '<a href="javascript: void(0);" onClick="PointPageChk('+key+');" class="link_hold '+((skiped == 1) ? 'skiped' : '')+'">';
			html += '<div class="background_list" style="background-image: url('+data['photo']+');"></div>';
			html += '<div class="background_hold"></div>';
			html += '<div class="content_hold">';
				html += '<div class="title ellipsis">#'+data['checkpoint_br']+' '+data['title']+'</div>';
				html += '<div class="description">'+data['description_short']+'&nbsp;</div>';
				/*
				html += '<div class="info">';
				html += '</div>';
				*/
			html += '</div>';
		html += '</a>';
	html += '</li>';
	
	return html;

}



function SkipCheckpoint (key) {
	
	var skiped_checkpoints = getCookie("skiped_checkpoints");
	if (skiped_checkpoints) global_skiped_checkpoint_array = $.parseJSON(skiped_checkpoints);
	
	if (typeof(global_skiped_checkpoint_array[global_ID_tours]) == 'undefined') global_skiped_checkpoint_array[global_ID_tours] = new Array();
	var skiped_checkpoint_array = global_skiped_checkpoint_array[global_ID_tours];
	
	var infowindow_html = global_tour_map_infowindow[key]['content'];
	if (typeof(infowindow_html) == 'undefined') infowindow_html = global_tour_map_marker[key]['html'];
	var infowindow_html_new = infowindow_html;
	if (jQuery.inArray(parseInt(key), skiped_checkpoint_array) < 0) {
		skiped_checkpoint_array.push(key);
		$('.checkpoint_id_'+key+' .link_hold').addClass('skiped');	
		$('.checkpoint_id_'+key+' .skip_button').html('SKIPED');
		var color = '#cccccc';	
		if (typeof(infowindow_html) !== 'undefined') infowindow_html_new = infowindow_html.replace("SKIP", "SKIPED");
	} else {
		removeItem (skiped_checkpoint_array, key);
		$('.checkpoint_id_'+key+' .link_hold').removeClass('skiped');
		$('.checkpoint_id_'+key+' .skip_button').html('SKIP');	
		var color = '#FFD62F';	
		if (key == 0 || parseInt(global_points_data.length) == parseInt(key)+1) color = '#f25151';
		if (typeof(infowindow_html) !== 'undefined') infowindow_html_new = infowindow_html.replace("SKIPED", "SKIP");
	}
	
	global_skiped_checkpoint_array[global_ID_tours] = skiped_checkpoint_array;
	setCookie ('skiped_checkpoints', JSON.stringify(global_skiped_checkpoint_array), 3650);	
	
	var circle = {
		path: google.maps.SymbolPath.CIRCLE,
		fillColor: color,
		fillOpacity: 1,
		scale: 7,
		strokeColor: 'black',
		strokeWeight: 1
	};
	var marker = global_tour_map_marker[key];
	var infowindow = global_tour_map_infowindow[key];
	marker.setIcon (circle);
	infowindow.setContent (infowindow_html_new);
	global_tour_map_marker[key] = marker;
	global_tour_map_infowindow[key] = infowindow;
	
}




function PointPageChk (key, push_chk) {
	
	//gasimo navigaciju
	navigator.geolocation.clearWatch(global_geolocationWatchTimer);
	global_geolocationWatchTimer_chk = 0;
	global_geolocation_clear = 1;
	
	if (typeof(key) == 'undefined' || key == 'undefined') key = global_ID_check_point_key;
	
	setTimeout(function() {
		
		if (global_ID_check_point_key == key) {
			if (global_point_distance_chk == 0) {
				$.ui.showMask();
				//nextPage('BlankoPage');
				nextPage('PointPageDirection');
				$.ui.clearHistory();
				global_direction_map.setZoom(16);
				$('header #backButton').attr("onClick","TourPage("+global_ID_tours+");");
				$.ui.hideMask();
				if (global_geolocationWatchTimer_chk == 0) {
					global_geolocation_clear = 0;
					if (local_chk == 1 || local_chk == 20 || local_chk == 14) {
						updateLocation ('PointPageDirection_2();', false);
					} else {
						updateLocationTest ('PointPageDirection_2();', false);
					}
				}
			} else {
				//user je na pointu
				if (global_current_page == "PointPageDirection" || push_chk == true) { //samo ako si na stranici chekpoint mape
				
					//pustamo audio za opis lokacije
					if (global_audio_id_current && (global_point_distance_chk == 0 || global_point_distance_chk == 2)) { //ako trenutno ide neki audio stavljamo na cekanje
						global_audio_end_chk = 2;
						global_functions_array.push({'function':'PointPage();', 'type':0});
						global_functions_array.push({'function':'AudioLocationPlay (\'audio_desc_'+global_ID_check_point_key+'\');', 'type':1});
					} else {
						PointPage();
						if (global_audio_id_current) AudioPause (global_audio_id_current);
						global_functions_array = new Array();
						AudioLocationPlay ('audio_desc_' + global_ID_check_point_key);
					}
				} //if (global_current_page == "PointPageDirection" || push_chk == true)
			}
		} else {
			$.ui.showMask();
			nextPage('BlankoPage');
			if (typeof(key) !== 'undefined') global_ID_check_point_key = key;
			global_point_distance_chk = 0;
			global_audio_end_chk = 0;
			PointPageDirection(); //user tek treba da dodje do pointa
			
			//pustamo audio pocetak lokacije
			if (global_audio_id_current) AudioPause (global_audio_id_current);
			global_functions_array = new Array();
			AudioPlay ('audio_start_' + global_ID_check_point_key);
			
		}

	}, 500);	
	
}



function PointPageDirection () {
	
	//gasimo navigaciju
	navigator.geolocation.clearWatch(global_geolocationWatchTimer);
	global_geolocationWatchTimer_chk = 0;
	global_geolocation_clear = 1;
	
	$('#PointPageDirection h1').html('#'+global_points_data[global_ID_check_point_key]['checkpoint_br']+' '+global_points_data[global_ID_check_point_key]['title']);
	nextPage('PointPageDirection');
	$.ui.clearHistory();
	$('header #backButton').attr("onClick","TourPage("+global_ID_tours+");");
	$('#PointPageDirection .direction_map_instructions').css({'width':(global_width+5)+'px'});
	$('#PointPageDirection .direction_map_instructions').html('');
	
	//setujemo mapu
	$('#PointPageDirection .tour_map_hold').css({'width':global_width+'px', 'height':(global_height - 50 - 40)+'px'});
	var homeLatlng = new google.maps.LatLng(global_latitude,global_longitude);
	
	global_direction_map = new google.maps.Map(document.getElementById('direction_map'), {
	  center: homeLatlng,
	  zoom: 16
	});
	global_direction_map.setCenter(homeLatlng);
	
	//circle point location
	var LocationLatlng = new google.maps.LatLng(parseFloat (global_points_data[global_ID_check_point_key]['lat']), parseFloat (global_points_data[global_ID_check_point_key]['lng']));
	var circle = {
		path: google.maps.SymbolPath.CIRCLE,
		fillColor: '#f25151',
		fillOpacity: 1,
		scale: 7,
		strokeColor: 'black',
		strokeWeight: 1
	};
	
	var html_destination = '';
	html_destination += '<div style="font-weight:bold; color: black;">#'+global_points_data[global_ID_check_point_key]['checkpoint_br']+' '+global_points_data[global_ID_check_point_key]['title']+'</div>';
	html_destination += '<img src="'+global_points_data[global_ID_check_point_key]['thumb']+'" />';
	html_destination += '<a href="javascript: void(0);" onclick="global_point_distance_chk = 1; PointPageChk();" class="page_button">VIEW</a>';
	var marker = new google.maps.Marker({
		position: LocationLatlng,
		title: '#'+global_points_data[global_ID_check_point_key]['checkpoint_br']+' '+global_points_data[global_ID_check_point_key]['title'],
		html: html_destination,
		icon: circle
	});
	marker.setMap(global_direction_map);
	var infowindow =  new google.maps.InfoWindow({});
	infowindow.setContent(html_destination);
	infowindow.open(global_direction_map, marker);
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(this.html);
		infowindow.setPosition(this.LocationLatlng);
		infowindow.open(global_tour_map, this);
	});
	//circle point location end
	
	if (global_geolocationWatchTimer_chk == 0) {
		global_geolocation_clear = 0;
		if (local_chk == 1 || local_chk == 20 || local_chk == 14) {
			updateLocation ('PointPageDirection_2();', false);
		} else {
			updateLocationTest ('PointPageDirection_2();', false);
		}
	}

}



function PointPageDirection_2 () {
	
	if (typeof(global_marker) !== 'undefined') global_marker.setMap(null);
	if (typeof(global_directionsDisplay) !== 'undefined') global_directionsDisplay.setMap(null);
	
	//circle user location
	var LocationLatlng = new google.maps.LatLng(parseFloat (global_latitude), parseFloat (global_longitude));
	var circle = {
		path: google.maps.SymbolPath.CIRCLE,
		fillColor: '#FFD62F',
		fillOpacity: 1,
		scale: 7,
		strokeColor: 'black',
		strokeWeight: 1
	};
	var html_destination = '';
	html_destination += '<div style="font-weight:bold; color: black;">Your Location</div>';
	var marker = new google.maps.Marker({
		position: LocationLatlng,
		title: 'Your Location',
		html: html_destination,
		icon: circle
	});
	marker.setMap(global_direction_map);
	global_marker = marker;
	var infowindow =  new google.maps.InfoWindow({});
	infowindow.setContent(html_destination);
	//infowindow.open(global_direction_map, marker);
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(this.html);
		infowindow.setPosition(this.LocationLatlng);
		infowindow.open(global_tour_map, this);
	});
	//circle user location end
	
	//distance between current location and hidden chackpoint
	if (global_points_data_hide.length > 0) {
		for (var key in global_points_data_hide) {
			var distance_hide = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(parseFloat (global_latitude), parseFloat (global_longitude)), new google.maps.LatLng(parseFloat (global_points_data_hide[key]['lat']), parseFloat (global_points_data_hide[key]['lng'])));
			if (global_distance_hide >= distance_hide && global_audio_end_chk == 0) { //ako je u distanci i nije setovano da se ne pusta audio
				if (global_audio_id_current) { //ako trenutno ide neki audio onda audio_before setujemo za kasnije
					if (global_points_data_hide[key]['audio_end_background_chk'] == 1) global_functions_array.push({'function':'AudioBackPause ();', 'type':0});
					global_functions_array.push({'function':'AudioPlay (\'audio_end_hide_'+key+'\');', 'type':1});
					if (global_points_data_hide[key]['audio_end_background_chk'] == 1) {
						var class_current = $(".audio_back_button").attr('class');	
						if (class_current.indexOf("stop") > 0) { 
							global_functions_array.push({'function':'AudioBackPlay ();', 'type':0});
							global_functions_array.push({'function':'AudioBackVolume ('+global_audio_back_volume_high+');', 'type':0});
						}
					}
				} else {
					AudioPlay ('audio_end_hide_' + key);
					if (global_points_data_hide[key]['audio_end_background_chk'] == 1) {
						var class_current = $(".audio_back_button").attr('class');	
						if (class_current.indexOf("stop") > 0) { 
							global_functions_array.push({'function':'AudioBackPlay ();', 'type':0});
							global_functions_array.push({'function':'AudioBackVolume ('+global_audio_back_volume_high+');', 'type':0});
						}
						AudioBackPause();
					}
				} //if (global_audio_id_current)
				break;
			} //if (global_distance_hide >= distance_hide && global_audio_end_chk == 0)
		} //for (var key in global_points_data_hide)
	} //if (global_points_data_hide.length > 0)

	//direction
	var request = {
	  origin:new google.maps.LatLng(global_latitude, global_longitude),
	  destination:new google.maps.LatLng(parseFloat (global_points_data[global_ID_check_point_key]['lat']), parseFloat (global_points_data[global_ID_check_point_key]['lng'])),
	  travelMode: global_travelMode, //DRIVING, WALKING, BICYCLING 
	  avoidHighways: true,
	  unitSystem: google.maps.UnitSystem.IMPERIAL, //UnitSystem.METRIC, UnitSystem.IMPERIAL
	};
	
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();

	directionsDisplay.setMap(global_direction_map);
	directionsDisplay.setOptions({
			suppressMarkers: true,
			polylineOptions: {
				strokeWeight: 2,
				strokeOpacity: 1,
				strokeColor:  '#4fc9f0' 
			}
		});
	global_directionsDisplay = directionsDisplay;
	directionsService.route(request, function (response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			var distance = response.routes[0].legs[0].distance.value;
			var duration = response.routes[0].legs[0].duration.text;
			var instructions = response.routes[0].legs[0].steps[0].instructions;
			if (typeof(response.routes[0].legs[0].steps[1]) !== 'undefined') {
				instructions += ' in ' + response.routes[0].legs[0].steps[0].distance.text + ' ' + response.routes[0].legs[0].steps[1].instructions
			}
			//instructions += '<div>Arrive in ' + duration + '</div>';
			$('#PointPageDirection .direction_map_instructions').html(instructions);
			if (distance > global_distance_on_point) { 
				directionsDisplay.setDirections(response);
				
				if (global_current_page == "PointPageDirection") { //samo ako si na stranici chekpoint mape
					//pustamo audio pred dolazak na lokaciju
					if (distance < global_distance_before_point && global_audio_end_chk == 0) { //ako smo dovoljno blizu a nije chekirano da je bio audio_before onda pustamo audio_before
						if (global_audio_id_current) { //ako trenutno ide neki audio onda audio_before setujemo za kasnije
							if (global_points_data[global_ID_check_point_key]['audio_end_background_chk'] == 1) global_functions_array.push({'function':'AudioBackPause ();', 'type':0});
							global_functions_array.push({'function':'AudioPlay (\'audio_end_'+global_ID_check_point_key+'\');', 'type':1});
							if (global_points_data[global_ID_check_point_key]['audio_end_background_chk'] == 1) {
								var class_current = $(".audio_back_button").attr('class');	
								if (class_current.indexOf("stop") > 0) { 
									global_functions_array.push({'function':'AudioBackPlay ();', 'type':0});
									global_functions_array.push({'function':'AudioBackVolume ('+global_audio_back_volume_high+');', 'type':0});
								}
							}
						} else {
							AudioPlay ('audio_end_' + global_ID_check_point_key);
							if (global_points_data[global_ID_check_point_key]['audio_end_background_chk'] == 1) {
								var class_current = $(".audio_back_button").attr('class');	
								if (class_current.indexOf("stop") > 0) { 
									global_functions_array.push({'function':'AudioBackPlay ();', 'type':0});
									global_functions_array.push({'function':'AudioBackVolume ('+global_audio_back_volume_high+');', 'type':0});
								}
								AudioBackPause();
							}
						}
						global_audio_end_chk = 1;
					}
				}
				
			} else {
				if (global_point_distance_chk == 0) {
					global_point_distance_chk = 2;
					PointPageChk(); //user je na pointu	
				}
			}
		}
	});	
	
}



function PointPage () {
	
	//gasimo navigaciju
	navigator.geolocation.clearWatch(global_geolocationWatchTimer);
	global_geolocationWatchTimer_chk = 0;
	global_geolocation_clear = 1;
	
	global_audio_end_chk = 1;
	if (typeof(global_infowindow) !== 'undefined') global_infowindow.close();
	
	var skiped_checkpoints = getCookie("skiped_checkpoints");
	if (skiped_checkpoints) global_skiped_checkpoint_array = $.parseJSON(skiped_checkpoints);
	if (typeof(global_skiped_checkpoint_array[global_ID_tours]) == 'undefined') global_skiped_checkpoint_array[global_ID_tours] = new Array();
	var skiped_checkpoint_array = global_skiped_checkpoint_array[global_ID_tours];
	
	//odredjujemo koji je next point
	var key_next = CheckpointKeyNext(skiped_checkpoint_array, 0);

	$('#PointPage .title_hold').html('<span class="diff_color">Stop #'+global_points_data[global_ID_check_point_key]['checkpoint_br']+':</span> '+global_points_data[global_ID_check_point_key]['title']);
	$('#PointPage .photo_hold').html('<img src="'+global_points_data[global_ID_check_point_key]['photo']+'" />');
	$('#PointPage .desc_hold').html(global_points_data[global_ID_check_point_key]['description']);
	
	//audio slider
	$('.audio_player .player_slider').css({'width': (global_width - 210) + 'px'});
	global_audio_slider = jQuery('footer .player_slider').slider({
		min: 0,
		max: global_points_data[global_ID_check_point_key]['duration_desc'],
		step: 100,
		slide: function( event, ui ) {
			var update_value = ui.value;
			$('footer .player_time').html(TimeFormat(update_value));
			audioSeekTo('audio_desc_'+global_ID_check_point_key, update_value);
		},
		change: function( event, ui ) {
			var update_value = ui.value;
			$('footer .player_time').html(TimeFormat(update_value));	
		},
	});
	
	nextPage('PointPage');
	$.ui.clearHistory();
	$.ui.hideMask();
	$('header #backButton').attr("onClick","TourPage("+global_ID_tours+");");
	/*
	//ima problem sa mapom i audio kada se odavde vrati na PointPageChk
	if (global_point_distance_chk == 1) {
		$('header #backButton').attr("onClick","PointPageChk();");
		global_point_distance_chk = 0;
	} else {
		$('header #backButton').attr("onClick","TourPage("+global_ID_tours+");");
	}
	*/
	if (key_next > 0) {
		$('#top_menu_page .next_point').attr("onClick","PointPageChk("+key_next+");").html('NEXT POINT');
	} else {
		$('#top_menu_page .next_point').attr("onClick","TourPage("+global_ID_tours+");").html('TOUR END');
	}
	
}



function CheckpointKeyNext (skiped_checkpoint_array, count) {
	
	count++;
	var key_next = parseInt(global_ID_check_point_key) + count;
	if (jQuery.inArray(parseInt(key_next), skiped_checkpoint_array) >= 0 && typeof(global_points_data[key_next]) !== 'undefined') {
		key_next = CheckpointKeyNext (skiped_checkpoint_array, count);
	} else if (typeof(global_points_data[key_next]) == 'undefined') {
		 key_next = 0;
	}

	return key_next;
	
}



function PhotoPage () {
	
	$.ui.hideMask();
	SocialSharingStart();
	
}







































