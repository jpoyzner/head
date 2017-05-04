export default (done, asTenant) => {
	var username, password;
	if (browser.options.user) {
		var creds = browser.options.user.split('/');
		username = creds[0];
		password = creds[1];
	} else {
		username = browser.options.user || (asTenant ? 'admin@ci.com' : 'admin@ci.com');
		password = browser.options.key || (asTenant ? '430!ganG621@' : '430!ganG621@');
	}

	console.log(password);

	browser.url('/').waitThen(() => {
		browser.setValue('#username', username).waitThen(() => {
			browser.setValue('#password', password).waitThen(() => {
				browser.click('#login').waitThen(done, 5000);
			});
		});
	},
	5000);
};