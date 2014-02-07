'use strict';
module.exports = function (grunt) {

    // load all grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    var mountFolder = function (connect, dir) {
        return connect.static(require('path').resolve(dir));
    };

    var cfg = {
        srcDir: 'source',
        buildDir: 'dist'
    };

    // project configuration
    grunt.initConfig({
        cfg: cfg,
        
        // watch
        watch: {
            files: [
                '<%= cfg.srcDir %>/**/.js'
            ],
            tasks: ['jshint']
        },

        // jshint
        jshint: {
            files: {
                src: ['<%= cfg.srcDir %>/**/*.js']
            },
            options: {
                'jshintrc': true,
                reporter: require('jshint-stylish')
            }
        },

        // clean
        clean: {
            build: ['<%= cfg.buildDir %>']
        },

        // uglify
        uglify: {
            build: {
                files: {
                    '<%= cfg.buildDir %>/angular-nested-sortable.min.js': ['<%= cfg.srcDir %>/angular-nested-sortable.js']
                }
            }
        }

    });

    // default
    grunt.registerTask('default', ['watch']);

    grunt.registerTask('build', ['jshint', 'clean:build', 'uglify:build'])
};
