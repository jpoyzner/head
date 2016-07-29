/****************************************************************************
 *             GRID NET, INC. CONFIDENTIAL
 *
 * The source code contained or described herein and all documents related
 * to the source code ("Material") are owned by Grid Net, Inc. or its
 * suppliers or licensors. Title to the Material remains with Grid Net or its
 * suppliers and licensors. The Material contains trade secrets and proprietary
 * and confidential information of Grid Net or its suppliers and licensors. The
 * Material is protected by worldwide copyright and trade secret laws and treaty
 * provisions. No part of the Material may be used, copied, reproduced, modified,
 * published, uploaded, posted, transmitted, distributed, or disclosed in any way
 * without the prior express written permission of Grid Net, Inc.
 *
 * No license under any patent, copyright, trade secret or other intellectual
 * property right is granted to or conferred upon you by disclosure or delivery
 * of the Material, either expressly, by implication, inducement, estoppel or
 * otherwise. Any license under such intellectual property rights must be
 * express and approved by Grid Net, Inc. in writing.
 *
 *      Copyright (c) 2006-2008 Grid Net, Inc.  All Rights Reserved.
 *
 *  Author: Jeff Poyzner
 *
 ****************************************************************************/

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