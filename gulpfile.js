/*jshint
node: true,
esversion: 6
*/
'use strict';

let gulp = require('gulp');
let sass = require('gulp-sass');

gulp.task('css', function () {
  return gulp.src('./public/stylesheets/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('css:watch', function () {
  gulp.watch('./public/stylesheets/**/*.scss', ['css']);
});
