'use strict';

module.exports = function (gulp, $) {
  gulp.task('clean', function () {
    return gulp.src('dist', { read: false })
      .pipe($.clean());
  });
};
