// Create new cookie
function createCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = "; expires=" + date.toGMTString();
	} else {
		var expires = "";
	}
	document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}
//
// Return the value of cookie
//
function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
	}
	return null;
}

// Clear cookie value
function eraseCookie(name) {
	createCookie(name, "", - 1);
}


function get_cookies_array() {
	var cookies = {};
	if (document.cookie && document.cookie != '') {
		var split = document.cookie.split(';');
		for (var i = 0; i < split.length; i++) {
			var name_value = split[i].split("=");
			name_value[0] = name_value[0].replace(/^ /, '');
			cookies[decodeURIComponent(name_value[0])] = decodeURIComponent(name_value[1]);
		}
	};
	return cookies;
};

// return just the NAMES of all cookies in an array of strings
function getCookiesNames() {
	var theCookies = document.cookie.split('; '), aString = '', temp = [], cNames = [];
	for (var i = 1 ; i <= theCookies.length; i++) {
		aString += theCookies[i-1] + "\n";
	}
	for (var i = 0; i < aString.split("=").length; i++) {
		temp.push(aString.split("\n")[i]);
	}
	for (var i = 0; i < temp.length - 1; i++) {
		cNames.push(temp[i].split("=")[0]);
	}
	return cNames;
}


