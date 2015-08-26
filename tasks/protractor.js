'use strict';

module.exports = function (gulp, $) {
  gulp.task('protractor', function () {
    return gulp.src(['e2e/**/*.js'])
      .pipe($.protractor.protractor({
        configFile: 'protractor.conf.js',
        args: ['--baseUrl', 'http://127.0.0.1:9000']
      }))
      .on('error', function (error) {
        throw error;
      });
  });
};
