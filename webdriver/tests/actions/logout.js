export default (done) => {
	browser.click('a[title="Logout"]').waitThen(done);
};