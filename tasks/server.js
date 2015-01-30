'use strict';

module.exports = function (gulp, $) {

  gulp.task('connect', [
    'clean:examples',
    'scripts:setup',
    'styles'
  ], function () {
    var livereloadPort = 35729;

    $.connect.server({
      port: 9000,
      livereload: {
        port: livereloadPort
      },
      root: 'examples',
      middleware: function (connect) {
        function mountFolder(connect, dir) {
          return connect.static(require('path').resolve(dir));
        }

        return [
          require('connect-livereload')({ port: livereloadPort }),
          mountFolder(connect, 'source'),
          mountFolder(connect, 'dist'),
          mountFolder(connect, 'bower_components'),
          mountFolder(connect, 'examples')
        ];
      }
    });
  });

  gulp.task('watch', ['connect'], function () {
    gulp.watch([
      '.jshintrc',
      'source/**/*.js',
      'examples/**/*.html'
    ], function (event) {
      return gulp.src(event.path)
        .pipe($.connect.reload());
    });

    gulp.watch([
      '.jshintrc',
      'source/**/*.js'
    ], ['jshint', 'jscs']);

    gulp.watch([
      'source/**/*.scss'
    ], ['styles']);

    gulp.watch([
      'examples/**/*.scss'
    ], ['styles:examples']);
  });

  gulp.task('open', ['connect'], function () {
    require('open')('http://localhost:9000');
  });

};