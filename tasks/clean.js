'use strict';

var del = require('del');

module.exports = function (gulp, $) {
  gulp.task('clean', function (callback) {
    del('dist')
      .then(callback());
  });

  gulp.task('clean:examples', function (callback) {
    del('examples/source')
      .then(callback());
  });

  gulp.task('clean:deploy', function (callback) {
    del('.tmp/website')
      .then(callback());
  });
};
