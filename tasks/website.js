'use strict';

module.exports = function (gulp, $) {

  gulp.task('website', function () {
    return gulp.src([
      'examples/**/*',
      '!examples/source',
      'source'
    ])
      .pipe($.ghPages());
  });
};
