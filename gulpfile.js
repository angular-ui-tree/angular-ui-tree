'use strict';

var gulp       = require('gulp'),
    requireDir = require('require-dir'),
    $          = require('gulp-load-plugins')();

// Load application tasks
(function () {
  var dir = requireDir('./tasks');

  Object.keys(dir).forEach(function (key) {
    dir[key] = dir[key](gulp, $);
  });
}());

$.karma = require('karma');

gulp.task('build', function () {
  return gulp.start('clean', 'jscs', 'jshint', 'uglify', 'test', 'styles');
});

gulp.task('serve', ['clean'], function () {
  return gulp.start('connect', 'watch', 'open');
});