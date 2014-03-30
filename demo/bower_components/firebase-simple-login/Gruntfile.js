module.exports = function(grunt) {
  'use strict';

  var src = [
    'lib/closure/library',
    'js'
  ];

  grunt.initConfig({

    jshint: {
      src:  [
        'Gruntfile.js',
        'tests/**/*.js'
      ],
      options: {
        /**
         * Allow substring notation required to prevent key renaming by Google
         * Closure compiler running in 'advanced-optimizations' mode.
         */
        sub: true
      }
    },

    closureBuilder:  {
      options: {
        namespaces         : 'FirebaseSimpleLogin',
        closureLibraryPath : 'lib/closure/library',
        builder            : 'lib/closure/library/closure/bin/build/closurebuilder.py',
        compilerFile       : 'lib/closure/compiler.jar',
        compile            : true,
        compilerOpts       : {},
        jvmOpts            : ['-Xmx256M']
      },
      'js-simple-login': {
        src     : src,
        dest    : 'firebase-simple-login.js',
        options : {
          compilerOpts: {
            'generate_exports'  : true,
            'compilation_level' : 'SIMPLE_OPTIMIZATIONS',
            'output_wrapper'    : '(function() {%output%})();'
          }
        }
      },
      'js-simple-login-debug': {
        src     : src,
        dest    : 'firebase-simple-login-debug.js',
        options : {
          compilerOpts: {
            'generate_exports'  : true,
            'formatting'        : 'PRETTY_PRINT',
            'compilation_level' : 'WHITESPACE_ONLY'
          }
        }
      }
    },

    closureDepsWriter: {
      options: {
        closureLibraryPath : 'lib/closure/library',
        depswriter         : 'lib/closure/library/closure/bin/build/depswriter.py',
        root_with_prefix   : '"js ../../../../../js/"'
      },
      deps: {
        dest: 'js/deps.js'
      }
    },

    jasmine: {
      src: {
        src: [
          'firebase-simple-login.js'
        ],
        options: {
          version: '1.3.1',
          vendor: [
            'bower_components/firebase/firebase.js',
            'bower_components/jquery/dist/jquery.min.js'
          ],
          helpers: [
            'js/test/common-tests/init.spec.js'
          ],
          specs: [
            'js/test/jasmine/*.spec.js',
            '!js/test/jasmine/common-tests/init.spec.js'
          ]
        }
      }
    },

    connect: {
      'casper-server': {
        options: {
          port: 9001
        }
      }
    },

    exec: {
      casper: {
        command: 'casperjs test js/test/casper'
      }
    },

    concurrent: {
      closure : [
        'closureBuilder:js-simple-login',
        'closureBuilder:js-simple-login-debug',
        'closureDepsWriter'
      ],
      'test-casper': [
        'connect:casper-server',
        'exec:casperjs'
      ]
    }

  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('build', ['jshint', 'closureBuilder', 'closureDepsWriter']);
  grunt.registerTask('build-concurrent', ['jshint', 'concurrent:closure']);
  grunt.registerTask('test-casper', ['connect:casper-server', 'exec:casper']);
  grunt.registerTask('test', ['jasmine', 'test-casper']);
  grunt.registerTask('default', ['build-concurrent', 'test']);
};
