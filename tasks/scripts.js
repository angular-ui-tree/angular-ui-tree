'use strict';

module.exports = function (gulp, $) {

  gulp.task('scripts:setup', function () {
    return gulp.src('source')
      .pipe($.symlink('examples/source', { force: true }));
  });

  gulp.task('jscs', function () {
    return gulp.src([
      'source/**/*.js',
      'examples/js/*.js'
    ])
      .pipe($.jscs());
  });

  gulp.task('jshint', function () {
    return gulp.src([
        'source/**/*.js',
        'examples/js/*.js'
      ])
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.jshint.reporter('fail'));
  });

  gulp.task('concat', function () {
    return gulp.src([
        'source/**/*.js',
        '!**/*.spec.js'
      ])
      .pipe($.concat('angular-ui-tree.js'))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('uglify', ['concat'], function () {
    return gulp.src('dist/angular-ui-tree.js')
      .pipe($.uglify({
        preserveComments: 'some'
      }))
      .pipe($.rename('angular-ui-tree.min.js'))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('karma', function () {
    return $.karma.server.start({
      configFile: __dirname + '/../karma.conf.js',
      singleRun: true
    }, function (err) {
      process.exit(err ? 1 : 0);
    });
  });
};
