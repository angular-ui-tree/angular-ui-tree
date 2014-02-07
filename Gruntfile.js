'use strict';
module.exports = function (grunt) {

    // load all grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    var mountFolder = function (connect, dir) {
        return connect.static(require('path').resolve(dir));
    };

    var cfg = {
        srcDir: 'source',
        buildDir: 'dist',
        demoDir: 'demo'
    };

    // project configuration
    grunt.initConfig({
        cfg: cfg,
        
        // watch
        watch: {
            files: [
                '<%= cfg.srcDir %>/**/.js',
                '<%= cfg.demoDir %>/**/*.js',
                '!<%= cfg.demoDir %>/bower_components/**/*'
            ],
            tasks: ['jshint']
        },

        // jshint
        jshint: {
            options: {
                'jshintrc': true,
                reporter: require('jshint-stylish')
            },
            source: {
                files: {
                    src: ['<%= cfg.srcDir %>/**/*.js']
                }
            },
            demo: {
                files: {
                    src: [
                        '<%= cfg.demoDir %>/**/*.js',
                        '!<%= cfg.demoDir %>/bower_components/**/*'
                    ]
                }
            }
        },

        // clean
        clean: {
            build: ['<%= cfg.buildDir %>']
        },

        // concat
        concat: {
            build: {
              src: ['<%= cfg.srcDir %>/angular-nested-sortable.js'],
              dest: '<%= cfg.buildDir %>/angular-nested-sortable.js',
            },
        },

        // uglify
        uglify: {
            options: {
                mangle: false
            },
            build: {
                files: {
                    '<%= cfg.buildDir %>/angular-nested-sortable.min.js': ['<%= cfg.buildDir %>/angular-nested-sortable.js']
                }
            }
        }

    });

    // default
    grunt.registerTask('default', ['watch']);

    grunt.registerTask('build', ['jshint:source', 'clean:build', 'concat:build', 'uglify:build']);
};
