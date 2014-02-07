'use strict';
module.exports = function (grunt) {

    // load all grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    var mountFolder = function (connect, dir) {
        return connect.static(require('path').resolve(dir));
    };

    var cfg = {
        src: 'angular-nestedSortable.js'
    }

    // project configuration
    grunt.initConfig({
        cfg: cfg,
        
        // watch
        watch: {
            files: [
                '<%= cfg.src %>'
            ],
            tasks: ['jshint']
        },

        // jshint
        jshint: {
            files: {
                src: ['<%= cfg.src %>']
            },
            options: {
                'jshintrc': true,
                reporter: require('jshint-stylish')
            }
        }
    });

    // default
    grunt.registerTask('default', ['watch']);
};