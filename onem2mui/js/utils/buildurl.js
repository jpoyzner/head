export default function(URL, params) {
	var firstParam = true;
	Object.keys(params).forEach(function(key) {
		if (params[key] === undefined || params[key] === null) {
			return;
		}
		
		if (firstParam) {
			URL += "?" + key + "=" + params[key];
			firstParam = false;
		} else {
			URL += "&" + key + "=" + params[key];
		}
	});

    return URL;
};