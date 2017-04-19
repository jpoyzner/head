/****************************************************************************
 *             GRID NET, INC. CONFIDENTIAL
 *
 * The source code contained or described herein and all documents related
 * to the source code ("Material") are owned by Grid Net, Inc. or its
 * suppliers or licensors. Title to the Material remains with Grid Net or its
 * suppliers and licensors. The Material contains trade secrets and proprietary
 * and confidential information of Grid Net or its suppliers and licensors. The
 * Material is protected by worldwide copyright and trade secret laws and treaty
 * provisions. No part of the Material may be used, copied, reproduced, modified,
 * published, uploaded, posted, transmitted, distributed, or disclosed in any way
 * without the prior express written permission of Grid Net, Inc.
 *
 * No license under any patent, copyright, trade secret or other intellectual
 * property right is granted to or conferred upon you by disclosure or delivery
 * of the Material, either expressly, by implication, inducement, estoppel or
 * otherwise. Any license under such intellectual property rights must be
 * express and approved by Grid Net, Inc. in writing.
 *
 *      Copyright (c) 2006-2008 Grid Net, Inc.  All Rights Reserved.
 *
 *  Author: Jeff Poyzner
 *
 ****************************************************************************/

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