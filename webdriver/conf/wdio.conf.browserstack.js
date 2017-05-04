var config = require('./config');

config.host = 'hub.browserstack.com';
config.user = 'jeffpoyzner1';
config.key = 'aBzf5pB1PsyWp7CzLWn2';

// Define your capabilities here. WebdriverIO can run multiple capabilties at the same
// time. Depending on the number of capabilities, WebdriverIO launches several test
// sessions. Within your capabilities you can overwrite the spec and exclude option in
// order to group specific specs to a specific capability:
config.capabilities = [
    {
    	browser: 'IE',
    	browser_version: '10.0',
    	os: 'Windows',
    	os_version: '8',
    	resolution: '1024x768',
    	acceptSslCerts: true,
    	'browserstack.local': 'true'
    },
    {
		browser: 'Firefox',
		browser_version: '41.0',
		os: 'OS X',
		os_version: 'Mavericks',
		resolution: '1280x1024',
		acceptSslCerts: true,
    	'browserstack.local': 'true'
	},
    {
    	browser: 'Chrome',
    	browser_version: '45.0',
    	os: 'OS X',
    	os_version: 'Yosemite',
    	resolution: '1600x1200',
    	acceptSslCerts: true,
    	'browserstack.local': 'true'
	},
	{
    	browser: 'Safari',
    	browser_version: '8.0',
    	os: 'OS X',
    	os_version: 'Yosemite',
    	resolution: '1600x1200',
		acceptSslCerts: true,
    	'browserstack.local': 'true'
    },
    {
    	browser: 'IE',
    	browser_version: '11.0',
    	os: 'Windows',
    	os_version: '10',
    	resolution: '1280x1024',
    	acceptSslCerts: true,
    	'browserstack.local': 'true'
    }
    
//TODO: not doing phone testing now
//  {
//  	browserName: 'iPhone',
//  	platform: 'MAC',
//  	device: 'iPhone 6 Plus',
//  	acceptSslCerts: true
//  },
//  {
//  	platform: 'MAC',
//  	browserName: 'iPad',
//  	device: 'iPad Air',
//		acceptSslCerts: true
//  },
    
//TODO: Can't hit meter link on splash page, "Single tap" is doing nothing
//  {
//  	browserName: 'android',
//  	platform: 'ANDROID',
//  	device: 'Samsung Galaxy S5',
//  	acceptSslCerts: true
//  },
],

config.reporter = 'xunit';
config.reporterOptions = {outputDir: './report/'};

exports.config = config;