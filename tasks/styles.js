'use strict';

module.exports = function (gulp, $) {

  gulp.task('styles', function () {
    return gulp.src('source/angular-ui-tree.scss')
      .pipe($.sass({
        errLogToConsole: true,
        outputStyle: 'compressed'
      }))
      .pipe($.rename('angular-ui-tree.min.css'))
      .pipe(gulp.dest('dist'));
  });

};