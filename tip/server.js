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

//TODO: make something that restarts the server automatically?

//TODO: add logging dirs/files

//TODO: think about deployment and associated docs,
//browser cache needs to have a way to break it for deployments

//TODO: add favicon file

var config = require('./config');

const ALLOWED_ORIGINS = config.allowedOrigins
if (!ALLOWED_ORIGINS) {
	error('ERROR: Please specify valid array of allowed origins!');
}

const HOST = config.nodeHost;
if (!HOST) {
	error('ERROR: Please specify valid Node host');
}

const PORT = config.nodePort;
if (!PORT) {
	error('ERROR: Please specify valid Node port');
}

const WS_PASSPHRASE = config.wsPassphrase;
if (config.useTLS && !WS_PASSPHRASE) {
	error('ERROR: Please specify valid Web Service passphrase when using TLS');
}

var WS_HOST = config.wsHost;
if (WS_HOST) {
	WS_HOST = "http" + (config.useTLS ? "s" : "") + "://" + WS_HOST
} else {
	error('ERROR: Please specify valid Web Service host');
}

var COOKIE_KEY = config.cookieKey;
if (!COOKIE_KEY) {
	error('ERROR: Please specify valid key string to sign cookies with');
}

console.log((config.useTLS ? "" : "not") + " using TLS");

const express = require('express');
const fs = require('fs');

const app = express();

if (config.useTLS) {
	const tlsOptions =
		{key: fs.readFileSync('./certs/server.key'),
		cert: fs.readFileSync('./certs/server.crt')};
	
	require('https').createServer(tlsOptions, app).listen(PORT, serverStarted);
} else {
	app.listen(PORT, serverStarted);
}

function serverStarted() {
	console.log("Server listening on: http" + (config.useTLS ? "s" : "") + "://localhost:" + PORT);
}

app.use((req, res, next) => {
	ALLOWED_ORIGINS.forEach((allowedOrigin) => {
		if (req.headers.origin && req.headers.origin.indexOf(allowedOrigin) !== -1) {
			res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
			return;
		}
	});

	next();
});

app.use(express.static(__dirname));
app.use(require('cookie-parser')(COOKIE_KEY));
app.use(require('cookie-encrypter')(COOKIE_KEY));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var soap = require('soap');
soap.createClient(
	WS_HOST + '/PolicyNet.wsdl',
	{endpoint: WS_HOST,
		forceSoap12Headers: true,
		wsdl_options: {
			cert: fs.readFileSync('./certs/wsclient.crt'),
			key: fs.readFileSync('./certs/wsclient.key'),
			passphrase: WS_PASSPHRASE,
			rejectUnauthorized: false}},
	(err, client) => {
		if (err) {
			error(err);
			error("Can't connect to Web Service at: " + WS_HOST + '/PolicyNet.wsdl');
			return;
		}
		
		if (config.useTLS) {
			client.setSecurity(
				new soap.ClientSSLSecurity(
					'./certs/wsclient.key',
					'./certs/wsclient.crt',
					{passphrase: WS_PASSPHRASE, rejectUnauthorized: false}));
		}
		
		require('./server/controller')(client, app, config);
	});

function error(error, res) {
	console.log(error); //TODO: print to error log also
}