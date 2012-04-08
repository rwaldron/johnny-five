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
  // HELPERS
  // ==========================================================================

  // Get a config property. Most useful as a directive like <config:foo.bar>.
  grunt.registerHelper('config', config);

  // Read a JSON file. Most useful as a directive like <json:package.json>.
  var jsons = {};
  grunt.registerHelper('json', function(filepath) {
    // Don't re-fetch if being called as a directive and JSON is already cached.
    if (!this.directive || !(filepath in jsons)) {
      jsons[filepath] = file.readJSON(filepath);
    }
    return jsons[filepath];
  });

  // Return the given source coude with any leading banner comment stripped.
  grunt.registerHelper('strip_banner', function(src, options) {
    if (!options) { options = {}; }
    var m = [];
    if (options.line) {
      // Strip // ... leading banners.
      m.push('(?:.*\\/\\/.*\\n)*\\s*');
    }
    if (options.block) {
      // Strips all /* ... */ block comment banners.
      m.push('\\/\\*[\\s\\S]*?\\*\\/');
    } else {
      // Strips only /* ... */ block comment banners, excluding /*! ... */.
      m.push('\\/\\*[^!][\\s\\S]*?\\*\\/');
    }
    var re = new RegExp('^\\s*(?:' + m.join('|') + ')\\s*', '');
    return src.replace(re, '');
  });

  // Get a source file's contents with any leading banner comment stripped. If
  // used as a directive, get options from the flags object.
  grunt.registerHelper('file_strip_banner', function(filepath, opts) {
    var src = file.read(filepath);
    return grunt.helper('strip_banner', src, this.directive ? this.flags : opts);
  });

  // Generate banner from template.
  grunt.registerHelper('banner', function(prop) {
    if (!prop) { prop = 'meta.banner'; }
    var banner;
    var tmpl = config(prop);
    if (tmpl) {
      // Now, log.
      verbose.write('Generating banner...');
      try {
        // Compile and run template, using config object as the data source.
        banner = template.process(tmpl) + utils.linefeed;
        verbose.ok();
      } catch(e) {
        banner = '';
        verbose.error();
        grunt.warn(e, 11);
      }
    } else {
      grunt.warn('No "' + prop + '" banner template defined.', 11);
      banner = '';
    }
    return banner;
  });

};
