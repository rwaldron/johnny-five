/*
 * grunt
 * https://github.com/cowboy/grunt
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

module.exports = function(grunt) {
  // Grunt utilities.
  var task = grunt.task;
  var file = grunt.file;
  var utils = grunt.utils;
  var log = grunt.log;
  var verbose = grunt.verbose;
  var fail = grunt.fail;
  var option = grunt.option;
  var config = grunt.config;
  var template = grunt.template;

  // Nodejs libs.
  var path = require('path');

  // External libs.
  var connect = require('connect');

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerTask('server', 'Start a static web server.', function() {
    // Get values from config, or use defaults.
    var port = config('server.port') || 8000;
    var base = path.resolve(config('server.base') || '.');

    var middleware = [
      // Serve static files.
      connect.static(base),
      // Make empty directories browsable. (overkill?)
      connect.directory(base)
    ];

    // If --debug was specified, enable logging.
    if (option('debug')) {
      connect.logger.format('grunt', ('[D] server :method :url :status ' +
        ':res[content-length] - :response-time ms').magenta);
      middleware.unshift(connect.logger('grunt'));
    }

    // Start server.
    log.writeln('Starting static web server on port ' + port + '.');
    connect.apply(null, middleware).listen(port);
  });

};
