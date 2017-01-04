/*jshint
node: true,
esversion: 6
*/
'use strict';

let gulp = require('gulp');
let rename = require('gulp-rename');
let sass = require('gulp-sass');
let uglify = require('gulp-uglify');
let pump = require('pump');
let obfuscator = require('gulp-js-obfuscator');

gulp.task('css', function() {
  return gulp.src('./game/assets/stylesheets/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('css:watch', function() {
  gulp.watch('./game/assets/stylesheets/**/*.scss', ['css']);
});

gulp.task('obfuscate', function() {
  gulp.src('./build/intermediates/init-browserified.js')
      // .pipe(obfuscator({}, []))
      .pipe(rename('init-browserified-obfuscated.js'))
      .pipe(gulp.dest('./build/intermediates'));
});

gulp.task('compile', ['css', 'obfuscate']);
