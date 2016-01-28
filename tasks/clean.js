'use strict';

var del = require('del');

module.exports = function (gulp, $) {
  gulp.task('clean', function () {
    del.sync('dist');
  });

  gulp.task('clean:examples', function () {
    del.sync('examples/source');
  });

  gulp.task('clean:deploy', function () {
    del.sync('.tmp/website')
  });
};
