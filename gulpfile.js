var gulp = require("gulp");
var babel = require("gulp-babel");
var browserify = require('gulp-browserify');
var del = require('del');


gulp.task('default', ['clean'], function() {
//    gulp.src("js/**/*.js")
//	.pipe(babel())
//	.pipe(gulp.dest("docroot"));

//    return browserify('./js/index.js')
 //       .transform("babelify", {presets: ["es2015", "react"]})
 //       .bundle()
        //.pipe(source('bundle.js'))
 //       .pipe(gulp.dest('docroot'));

    gulp.src('js/index.js')
        .pipe(browserify({transform: ["babelify", "reactify"]}))
        .pipe(gulp.dest("docroot"));
});

gulp.task('clean', function(callback) {
    del(['docroot/**']).then(function(paths){callback();});
});
