export default (script, callback) => {
	console.log("Running " + script + " script");
	
	require('http').request({host: '192.168.10.11', port: '8081', path: "/" + script}, callback)
		.end();
};