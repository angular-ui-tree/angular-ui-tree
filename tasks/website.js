'use strict';

module.exports = function (gulp, $) {

  gulp.task('website:prepareBase', function () {
    return gulp.src([
      'examples/**',
      '!examples/source'
    ])
      .pipe(gulp.dest('.tmp/website'));
  });

  gulp.task('website:prepareSource', function () {
    return gulp.src([
      'source/**'
    ], {base: 'source'})
      .pipe(gulp.dest('.tmp/website/source'));
  });

  gulp.task('website', ['website:prepareBase', 'website:prepareSource'], function () {
    return gulp.src('.tmp/website/**/*')
      .pipe($.ghPages());
  });

};
