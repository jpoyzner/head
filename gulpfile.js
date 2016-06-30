var gulp = require("gulp");
var browserify = require('gulp-browserify');
var del = require('del');


gulp.task('default', ['clean'], function() {
    gulp.src('js/index.js')
        .pipe(browserify({transform: ["babelify", "reactify"]}))
        .pipe(gulp.dest("docroot"));
});

gulp.task('clean', function(callback) {
    del(['docroot/**']).then(function(paths){callback();});
});
