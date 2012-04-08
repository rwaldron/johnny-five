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

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('concat', 'Concatenate files.', function() {
    var files = file.expandFiles(this.file.src);
    // Concat specified files.
    var src = grunt.helper('concat', files, {separator: this.data.separator});
    file.write(this.file.dest, src);

    // Fail task if errors were logged.
    if (this.errorCount) { return false; }

    // Otherwise, print a success message.
    log.writeln('File "' + this.file.dest + '" created.');
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  // Concat source files and/or directives.
  grunt.registerHelper('concat', function(files, options) {
    options = utils._.defaults(options || {}, {
      separator: utils.linefeed
    });
    return files ? files.map(function(filepath) {
      return task.directive(filepath, file.read);
    }).join(utils.normalizelf(options.separator)) : '';
  });

};
