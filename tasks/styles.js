'use strict';

module.exports = function (gulp, $) {

  gulp.task('styles:copy-source', function () {
    return gulp.src('source/*.css')
      .pipe(gulp.dest('dist'));
  });

  gulp.task('styles', function () {
    return gulp.src('source/*.css')
      .pipe($.minifyCss({ compatibility: 'ie8' }))
      .pipe($.rename('angular-ui-tree.min.css'))
      .pipe(gulp.dest('dist'));
  });

};
