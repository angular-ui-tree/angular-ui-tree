'use strict';
module.exports = function (grunt) {

    // load all grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    var mountFolder = function (connect, dir) {
        return connect.static(require('path').resolve(dir));
    };

    var cfg = {
        srcDir: 'source',
        buildDir: 'demo/dist',
        demoDir: 'demo'
    };

    // project configuration
    grunt.initConfig({
        cfg: cfg,
        
        // watch
        watch: {
            options: {
                livereload: true
            },
            files: [
                '<%= cfg.srcDir %>/**/*.js',
                '<%= cfg.demoDir %>/**/*.js',
                '!<%= cfg.demoDir %>/dist/*.js',
                '!<%= cfg.demoDir %>/bower_components/**/*'
            ],
            tasks: ['jshint:source', 'clean:build', 'concat:build', 'uglify:build']
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
                src: [
                    '<%= cfg.srcDir %>/main.js',
                    '<%= cfg.srcDir %>/helper.js',
                    '<%= cfg.srcDir %>/nestedSortableCtrl.js',
                    '<%= cfg.srcDir %>/nestedSortableHandlerCtrl.js',
                    '<%= cfg.srcDir %>/nestedSortableItemCtrl.js',
                    '<%= cfg.srcDir %>/uiNestedSortable.js',
                    '<%= cfg.srcDir %>/uiNestedSortableHandle.js',
                    '<%= cfg.srcDir %>/uiNestedSortableItem.js'
                ],
                dest: '<%= cfg.buildDir %>/angular-nested-sortable.js'
            }
        },

        // uglify
        uglify: {
            options: {
                preserveComments: 'some',
                mangle: false
            },
            build: {
                files: {
                    '<%= cfg.buildDir %>/angular-nested-sortable.min.js': ['<%= cfg.buildDir %>/angular-nested-sortable.js']
                }
            }
        },

        // connect
        connect: {
            options: {
                port: 8080,
                livereload: 35729,
                hostname: '0.0.0.0'
            },
            demo: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '')
                        ];
                    }
                }
            }
        },

        // open
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>/<%= cfg.demoDir %>/'
            }
        },

        // karma
        karma: {
            options: {
                configFile: 'karma.conf.js',
                autoWatch: true
            },

            single: {
                singleRun: true
            },

            continuous: {
                singleRun: false
            }
        }
    });

    // default
    grunt.registerTask('default', ['webserver']);
    grunt.registerTask('build', ['jshint:source', 'karma:single', 'clean:build', 'concat:build', 'uglify:build']);
    grunt.registerTask('webserver', ['build', 'open', 'connect:demo', 'watch']);
    grunt.registerTask('test', ['karma:single']);
    grunt.registerTask('test:continuous', ['karma:continuous']);
};
