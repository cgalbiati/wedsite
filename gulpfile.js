'use strict';

// All used modules.
var babel = require('gulp-babel');
var gulp = require('gulp');
var runSeq = require('run-sequence');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');
var browserSync = require('browser-sync');
// var mocha = require('gulp-mocha');
// var karma = require('karma').server;
// var istanbul = require('gulp-istanbul');

//Live reload business.
gulp.task('reload', function () {
    livereload.reload();
});

// Development tasks

gulp.task('buildCSS', function(){
  return gulp.src('browser/scss/*.scss')
    .pipe(sass({
            errLogToConsole: true
        })) 
    .pipe(gulp.dest('browser/build'))
});

gulp.task('buildJS', function () {
    return gulp.src(['./browser/components/app.js', './browser/components/**/*.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(babel())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./browser/build'));
});


// gulp.task('reloadCSS', function () {
//     return gulp.src('./public/style.css').pipe(livereload());
// });


// --------------------------------------------------------------

// Production tasks
// --------------------------------------------------------------

gulp.task('buildCSSProduction', function () {
    return gulp.src('browser/scss/*.scss')
        .pipe(sass())
        .pipe(minifyCSS())
        .pipe(gulp.dest('browser/build'))
});

gulp.task('buildJSProduction', function () {
    return gulp.src(['./browser/components/app.js', './browser/components/**/*.js'])
        .pipe(concat('main.js'))
        .pipe(babel())
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest('./browser/build'));
});

gulp.task('buildProduction', ['buildCSSProduction', 'buildJSProduction']);

// --------------------------------------------------------------

// Composed tasks
// --------------------------------------------------------------

gulp.task('build', function () {
    if (process.env.NODE_ENV === 'production') {
        runSeq(['buildJSProduction', 'buildCSSProduction']);
    } else {
        runSeq(['buildJS', 'buildCSS']);
    }
});

gulp.task('default', function () {
  livereload.listen();
  gulp.start('build');
 
  gulp.watch('server/**/*.js', ['reload']);
  gulp.watch('browser/scss/**/*.scss', ['buildCSS', 'reload']); 
  gulp.watch('browser/components/**/*.js', ['buildJS', 'reload']); 
  gulp.watch('browser/**/*.html', ['reload']); 


    // gulp.watch('app/js/**/*.js', function () {
    //     runSeq('buildJS', browserSync.reload);
    // });

    // gulp.watch('server/**/*.js', function () {
    //     runSeq('buildJS', browserSync.reload);
    // });

    // gulp.watch('server/**/*.js', function () {
    //     runSeq('buildJS', browserSync.reload);
    // });

    // gulp.watch('browser/scss/**', function () {
    //     runSeq('buildCSS', 'reloadCSS');
    // });


    // // Reload when a template (.html) file changes.
    // gulp.watch(['browser/**/*.html', 'server/app/views/*.html'], ['reload']);

    // // Run server tests when a server file or server test file changes.
    // gulp.watch(['tests/server/**/*.js'], ['testServerJS']);

    // // Run browser testing when a browser test file changes.
    // gulp.watch('tests/browser/**/*', ['testBrowserJS']);

});