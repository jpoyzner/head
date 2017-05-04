//TODO: make something that restarts the server automatically?

//TODO: add logging dirs/files

//TODO: browser cache needs to have a way to break it for deployments

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

var soapOptions = {endpoint: WS_HOST, forceSoap12Headers: true};

if (config.useTLS) {
	soapOptions.wsdl_options =
		{cert: fs.readFileSync('./certs/wsclient.crt'),
		key: fs.readFileSync('./certs/wsclient.key'),
		passphrase: WS_PASSPHRASE,
		rejectUnauthorized: false};
}

var soap = require('soap');
soap.createClient(
	WS_HOST + '/PolicyNet.wsdl',
	soapOptions,
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