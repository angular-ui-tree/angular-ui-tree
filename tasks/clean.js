'use strict';

var del = require('del');

module.exports = function (gulp, $) {
  gulp.task('clean', function (callback) {
    del('dist', callback);
  });

  gulp.task('clean:examples', function (callback) {
    del('examples/source', callback);
  });
};
