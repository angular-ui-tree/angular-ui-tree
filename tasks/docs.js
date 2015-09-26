'use strict';

module.exports = function (gulp, $) {
  gulp.task('docs:setup', function () {
    return gulp.src('docs')
      .pipe($.symlink('examples/docs', { force: true }));
  });

  gulp.task('docs:generate', function () {
    return $.ngdocs.sections({
      api: {
        glob: [
          'source/**/*.js',
          '!source/**/*.spec.js'
        ],
        api: true,
        title: 'API Documentation'
      }
    }).pipe($.ngdocs.process({}))
      .pipe(gulp.dest('docs'));
  });
};
