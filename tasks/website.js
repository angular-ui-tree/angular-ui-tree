'use strict';

module.exports = function (gulp, $) {

  gulp.task('website', function () {
    return gulp.src('examples/**/*')
      .pipe($.ghPages({
        branch: 'test-website-deployment'
      }));
  });
};
