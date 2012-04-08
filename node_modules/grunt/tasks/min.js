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

  // External libs.
  var uglifyjs = require('uglify-js');
  var gzip = require('gzip-js');

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('min', 'Minify files with UglifyJS.', function() {
    var files = file.expandFiles(this.file.src);
    // Get banner, if specified. It would be nice if UglifyJS supported ignoring
    // all comments matching a certain pattern, like /*!...*/, but it doesn't.
    var banner = task.directive(files[0], function() { return null; });
    if (banner === null) {
      banner = '';
    } else {
      files.shift();
    }
    // Concat specified files. This should really be a single, pre-built (and
    // linted) file, but it supports any number of files.
    var max = grunt.helper('concat', files, {separator: this.data.separator});

    // Concat banner + minified source.
    var min = banner + grunt.helper('uglify', max, config('uglify'));
    file.write(this.file.dest, min);

    // Fail task if errors were logged.
    if (this.errorCount) { return false; }

    // Otherwise, print a success message....
    log.writeln('File "' + this.file.dest + '" created.');
    // ...and report some size information.
    grunt.helper('min_max_info', min, max);
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  // Minify with UglifyJS.
  // From https://github.com/mishoo/UglifyJS
  grunt.registerHelper('uglify', function(src, options) {
    if (!options) { options = {}; }
    var jsp = uglifyjs.parser;
    var pro = uglifyjs.uglify;
    var ast, pos;
    var msg = 'Minifying with UglifyJS...';
    verbose.write(msg);
    try {
      ast = jsp.parse(src);
      ast = pro.ast_mangle(ast, options.mangle || {});
      ast = pro.ast_squeeze(ast, options.squeeze || {});
      src = pro.gen_code(ast, options.codegen || {});
      // Success!
      verbose.ok();
      return src;
    } catch(e) {
      // Something went wrong.
      verbose.or.write(msg);
      pos = '['.red + ('L' + e.line).yellow + ':'.red + ('C' + e.col).yellow + ']'.red;
      log.error().writeln(pos + ' ' + (e.message + ' (position: ' + e.pos + ')').yellow);
      grunt.warn('UglifyJS found errors.', 10);
    }
  });

  // Return gzipped source.
  grunt.registerHelper('gzip', function(src) {
    return src ? gzip.zip(src, {}) : '';
  });

  // Output some size info about a file.
  grunt.registerHelper('min_max_info', function(min, max) {
    var gzipSize = String(grunt.helper('gzip', min).length);
    log.writeln('Uncompressed size: ' + String(max.length).green + ' bytes.');
    log.writeln('Compressed size: ' + gzipSize.green + ' bytes gzipped (' + String(min.length).green + ' bytes minified).');
  });

};
