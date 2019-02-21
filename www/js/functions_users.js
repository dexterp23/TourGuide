function loginPage () {

	$.ui.launch();
	nextPage('loginPage');
	$.ui.clearHistory();

}


function loginSet () {
	
	var login_data = getCookie("login_data");
	if (login_data) global_login_data = $.parseJSON(login_data);
	
	if (parseInt (global_login_data['ID_users']) > 0) {
		
		$('.login_remove').hide();
		$('.login_show').show();
		
		var html = '';
		html += '<a href="javascript: void(0);" onClick="homePage();">';
			html += '<div class="title">'+global_login_data['l_name']+' '+global_login_data['f_name']+'</div>';
		html += '</a>';
		$('#login_user_box').html(html);
		
	} else {
		
		global_login_data = '';
		$('.login_remove').show();
		$('.login_show').hide();
		
	}
	
}


function syncUser () {
		
	var d = new Date();
	var day = d.getDate(); 
	var old_day = getCookie("syncUser_day");
	
	if (parseInt (global_login_data['ID_users']) > 0 && parseInt (old_day) != parseInt (day)) {
		
		$.ui.showMask();
		
		var uniq_id = global_login_data['uniq_id'];
		var e_mail = global_login_data['e_mail'];
		setCookie ('syncUser_day', day, 3650);
		
		jQuery.ajax({
			url: global_host + '/action_mobile.php',
			dataType: 'jsonp',
			data: {page: 'syncUser', lang: global_lang, e_mail: e_mail, uniq_id: uniq_id},
			timeout: global_ajax_timeout,
			success: function(dataReceived) {
				
				$.ui.hideMask();

				var data = dataReceived;
				if (data['action'] == 'ok') {
					
					setCookie ('login_data', JSON.stringify(dataReceived), 3650);
					loginSet();
					
				}
				
			},
			error : function() {
				$.ui.hideMask();
				custom_alert ("Cannot connect to server, please try again.", "NoNetAlert");
			}
		});
		
	}
	
}


function loginSend () {

	if (jQuery("#login_form").valid() == true) {

		$.ui.showMask();
		
		var serializeForm = jQuery("#login_form").serializeArray();
		var mob_model = global_platform + ' ' + global_model;
		
		jQuery.ajax({
			url: global_host + '/action_mobile.php',
			dataType: 'jsonp',
			data: {page: 'login', lang: global_lang, serializeForm: serializeForm, mob_model: mob_model},
			timeout: global_ajax_timeout,
			success: function(dataReceived) {
				
				$.ui.hideMask();

				var data = dataReceived;
				if (data['action'] == 'ok') {
					
					if (data['message']) custom_alert (data['message']);
					
					setCookie ('login_data', JSON.stringify(dataReceived), 3650);
					loginSet();
					homePage();
					
					clear_form_elements ('#login_form');
					
				} else if (data['action'] == 'error') custom_alert (data['message']);
				
			},
			error : function() {
				$.ui.hideMask();
				custom_alert ("Cannot connect to server, please try again.", "NoNetAlert");
			}
		});
		
	}
	
}


function FBLogin () {
	
	/*
	var data = JSON.stringify({ "id":"100000426953192", "email":"ivan.markovic@eklektika.rs", "first_name":"Đorđe", "last_name":"Čvarkov", "timezone":"2" });
	var mob_model = global_platform + ' ' + global_model;
	*/	
	
	if (global_disclaimer_chk == 0) {
		
		disclaimerPage();
		$('.afPopup>DIV .I_Agreee').attr('onClick', 'global_disclaimer_chk = 1; FBLogin();');
		
	} else {
		
		$.ui.showMask();
		
		facebookConnectPlugin.login( ["email"], 
		function (response) {
			facebookConnectPlugin.api( "me/?fields=first_name,last_name,email", ["public_profile"],
			//facebookConnectPlugin.api( "me/?fields=email", ["public_profile"],
			function (response) { 
			
				alert(JSON.stringify(response)); //test
				
				$.ui.showMask();
				var mob_model = global_platform + ' ' + global_model;
				
				jQuery.ajax({
					url: global_host + '/action_mobile.php',
					dataType: 'jsonp',
					data: {page: 'FBLogin', lang: global_lang, fb_data: response, mob_model: mob_model},
					timeout: global_ajax_timeout,
					success: function(dataReceived) {
						
						$.ui.hideMask();
						
						var data = dataReceived;
						
						if (data['action'] == 'ok') {
							
							if (data['message']) custom_alert (data['message']);
							
							setCookie ('login_data', JSON.stringify(dataReceived), 3650);
							loginSet();
							homePage();
							clear_form_elements ('#login_form');
							
						} else if (data['action'] == 'error') custom_alert (data['message']);
						
					},
					error : function() {
						$.ui.hideMask();
						custom_alert ("Cannot connect to server, please try again.", "NoNetAlert");
					}
				});
				
			},
			function (response) {
				$.ui.hideMask();
				custom_alert("Unsuccessful Login");	
			}); 
			
		},
		function (response) {
			$.ui.hideMask();
			custom_alert("Unsuccessful Login");
		});
		
	}
	
	$.ui.clearHistoryLast('#disclaimerPage');

}


function registrationPage () {
	
	nextPage('registrationPage');

}


function registrationSend () {

	if (jQuery("#registration_form").valid() == true) {
		
		if (global_disclaimer_chk == 0) {
			
			disclaimerPage();
			$('.afPopup>DIV .I_Agreee').attr('onClick', 'global_disclaimer_chk = 1; registrationSend();');
			
		} else {
		
			$.ui.showMask();
			
			var serializeForm = jQuery("#registration_form").serializeArray();
			var mob_model = global_platform + ' ' + global_model;
	
			jQuery.ajax({
				url: global_host + '/action_mobile.php',
				dataType: 'jsonp',
				data: {page: 'registration', lang: global_lang, serializeForm: serializeForm, mob_model: mob_model},
				timeout: global_ajax_timeout,
				success: function(dataReceived) {
					
					$.ui.hideMask();
					
					var data = dataReceived;
					if (data['action'] == 'ok') {
						
						if (data['message']) custom_alert (data['message']);
						
						setCookie ('login_data', JSON.stringify(dataReceived), 3650);
						loginSet();
						homePage();
						clear_form_elements ('#registration_form');
						
					} else if (data['action'] == 'error') custom_alert (data['message']);
					
				},
				error : function() {
					$.ui.hideMask();
					custom_alert ("Cannot connect to server, please try again.", "NoNetAlert");
				}
			});
			
		}
		
	}
	
}


function resetpassPage () {

	nextPage('resetpassPage');

}


function resetpassSend () {

	if (jQuery("#resetpass_form").valid() == true) {

		$.ui.showMask();
		
		var serializeForm = jQuery("#resetpass_form").serializeArray();

		jQuery.ajax({
			url: global_host + '/action_mobile.php',
			dataType: 'jsonp',
			data: {page: 'resetpass', lang: global_lang, serializeForm: serializeForm},
			timeout: global_ajax_timeout,
			success: function(dataReceived) {
				
				$.ui.hideMask();
				
				var data = dataReceived;
				clear_form_elements ('#resetpass_form');
				custom_alert (data['message']);
				
			},
			error : function() {
				$.ui.hideMask();
				custom_alert ("Cannot connect to server, please try again.", "NoNetAlert");
			}
		});
		
	}
	
}


function logout () {
	
	removeCookie ('login_data');
	global_login_data = '';
	global_disclaimer_chk = 0;
	clearInterval(global_countdownInterval);
	loginSet();
	homePage();
	
}



function MyProfilePage () {
	
	$('#MyProfilePage #MyProfile_f_name').val(global_login_data['f_name']);
	$('#MyProfilePage #MyProfile_l_name').val(global_login_data['l_name']);
	$('#MyProfilePage #MyProfile_e_mail').val(global_login_data['e_mail']);
	$('#MyProfilePage #MyProfile_password').val('');
	$('#MyProfilePage #MyProfile_password_2').val('');
	nextPage('MyProfilePage');

}


function MyProfileSend () {

	if (jQuery("#MyProfile_form").valid() == true) {

		$.ui.showMask();
		
		var serializeForm = jQuery("#MyProfile_form").serializeArray();
		
		jQuery.ajax({
			url: global_host + '/action_mobile.php',
			dataType: 'jsonp',
			data: {page: 'MyProfile', lang: global_lang, serializeForm: serializeForm, ID_users: global_login_data['ID_users']},
			timeout: global_ajax_timeout,
			success: function(dataReceived) {
				
				$.ui.hideMask();

				var data = dataReceived;
				if (data['action'] == 'ok') {
					
					if (data['message']) custom_alert (data['message']);
					setCookie ('login_data', JSON.stringify(dataReceived), 3650);
					loginSet();
					setTimeout(function(){MyProfilePage ();}, 500);
					
				} else if (data['action'] == 'error') custom_alert (data['message']);

			},
			error : function() {
				$.ui.hideMask();
				custom_alert ("Cannot connect to server, please try again.", "NoNetAlert");
			}
		});
		
	}
	
}


function disclaimerPage () {
	
	var html = '';
	html += '<div class="content">';
		if (global_platform == 'iOS') html += '<div>';
			html += $('#disclaimerPage .text_box_white').html();
			html += '<br /><br /><br />';
			html += '<a href="javascript: void(0);" onClick="" class="I_Agreee" style="display:inline-block; margin-right:10px;"><img src="./images/accept_button.png" width="95" /></a>';
			html += '<a href="javascript: void(0);" onClick="$("#afPopup").trigger("close");" class="" style="display:inline-block;"><img src="./images/decline_button.png" width="95" /></a>';
		if (global_platform == 'iOS') html += '</div>';
	html += '</div>';
	html += '<div class="scroll"></div>';
	
	$.ui.popup( {
		title:"Policies, Terms, Conditions & Release - Please Read!",
		message: html
	});	
	
	var popup_top = parseInt(window.innerHeight) - 460;
	if (popup_top <= 30) popup_top = 30;
	if (popup_top > 100) popup_top = 100;
	$('.afPopup').css({'top':popup_top+'px'});
	$('.afPopup>FOOTER').attr('style', 'display: none !important');
	$('.afPopup header').css({'font-size':'18px', 'font-weight':'bold'});
	$('.afPopup .content').css({'font-size':'12px'});
	var content_height = parseInt (jQuery('.afPopup .content').outerHeight(true)) - 280;
	$('.afPopup .content').css({'height':'310px'});
	$('.afPopup .scroll').css({'height':'310px'});
	
	$('.afPopup .content').scroller({
		scrollBars: true,
		verticalScroll: true,
		horizontalScroll: false,
		vScrollCSS: "jqmScrollbar",
		hScrollCSS: "jqmScrollbar"
	});
	$('.afPopup .jqmScrollbar').css({'background-color':'transparent'});
	
	global_popup_scroll_slider = jQuery('.afPopup .scroll').slider({
		orientation: "vertical",
		range: "min",
		min: 0,
		max: 100,
		value: 90,
		slide: function( event, ui ) {
			if (parseInt (ui.value) > 90) setTimeout(function() { global_popup_scroll_slider.slider('value', 90); }, 0);
			var y = (90 - parseInt (ui.value)) * -(content_height / 90);
			if (y > 0) y = 0;
			$('.afPopup .content div:first-child').attr('style', '-webkit-transform: matrix3d( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, '+y+', 0, 1 )');
		}
	});
	
	//nextPage('disclaimerPage');
	//$.ui.clearHistoryLast('#disclaimerPage');
	
}
