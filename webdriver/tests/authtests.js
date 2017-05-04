import DevicesPage from './objects/devices/devicespage';
import login from './actions/login';

describe('login test', function() {
	it('should be able to navigate to login without any issues', (done) => {
		login(() => {
			browser.getTitle().then((title) => {
				//might need to make this dynamic, now that we have post-login redirects
				expect(title).to.be.equal(DevicesPage.TITLE);
			}).call(done);
		});
    });
});