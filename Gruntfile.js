/*
 * grunt-var-exporter
 * https://github.com/anchann/grunt-var-exporter
 *
 * Copyright (c) 2014 anchann
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

		ts: {
			base: {
				src: [ 'src/**/*.ts' ],
				dest: 'tmp/tslib.js',
			}
		},

		concat: {
			dist: {
				src: [
					'src/imports.js',
					'tmp/tslib.js',
					'src/exports.js',
				],
				dest: 'tasks/varExporter.js',
			}
		},

		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
			],
			options: {
				jshintrc: '.jshintrc',
			}
		},

	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-ts');

	grunt.registerTask('build', ['ts', 'concat']);

	// By default, lint and run all tests.
	grunt.registerTask('default', ['build', 'jshint']);

};
