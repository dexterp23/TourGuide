function nextPage (idHash) {
	
	$.ui.loadContent(idHash,false,false,'slide');
	$.ui.disableSideMenu();
	global_current_page = idHash;

}


function GoBack () {
	
	$.ui.goBack();
	
}


function OpenSideMenu () {

	$.ui.enableSideMenu();
	$.ui.toggleSideMenu();
	
}


function custom_alert (text, id) {
	
	if (typeof(id) == 'undefined') id = "CustomAlert";
	
	var id_find = $('#NoNetAlert').attr('id');
	
	if (typeof(id_find) == 'undefined') {
	
		$("#afui").popup({ 
						id:id,
						title:global_app_title,
						message:text,
						cancelText:"OK", 
						cancelOnly:true
						});
						
	}
	
}


function openURL (url) {
	
	cordova.InAppBrowser.open(url, '_blank', 'location=yes');

}


function sizeIt () {
	$('#afui, #content').css({'height': global_height+'px'});
}


function getNetChk () {
	
	if (navigator.connection.type=="none") {
		$.ui.hideMask();
		custom_alert("No Internet connection, make sure you have coverage and try again.");
	} else {
		homePage ();
	}

}


function clear_form_elements(ele) {

    jQuery(ele).find(':input').each(function() {
        switch(this.type) {
            case 'password':
            case 'select-multiple':
            case 'select-one':
            case 'text':
			case 'tel':
			case 'email':
			case 'number':
            case 'textarea':
                jQuery(this).val('');
                break;
            case 'checkbox':
            case 'radio':
                this.checked = false;
        }
    });

}


function randomPassword (length) {
  chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  pass = "";
  for(x=0;x<length;x++)
  {
    i = Math.floor(Math.random() * 62);
    pass += chars.charAt(i);
  }
  return pass;
}


function htmlspecialchars (unsafe) {
  return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}


function htmlspecialchars_custom (unsafe) {
  return unsafe
      .replace(/&/g, "")
	  .replace(/&amp;/g,"")
	  .replace(/amp;/g,"")
      .replace(/</g, "")
	  .replace(/&lt;/g,"")
	  .replace(/lt;/g,"")
      .replace(/>/g, "")
	  .replace(/&gt;/g,"")
	  .replace(/gt;/g,"")
      .replace(/"/g, "")
	  .replace(/&quot;/g,"")
	  .replace(/quot;/g,"")
      .replace(/'/g, "")
	  .replace(/&#039;/g,"")
	  .replace(/#039;/g,"");
}


function addslashes(str) {
	str=str.replace(/\\/g,'\\\\');
	str=str.replace(/\'/g,'\\\'');
	str=str.replace(/\"/g,'\\"');
	str=str.replace(/\0/g,'\\0');
	return str;
}



function stripslashes(str) {
	str=str.replace(/\\'/g,'\'');
	str=str.replace(/\\&quot;/g,'\&quot;');
	str=str.replace(/\\"/g,'"');
	str=str.replace(/\\0/g,'\0');
	str=str.replace(/\\\\/g,'\\');
	return str;
}


function rand (min, max) {
	
    return Math.floor(Math.random() * (max - min + 1)) + min;

}


function number_format (number, decimals, dec_point, thousands_sep) {

    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');    }
    return s.join(dec);
}


//izbacuje odredjeni value iz niza
function removeItem(array, item){
	for(var i in array){
		if(array[i]==item){
			array.splice(i,1);
			break;
			}
	}
}


function fromJSDateToDate (type, date) {
	
	var new_date;
	var d = new Date(date);
	var day = d.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
		
	switch(type) {
		case 'usaDate':
			new_date = month + '/' + day + '/' + year;
		break;
		case 'dbDate':
			new_date = year + '-' + month + '-' + day;
		break;
	}
	
	return new_date;
	
}


function setCookie(cname, cvalue, exdays) {
	
	localStorage.setItem(cname, cvalue);
	
}


function getCookie(cname) {
	
	return localStorage.getItem(cname);
	
}


function removeCookie (cname) {
	
	localStorage.setItem(cname, '');
	
}


function getLocationNetChk (callback) {
	
	if (navigator.connection.type=="none") {
		$.ui.hideMask();
		custom_alert("No Internet connection, make sure you have coverage and try again.");
	} else {
		setTimeout(function(){updateLocation (callback, true);}, 0);
	}

}
function updateLocation (callback, clearWatch_chk) {
	
	//var test1 = rand(1,1000) + ' * gps start';
	//$('header h1').html(test1);
	
	global_geolocationWatchTimer_chk = 1;
	var options = {timeout: 15000, maximumAge: 11000, enableHighAccuracy: true };
														  								  
	global_geolocationWatchTimer = navigator.geolocation.watchPosition(function(position) {
		
																//var test2 = rand(1,1000) + ' * ' + position.coords.latitude;
																//$('header h1').html(test2);
																
																if (position.coords.accuracy < global_accuracy_value) {
																	global_latitude = position.coords.latitude; 
																	global_longitude = position.coords.longitude;
																	global_accuracy = position.coords.accuracy;
																	if (clearWatch_chk == true) {
																		navigator.geolocation.clearWatch(global_geolocationWatchTimer);
																		global_geolocationWatchTimer_chk = 0;
																	}
																	if (callback != false) setTimeout(callback, 100);
																	$.ui.hideMask();
																} else {
																	navigator.geolocation.clearWatch(global_geolocationWatchTimer);
																	global_geolocationWatchTimer_chk = 0;
																	updateLocation (callback, clearWatch_chk);
																}
															  },updateLocationError,options);
															  
	
}
function updateLocationError (error) {
	
	$.ui.hideMask();
	navigator.geolocation.clearWatch(global_geolocationWatchTimer);
	global_geolocationWatchTimer_chk = 0;
	if (global_current_page == "PointPageDirection") TourPage(global_ID_tours);
	custom_alert("Cannot determine current location, ensure location services are on for the app and try again.");
	//custom_alert('code: ' + error.code + '\n' + 'message: ' + error.message);
	//alert(JSON.stringify(error.message));
  
}



function updateLocationTest (callback, clearWatch_chk) {
	
	var coordinates_test = new Array();
	coordinates_test.push({'lat':'44.87902889711484', 'lng':'20.653866349783243'});
	coordinates_test.push({'lat':'44.87476910196427', 'lng':'20.652143617224397'});
	coordinates_test.push({'lat':'44.871153763713124', 'lng':'20.648988417413534'});
	coordinates_test.push({'lat':'44.869392510625886', 'lng':'20.64599194563914'});
	
	if (clearWatch_chk == true) {
		global_geolocationWatchTimer_chk = 0;
		global_latitude = coordinates_test[0]['lat'];
		global_longitude = coordinates_test[0]['lng'];
		setTimeout(callback, 100);
		$.ui.hideMask();
	}
	
	if (clearWatch_chk == false) {
		global_geolocationWatchTimer_chk = 1;	
	}

	
	if (global_geolocationWatchTimer_chk == 1) {
		
		if (global_coordinate_key_test == 0) {
			setTimeout(function() {
				if (global_coordinate_key_test > 3) global_coordinate_key_test = 0;
				global_latitude = coordinates_test[global_coordinate_key_test]['lat'];
				global_longitude = coordinates_test[global_coordinate_key_test]['lng'];
				setTimeout(callback, 100);
				global_coordinate_key_test = global_coordinate_key_test + 1;
				
				$.ui.hideMask();

			}, 1000);
		}
		
		setTimeout(function() {
			if (global_coordinate_key_test > 3) global_coordinate_key_test = 0;
			global_latitude = coordinates_test[global_coordinate_key_test]['lat'];
			global_longitude = coordinates_test[global_coordinate_key_test]['lng'];
			setTimeout(callback, 100);
			global_coordinate_key_test = global_coordinate_key_test + 1;
			
			if (global_coordinate_key_test <= 3) setTimeout(updateLocationTest (callback, clearWatch_chk), 100);
			$.ui.hideMask();
			
		}, 4000);
		
		setTimeout(function() {
			$.ui.hideMask();
		}, 1000);
		
	}
	
}



function TimeFormat (value) {
	
	value = value / 1000;
	
	var out="";
	var mins=0;
	var secs=0;
	
	mins=Math.floor(value/60);
	value=value%60;
	secs=Math.floor(value);
		
	if (mins) {
		out += mins + 'm ';
	}
	//if (secs) {
		out += secs + 's ';
	//}
		
	return out;

}


function TimeFormatMilliseconds (value) {
	
	value = value / 1000;
	
	var out="";
	var mins=0;
	var secs=0;
	var msecs=0;
	
	mins=Math.floor(value/60);
	value=value%60;
	secs=Math.floor(value);
	msecs=Math.floor((value % 1) * 100);
		
	if (mins) {
		out += mins + 'm ';
	}
	
	out += secs + 's ';
	out += msecs + 'ms ';
		
	return out;

}


function WhichBrowser () {
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    //M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    //if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    //return M.join(' ');
	return M[1];
}



//distanca izmedju dve tacke
function distanceCal(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}



function ScreenBrightness (type) {
	
	if (local_chk == 1 || local_chk == 20 || local_chk == 14) {
		
		if (window.cordova.plugins.Brightness) {
			  // set Brightness
			  //window.cordova.plugins.Brightness.setBrightness(0.3);
			  // prevents sleep
			  window.cordova.plugins.Brightness.setKeepScreenOn(type); //true
			  // returns normal behavior
			  window.cordova.plugins.Brightness.setKeepScreenOn(type); //false
		}
		
	}
	
}



/*
function audioLoad (audio) {
	
	if (typeof(Media) == 'undefined') {
		$('#audio_player_holder').remove();
		$('body').append('<audio id="audio_player_holder"><source src="'+audio+'" type="audio/mpeg" /></audio>');
		global_audio_player = document.getElementById('audio_player_holder');
		global_audio_player.load();
	} else {
		global_audio_player = new Media(audio, audioPlayonSuccess, audioPlayonError);
		if (global_platform != "iOS") {
			global_audio_player.setVolume('0.0');
			global_audio_player.play();
			global_audio_player.setVolume('0.0');
		}
	}
	
}

function audioPlay () {
	
	if (typeof(Media) !== 'undefined' && global_platform != "iOS") global_audio_player.setVolume('1.0');
    global_audio_player.play();
	
}

function audioStop () {
	
	if (typeof(Media) == 'undefined') {
		global_audio_player.pause();
	} else {
		global_audio_player.stop();
	}
	
}

function audioPause () {

	global_audio_player.pause();
	
}

function audioSeekTo (time) {

	if (typeof(Media) == 'undefined') {
		if (time > 0) time = time / 1000;
		global_audio_player.currentTime = time;
	} else {
		global_audio_player.seekTo(time);	
	}
	
}

function audioPlayonSuccess() {
    //console.log("playCordovaAudio():Audio Success");
}

function audioPlayonError(error) {
    //alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}
*/

/* ******************************** */


function AudioBackLoad (audio) {
	
	$('#audio_player_back_holder').remove();
	$('body').append('<audio id="audio_player_back_holder"><source src="'+audio+'" type="audio/mpeg" /></audio>');
	global_audio_back_player = document.getElementById('audio_player_back_holder');
	global_audio_back_player.load();
	global_audio_back_player.loop = true;
	AudioBackVolume (global_audio_back_volume_high);
	//global_audio_back_player.addEventListener("timeupdate", AudioBackTimeUpdate);
	//console.log (global_audio_back_player.readyState);
	
}

function AudioBackPlay () {
	
	if (global_audio_back_player.readyState == 4) {
		AudioBackPlay_2 ();
	} else {
		global_audio_back_player.oncanplay = function() {
			AudioBackPlay_2 ();
		}; 
	}
	
}

function AudioBackPlay_2 () {

	global_audio_back_player.play();
	
	$(".audio_back_button").removeClass('play');
	$(".audio_back_button").addClass('stop');
	$('.audio_back_button').attr("onClick","AudioBackPause();");
	
}

function AudioBackPause () {
	
    global_audio_back_player.pause();
	
	$(".audio_back_button").removeClass('stop');
	$(".audio_back_button").addClass('play');
	$('.audio_back_button').attr("onClick","AudioBackPlay();");
	
}

function AudioBackVolume (value) {
	
	global_audio_back_player.volume = value; 
	
}

function AudioBackTimeUpdate (data) {
	/*
	var ended = global_audio_back_player.ended; 
	if (ended == true) AudioBackPlay ();
	*/
}



function AudioLoad (audio, id) {
	
	var audio_holder = 'audio_player_holder_' + id;
	$('#' + audio_holder).remove();
	$('body').append('<audio id="'+audio_holder+'"><source src="'+audio+'" type="audio/mpeg" /></audio>');
	var audio_player = document.getElementById(audio_holder);
	global_audio_player_array[id] = audio_player;
	audio_player.load(); 
	AudioVolume (id, 1);
	
	audio_player.addEventListener("timeupdate", function(data){
		AudioTimeUpdate(data, id);
	});
	
}

function AudioPlay (id) {
	
	var audio_player = global_audio_player_array[id];
	global_audio_id_current = id;
	AudioBackVolume (global_audio_back_volume_low);
	
	if (audio_player.readyState == 4) {
		audio_player.play();
	} else {
		audio_player.oncanplay = function() {
			audio_player.play();
		}; 
	}
	
}

function AudioLocationPlay (id) {
	
	var audio_player = global_audio_player_array[id];
	global_audio_id_current = id;
	AudioBackVolume (global_audio_back_volume_low);
	audio_player.play();
	
	$(".player_button").removeClass('play');
	$(".player_button").addClass('stop');
	$('.player_button').attr("onClick","AudioLocationPause('"+id+"');");
	
}

function AudioPause (id) {
	
	var audio_player = global_audio_player_array[id];
    audio_player.pause();
	global_audio_id_current = '';
	
}

function AudioLocationPause (id) {
	
	var audio_player = global_audio_player_array[id];
    audio_player.pause();
	
	$(".player_button").removeClass('stop');
	$(".player_button").addClass('play');
	$('.player_button').attr("onClick","AudioLocationPlay('"+id+"');");
	
}

function AudioVolume (id, value) {
	
	var audio_player = global_audio_player_array[id];
	audio_player.volume = value; 
	
}

function audioSeekTo (id, time) {
	
	var audio_player = global_audio_player_array[id];
	if (time > 0) time = time / 1000;
	audio_player.currentTime = time;

}

function AudioTimeUpdate (data, id) {
	
	if (global_audio_id_current.indexOf("audio_desc_") >= 0) {
		if (global_browser == "Firefox") {
			var amp = data.originalTarget.currentTime;
		} else {
			var amp = data.srcElement.currentTime;
		}
		amp = amp * 1000;
		global_audio_slider.slider("value", amp);
	}
	
	var audio_player = global_audio_player_array[id];
	var ended = audio_player.ended; 
	
	//kada se zavrsi audio pustamo funkcije koje su na cekanju
	if (ended == true) {
		if (global_audio_id_current.indexOf("audio_desc_") >= 0) AudioLocationPause (id);
		global_audio_id_current = '';
		for (var key in global_functions_array){
			if (typeof(global_functions_array[key]['function']) !== 'undefined') {
				setTimeout(global_functions_array[key]['function'], 100);
				if (global_functions_array[key]['type'] == 1) {
					global_functions_array[key] = new Array();
					break;
				} else {
					global_functions_array[key] = new Array();
				}
			}
		}
		if (typeof(global_functions_array) == 'undefined' || global_functions_array.length == 0 || (typeof(global_functions_array[0]) !== 'undefined' && typeof(global_functions_array[0]['function']) == 'undefined')) AudioBackVolume (global_audio_back_volume_high);
	}
	
}






































