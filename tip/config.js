module.exports = {
	allowedOrigins: ['localhost'], //array of client domains allowed to access this server
	cookieKey: 'museum', //string used to sign and decode cookies
	nodeHost: '10.12.0.72', //External address where this host can be reached
	nodePort: 8081, //Port on external address where this host can be reached
	useTLS: true, //Whether to turn TLS on	
	wsHost: '192.168.50.6:10000'/*QA5*/,//'192.168.50.7:10000'/*DEV1*/, //[Host]:[Port] where Web Service can be accessed
	wsPassphrase: 'YdjfzpDWH8P8a2vLdcmZqw==', //Passphrase used by Web Service when using TLS	
}
