const gulp = require("gulp");
const browserify = require('gulp-browserify');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const minifyCss = require('gulp-minify-css');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('default', ['clean', 'apply-prod-environment'], function() {
    gulp.src('js/router.js')
        .pipe(browserify({transform: ["babelify", "reactify"]}))
        .pipe(uglify({preserveComments: 'license'}))
        .pipe(gulp.dest("docroot"));
    
    gulp.src('css/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({browsers: ['last 2 versions'], cascade: false}))
		.pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(gulp.dest("docroot/css"));
    
    gulp.src('css/fontawesome/fonts/*').pipe(gulp.dest("docroot/css/fonts"));
});

gulp.task('apply-prod-environment', function() {
	process.stdout.write("Setting NODE_ENV to 'production'" + "\n");
    process.env.NODE_ENV = 'production';
    if (process.env.NODE_ENV != 'production') {
        throw new Error("Failed to set NODE_ENV to production!!!!");
    } else {
        process.stdout.write("Successfully set NODE_ENV to production" + "\n");
    }
});

gulp.task('dev', ['clean'], function() {
    gulp.src('js/router.js')
        .pipe(browserify({transform: ["babelify", "reactify"]}))
        .pipe(gulp.dest("docroot"));
    
    gulp.src('css/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({browsers: ['last 2 versions'], cascade: false}))
		.pipe(gulp.dest("docroot/css"));
    
    gulp.src('css/fontawesome/fonts/*').pipe(gulp.dest("docroot/css/fonts"));
});

gulp.task('clean', function(callback) {
	require('del')(['docroot/**']).then(function(paths){callback();});
});