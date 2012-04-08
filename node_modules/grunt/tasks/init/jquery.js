/*
 * grunt
 * https://github.com/cowboy/grunt
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

// Basic template description.
exports.description = 'Create a jQuery plugin, including QUnit unit tests.';

// Template-specific notes to be displayed before question prompts.
exports.notes = '_Project name_ must start with "jquery." and should be a ' +
  'unique ID not already in use at plugins.jquery.com. _Project title_ ' +
  'should be a human-readable title, and doesn\'t need to contain the word ' +
  '"jQuery", although it may. For example, a plugin titled "Awesome Plugin" ' +
  'might have the name "jquery.awesome-plugin".';

// Any existing file matching this wildcard will cause a warning.
exports.warnOn = '*';

// The actual init template.
exports.template = function(grunt, init, done) {
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

  grunt.helper('prompt', {type: 'jquery'}, [
    // Prompt for these values.
    grunt.helper('prompt_for', 'name', function(value, data, done) {
      // Prepend "jquery." to current name.
      value = data.full_name = 'jquery.' + value;
      done(null, value);
    }),
    grunt.helper('prompt_for', 'title', function(value, data, done) {
      // Fix jQuery capitalization.
      value = value.replace(/jquery/gi, 'jQuery');
      done(null, value);
    }),
    grunt.helper('prompt_for', 'description', 'The best jQuery plugin ever.'),
    grunt.helper('prompt_for', 'version'),
    grunt.helper('prompt_for', 'repository'),
    grunt.helper('prompt_for', 'homepage'),
    grunt.helper('prompt_for', 'bugs'),
    grunt.helper('prompt_for', 'licenses', 'MIT GPL'),
    grunt.helper('prompt_for', 'author_name'),
    grunt.helper('prompt_for', 'author_email'),
    grunt.helper('prompt_for', 'author_url'),
    grunt.helper('prompt_for', 'jquery_version')
  ], function(err, props) {
    // Files to copy (and process).
    var files = init.filesToCopy(props);

    // Add properly-named license files.
    init.addLicenseFiles(files, props.licenses);

    // Actually copy (and process) files.
    init.copyAndProcess(files, props, {noProcess: 'libs/**'});

    // jQuery plugins depend on jQuery!
    props.dependencies = {jquery: props.jquery_version || '1'};

    // Generate package.json file.
    init.writePackageJSON('package.json', props);

    // All done!
    done();
  });

};
