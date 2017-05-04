var config = require('./config');
config.capabilities = [{browser: 'Firefox', acceptSslCerts: true}];
config.reporter = 'spec';

exports.config = config;