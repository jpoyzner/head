var gulp = require('gulp');
var argv = require('yargs').argv;

var webdriverOptions = {baseUrl: argv.url || 'https://192.168.10.12/'};

if (argv.creds) {
	webdriverOptions.user = argv.creds;
}

var webdriver = require('gulp-webdriver')(webdriverOptions);

gulp.task('default', ['browserstack'], function() {
    console.log("Finished end-to-end tests!");
});

gulp.task('local', ['localtests'], function() {
    console.log("Finished end-to-end tests!");
});

gulp.task('browserstack', function() {
	return gulp.src('conf/wdio.conf.browserstack.js').pipe(webdriver);
});

gulp.task('localtests', function() {
	return gulp.src('conf/wdio.conf.local.js').pipe(webdriver);
});