module.exports = function(config) {
  'use strict';

  var cfg = {
    bowerComponents: 'examples/bower_components'
  };

  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    autoWatch: false,
    browsers: ['PhantomJS'],

    // files to load in the browser
    files: [
      // components
      cfg.bowerComponents + '/jquery/dist/jquery.js',
      cfg.bowerComponents + '/jasmine-jquery/lib/jasmine-jquery.js',
      cfg.bowerComponents + '/angular/angular.js',
      cfg.bowerComponents + '/angular-mocks/angular-mocks.js',

      // source files
      'source/main.js',
      'source/**/*.js'
    ],

    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-coverage'
    ],

    // generate js files from html templates to expose them during testing
    preprocessors: {
      '**/*.html': 'ng-html2js',
      'source/**/!(*spec).js': ['coverage']
    },

    // https://github.com/karma-runner/karma-ng-html2js-preprocessor#configuration
    ngHtml2JsPreprocessor: {
      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('foo')
    },

    // files to exclude
    exclude: [],

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    port: 9876,
    reporters: ['dots', 'coverage'],
    singleRun: true,

    coverageReporter: {
      dir: 'coverage',
      reporters: [{
        type: 'lcov',
        subdir: 'lcov'
      }]
    }
  });
};
