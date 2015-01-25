'use strict';

module.exports = function (gulp, $) {
  gulp.task('clean', function () {
    return gulp.src('dist', { read: false })
      .pipe($.clean());
  });

  gulp.task('clean:examples', function () {
    return gulp.src('examples/source', { read: false })
      .pipe($.clean());
  });
};
