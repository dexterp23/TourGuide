function WelcomePage () {
	
	clearInterval(global_countdownInterval);
	$.ui.launch();
	nextPage('WelcomePage');
	$.ui.clearHistory();
	
	ToursListPage();
	
	//resetujemo data
	global_tours_data['ID_tours'] = 0;
	global_ID_check_point_key = null;
	global_point_page_chk = 0;
	
	//gasimo player
	$('.footer_player').hide();
	$('.footer_desc').show();
	if (global_audio_array.length > 0) {
		AudioPlayerStop();
	}
	
	//gasimo navigaciju
	navigator.geolocation.clearWatch(global_geolocationWatchTimer);
	global_geolocationWatchTimer_chk = 0;
	
}



function ToursListPage () {
	
	$.ui.showMask();
	
	jQuery.ajax({
		url: global_host + '/action_mobile.php',
		dataType: 'jsonp',
		data: {page: 'ToursList', lang: global_lang, ID_users: global_login_data['ID_users']},
		timeout: global_ajax_timeout,
		success: function(dataReceived) {

			$.ui.hideMask();
			
			var html = '';
			
			if (dataReceived[0].length > 0) {
				for (var key in dataReceived[0]) {
					
					html += ToursList_html (dataReceived[0][key]);
					
				}
			}

			
			if (dataReceived[0].length == 0) html += '<li>No Tours</li>';
			
			$('#WelcomePage .search_results_hold').html(html);

		},
		error : function() {
			$.ui.hideMask();
			custom_alert ("Cannot connect to server, please try again.", "NoNetAlert");
		}
	});
	
}



function ToursList_html (data) {
	
	var html = '';
	var html_hold = '';
	var br = 0;
	var img_style = '';
	
	html_hold += '<div class="hold">';
		if (data['description']) {
			html_hold += '<div class="subtext icon fa-tag">'+data['description']+'</div>';
			br++;
		} else {
			html_hold += '<div class="subtext">&nbsp;</div>';
			br++;
		}
	html_hold += '</div>';
	
	if (br > 4) img_style = 'margin-bottom: '+((br - 4) * 22)+'px';
	
	html += '<li class="content join_button">';
			html += '<a href="javascript: void(0);" onClick="TourPage('+data['ID_tours']+');">';
			html += '<div class="join"></div>';
			html += '<div class="title">'+data['title']+'</div>';
			html += '<img src="'+data['photo']+'" style="height: 80px; width: 80px; '+img_style+'" />';
			html += html_hold;
		html += '</a>';
	html += '</li>';
	
	return html;
	
}



function TourPage (ID_tours) {
	
	global_ID_tours = ID_tours;
	
	if (global_tours_data['ID_tours'] != global_ID_tours) {
	
		$.ui.showMask();
		
		if (local_chk == 1 || local_chk == 20 || local_chk == 14) {
			updateLocation ('UserLocationOnMap();', true);
		} else {
			updateLocationTest ('UserLocationOnMap();', true);
		}
		
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
				
				var html = '';
				if (global_points_data.length > 0) {
					for (var key in global_points_data) {
						
						html += PointsList_html (global_points_data[key], key);
						
					}
				}
				if (global_points_data.length == 0) html += '<li>No Check Points</li>';
				
				$('#TourPage_2 .tour_list_hold').html(html);
				$('#TourPage h1, #TourPage_2 h1').html(global_tours_data['title']);
		
				nextPage('TourPage');
				$.ui.clearHistory();

				//setujemo mapu
				$('#TourPage .tour_map_hold').css({'width':global_width+'px', 'height':(global_height - 50 - 50 - 40)+'px'});
				var homeLatlng = new google.maps.LatLng(global_latitude,global_longitude);
				
				global_tour_map = new google.maps.Map(document.getElementById('tour_map'), {
				  center: homeLatlng,
				  zoom: 16
				});
				global_tour_map.setCenter(homeLatlng);

				for (var key in global_points_data){
					AddLocatiOnMap(key);
				}
				
				
				//PointPageChk (0); //test
				//global_ID_check_point_key = 0;
				//PointPage();
				/*
				$('.footer_desc').hide();
				$('.footer_player').show();
				AudioPlayer_Data ('song', 1);				
				setTimeout(function() {
					AudioPlayerUpdate ('audio_end');
				}, 5000);
				*/
				
			},
			error : function() {
				$.ui.hideMask();
				custom_alert ("Cannot connect to server, please try again.", "NoNetAlert");
			}
		});
	
	} else {
	
		nextPage('TourPage');
		$.ui.clearHistory();
		$('header #backButton').attr("onClick","WelcomePage();");
		if (global_geolocationWatchTimer_chk == 0) {
			if (local_chk == 1 || local_chk == 20 || local_chk == 14) {
				updateLocation ('UserLocationOnMap();', true);
			} else {
				updateLocationTest ('UserLocationOnMap();', true);
			}
		} else {
			UserLocationOnMap();
		}
		
	}
	
}



function TourPage_MapTab () {
	nextPage('TourPage');
	$.ui.clearHistory();
	/*
	$('#TourPage .tour_list_hold').hide(); 
	$('#TourPage .tour_map_hold').show(); 
	$('#top_menu_page .completed').removeClass('top_menu_opacity'); 
	$('#top_menu_page .remaining').addClass('top_menu_opacity');	
	*/
}



function TourPage_ListTab () {
	
	nextPage('TourPage_2');
	$.ui.clearHistory();
	/*
	$('#TourPage .tour_map_hold').hide(); 
	$('#TourPage .tour_list_hold').show(); 
	$('#top_menu_page .remaining').removeClass('top_menu_opacity'); 
	$('#top_menu_page .completed').addClass('top_menu_opacity');
	*/
}




function UserLocationOnMap () {
	
	if (typeof(global_user_location_infowindow) !== 'undefined') global_user_location_infowindow.close();
	if (typeof(global_user_location_marker) !== 'undefined') global_user_location_marker.setMap(null);
	
	var infowindow = new google.maps.InfoWindow({
	  content: '<div style="font-weight:bold; color: black;">Your Location</div>'
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



function AddLocatiOnMap (key) {
	
	var data = global_points_data;
	var key_next = parseInt(key)+1;
	if (typeof(data[key_next]) == 'undefined') key_next = parseInt(key);
	var color = '#FFD62F';
	if (key == 0 || parseInt(global_points_data.length) == parseInt(key)+1) color = '#f25151';
	var html;
	
	html = '';
	html += '<div style="font-weight:bold; margin-bottom:5px; color: black;">'+data[key]['title']+'</div>';
	html += '<img src="'+data[key]['photo']+'" />';
	//html += '<div style="margin-bottom:5px; color: black;">'+data[key]['description']+'</div>';
	html += '<a href="javascript: void(0);" onclick="PointPageChk('+key+');" class="page_button">START</a>';
	
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
	var currentCity = new google.maps.Marker({
		position: LocationLatlng,
		title: data[key]['title'],
		html: html,
		icon: circle
	});
	currentCity.setMap(global_tour_map);
	var infowindow =  new google.maps.InfoWindow({});
	
	google.maps.event.addListener(currentCity, 'click', function() {
		if (typeof(global_infowindow) !== 'undefined') global_infowindow.close();
		infowindow.setContent(this.html);
		infowindow.setPosition(this.LocationLatlng);
		infowindow.open(global_tour_map, this);
		global_infowindow = infowindow;
	});
	
	
	//direction
	if (parseInt(key) != key_next) {
		var request = {
		  origin:new google.maps.LatLng(parseFloat (data[key]['lat']), parseFloat (data[key]['lng'])),
		  destination:new google.maps.LatLng(parseFloat (data[key_next]['lat']), parseFloat (data[key_next]['lng'])),
		  travelMode: google.maps.TravelMode.DRIVING, //DRIVING, WALKING, BICYCLING 
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




function PointsList_html (data, key) {
	
	var html = '';
	var html_hold = '';
	var br = 0;
	var img_style = '';
	
	html_hold += '<div class="hold">';
		if (data['description']) {
			html_hold += '<div class="subtext icon fa-tag">'+data['description']+'</div>';
			br++;
		} else {
			html_hold += '<div class="subtext">&nbsp;</div>';
			br++;
		}
	html_hold += '</div>';
	
	if (br > 4) img_style = 'margin-bottom: '+((br - 4) * 22)+'px';
	
	html += '<li class="content join_button">';
			html += '<a href="javascript: void(0);" onClick="PointPageChk('+key+');">';
			html += '<div class="select"></div>';
			html += '<div class="title">'+data['title']+'</div>';
			html += '<img src="'+data['photo']+'" style="height: 80px; width: 80px; '+img_style+'" />';
			html += html_hold;
		html += '</a>';
	html += '</li>';
	
	return html;
	
}




function PointPageChk (key) {
	
	$.ui.showMask();
	nextPage('BlankoPage');
	
	if (typeof(key) == 'undefined') key = global_ID_check_point_key;
	
	setTimeout(function() {
		
		$('.footer_desc').hide();
		$('.footer_player').show();
		
		if (global_ID_check_point_key == key) {
			if (global_point_distance_chk == 0) {
				nextPage('PointPageDirection');
				$.ui.clearHistory();
				global_direction_map.setZoom(16);
				$('header #backButton').attr("onClick","TourPage("+global_ID_tours+");");
				$.ui.hideMask();
			} else {
				PointPage(); //user je na pointu
			}
		} else {
			if (typeof(key) !== 'undefined') global_ID_check_point_key = key;
			global_point_distance_chk = 0;
			global_point_page_chk = 0;
			global_audio_end_chk = 0;
			PointPageDirection(); //user tek treba da dodje do pointa
		}

	}, 500);	
	
}



function PointPageDirection () {
	
	navigator.geolocation.clearWatch(global_geolocationWatchTimer);
	global_geolocationWatchTimer_chk = 0;
	
	$('#PointPageDirection h1').html(global_points_data[global_ID_check_point_key]['title']);
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
	var currentCity = new google.maps.Marker({
		position: LocationLatlng,
		title: global_points_data[global_ID_check_point_key]['title'],
		html: '<div style="font-weight:bold; color: black;">'+global_points_data[global_ID_check_point_key]['title']+'</div>',
		icon: circle
	});
	currentCity.setMap(global_direction_map);
	var infowindow =  new google.maps.InfoWindow({});
	var html_destination = '';
	html_destination += '<div style="font-weight:bold; color: black;">'+global_points_data[global_ID_check_point_key]['title']+'</div>';
	html_destination += '<a href="javascript: void(0);" onclick="global_point_distance_chk = 1; PointPageChk();" class="page_button">GO</a>';
	infowindow.setContent(html_destination);
	infowindow.open(global_direction_map, currentCity);
	google.maps.event.addListener(currentCity, 'click', function() {
		infowindow.setContent(this.html);
		infowindow.setPosition(this.LocationLatlng);
		infowindow.open(global_tour_map, this);
	});
	//circle point location end
	
	if (local_chk == 1 || local_chk == 20 || local_chk == 14) {
		updateLocation ('PointPageDirection_2();', false);
	} else {
		updateLocationTest ('PointPageDirection_2();', false);
	}
	if (global_audio_array.length > 0) AudioPlayerStop();
	AudioPlayer_Data ('song', 1);
	setTimeout(function() {
		if (global_point_page_chk == 0 && AudioPlayer_Data ('audio_start', 0)) AudioPlayerUpdate ('audio_start');
	}, 5000);
	
}



function PointPageDirection_2 () {
	
	if (typeof(global_currentCity) !== 'undefined') global_currentCity.setMap(null);
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
	var currentCity = new google.maps.Marker({
		position: LocationLatlng,
		title: 'Your Location',
		html: '<div style="font-weight:bold; color: black;">Your Location</div>',
		icon: circle
	});
	currentCity.setMap(global_direction_map);
	global_currentCity = currentCity;
	var infowindow =  new google.maps.InfoWindow({});
	infowindow.setContent('<div style="font-weight:bold; color: black;">Your Location</div>');
	infowindow.open(global_direction_map, currentCity);
	google.maps.event.addListener(currentCity, 'click', function() {
		infowindow.setContent(this.html);
		infowindow.setPosition(this.LocationLatlng);
		infowindow.open(global_tour_map, this);
	});
	//circle user location end

	//direction
	var request = {
	  origin:new google.maps.LatLng(global_latitude, global_longitude),
	  destination:new google.maps.LatLng(parseFloat (global_points_data[global_ID_check_point_key]['lat']), parseFloat (global_points_data[global_ID_check_point_key]['lng'])),
	  travelMode: google.maps.TravelMode.DRIVING, //DRIVING, WALKING, BICYCLING 
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
			if (distance > 50) { //metara
				directionsDisplay.setDirections(response);
				if (distance < 100 && global_audio_end_chk == 0 && AudioPlayer_Data ('audio_end', 0)) {
					AudioPlayerUpdate ('audio_end');
					global_audio_end_chk = 1;
				}
			} else {
				global_point_distance_chk = 1;
				PointPageChk(); //user je na pointu	
			}
		}
	});	
	
}



function PointPage () {
	
	global_audio_end_chk = 1;
	navigator.geolocation.clearWatch(global_geolocationWatchTimer);
	global_geolocationWatchTimer_chk = 0;
	if (typeof(global_infowindow) !== 'undefined') global_infowindow.close();
	
	//odredjujemo koji je next point
	var key_next = parseInt(global_ID_check_point_key) + 1;
	if (typeof(global_points_data[key_next]) == 'undefined') key_next = 0;
	
	$('#PointPage h1').html(global_points_data[global_ID_check_point_key]['title']);
	$('#PointPage .photo_hold').html('<img src="'+global_points_data[global_ID_check_point_key]['photo']+'" />');
	$('#PointPage .desc_hold').html(global_points_data[global_ID_check_point_key]['description']);
	$('.footer_player').show();
	$('.footer_desc').hide();
	nextPage('PointPage');
	$.ui.clearHistory();
	$.ui.hideMask();
	$('header #backButton').attr("onClick","TourPage("+global_ID_tours+");");
	if (key_next > 0) {
		$('#top_menu_page .next_point').attr("onClick","PointPageChk("+key_next+");").html('NEXT POINT');
	} else {
		$('#top_menu_page .next_point').attr("onClick","TourPage("+global_ID_tours+");").html('TOUR END');
	}
	
	if (global_point_page_chk == 0) {
		global_point_page_chk = 1;
		AudioPlayerStop();
		setTimeout(function() {
			AudioPlayer_Data ('point_desc', 1);
		}, 100);
	} 
}




function AudioPlayer_Data (type, chk) {
	
	global_audio_array = new Array();
	var data;
	var audio;
	var duration;
	var replay;
	
	switch(type) {
		case "audio_end":
			data = global_points_data[global_ID_check_point_key];
			audio = data['audio_end'];
			duration = data['duration_end'];
			replay = 0;
		break;
		case "audio_start":
			data = global_points_data[global_ID_check_point_key];
			audio = data['audio_start'];
			duration = data['duration_start'];
			replay = 0;
		break;
		case "song":
			data = global_tours_data;
			audio = data['song'];
			duration = data['song_duration'];
			replay = 1;
		break;
		case "point_desc":
			data = global_points_data[global_ID_check_point_key];
			audio = data['audio_desc'];
			duration = data['duration_desc'];
			replay = 0;
			if (!audio) {
				audio = global_tours_data['song'];
				duration = global_tours_data['song_duration'];
			}
		break;
	}
	
	global_audio_array.push({'audio':audio, 'duration':duration, 'replay':replay});
	
	if (audio && chk == 1) AudioPlayer ();
	if (chk == 0) return audio;

}



function AudioPlayer () {
	
	var audio = global_audio_array[0]['audio'];
	var duration = global_audio_array[0]['duration'];
	var replay = global_audio_array[0]['replay'];
	
	if (global_audio_player !== null) {
		audioStop ();
		clearInterval(global_audio_timer);
		global_audio_timer = undefined;
		global_audio_play_chk = 0;
	}
	
	var class_current = $(".audio_button").attr('class');
	$(".audio_button").removeClass('stop');
	$(".audio_button").removeClass('spin');
	$(".footer_duration").html(TimeFormat(duration));
	
	if (class_current.indexOf("stop") > 0) { //stop
		global_audio_play_chk = 0;
	} else { //play
		
		global_audio_play_chk = 1;
		$(".audio_button").addClass('stop').addClass('spin');
		
		setTimeout(function() {
			audioLoad (audio);
			if (global_audio_update_chk == 2) {
				if (typeof(Media) == 'undefined') {
					audioSeekTo(duration - global_audio_update_time);
				} else {
					audioSeekTo((duration/1000) - global_audio_update_time);	
				}
				global_audio_update_chk = 0;
			}
			audioPlay ();
			if (typeof(Media) == 'undefined') {
				global_audio_player.addEventListener("timeupdate", AudioTimeUpdate);
				global_audio_player.duration = duration;
				global_audio_player.audio = audio;
			}
		}, 100);
		
		if (typeof(Media) == 'undefined') {
			
			//
			
		} else {
			
			var position;
			global_audio_timer = setInterval(function () {
				global_audio_player.getCurrentPosition(
					// success callback
					function (amp) {
						
						if ((position == amp && position > 1) || amp < 0) {
							AudioPlayer();
							if (replay == 1) setTimeout(function() { audioPlay(); }, 500);
							if (global_audio_update_chk == 1) {
								global_audio_update_chk = 2;
								AudioPlayer_Data ('song', 1);	
							}
						} else {
							position = amp;
							var time = ((duration/1000)-amp) * 1000;
							$(".footer_duration").html(TimeFormat(time));
							if (amp > 0) $(".audio_button").removeClass('spin');
							global_audio_player_duration = time;
						}
					},
					// error callback
					function (e) {
						AudioPlayer();
					}
				);
			}, 500);
			
		}
		
	}
	
	
}



function AudioPlayerUpdate (type) {
	
	AudioPlayerStop();
	global_audio_update_chk = 1;
	global_audio_update_time = global_audio_player_duration;
	AudioPlayer_Data (type, 1);
	
}



function AudioPlayerStop () {
	
	global_audio_update_chk = 0;
	$(".audio_button").addClass('stop');
	AudioPlayer ();
	
}



function AudioPlayerPause () {
	
	if (global_audio_play_chk > 0) { //pause
		audioPause();
		global_audio_play_chk = 0;
		$(".audio_button").removeClass('stop');
	} else { //play
		audioPlay();
		global_audio_play_chk = 1;
		$(".audio_button").addClass('stop');
	}
	
}




function AudioTimeUpdate (data) {
	
	var replay = global_audio_array[0]['replay'];
	
	if (global_browser == "Firefox") {
		var amp = data.originalTarget.currentTime;
	} else {
		var amp = data.srcElement.currentTime;
	}	
	
	if (amp >= data.target.duration || amp < 0) {
		AudioPlayer();
		if (replay == 1) setTimeout(function() { audioPlay(); }, 500);
		if (global_audio_update_chk == 1) {
			global_audio_update_chk = 2;
			AudioPlayer_Data ('song', 1);
		}
	} else {
		var time = (data.target.duration - amp) * 1000;
		if (isNaN (time) !== true) $(".footer_duration").html(TimeFormat(time));
		if (amp > 0) $(".audio_button").removeClass('spin');
		global_audio_player_duration = time;
	}
	
}








































