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
  var nodeunit = require('nodeunit');
  var nodeunitUtils = require('nodeunit/lib/utils');

  // ==========================================================================
  // CUSTOM NODEUNIT REPORTER
  // ==========================================================================

  // Keep track of the last-started module.
  var currentModule;
  // Keep track of the last-started test(s).
  var unfinished = {};

  // If Nodeunit explodes because a test was missing test.done(), handle it.
  process.on('exit', function() {
    var len = Object.keys(unfinished).length;
    // If there are unfinished tests, tell the user why Nodeunit killed grunt.
    if (len > 0) {
      log.muted = false;
      verbose.error().or.writeln('F'.red);
      log.error('Incomplete tests/setups/teardowns:');
      Object.keys(unfinished).forEach(log.error, log);
      grunt.fatal('A test was missing test.done(), so nodeunit exploded. Sorry!',
        Math.min(99, 90 + len));
    }
  });

  // Keep track of failed assertions for pretty-printing.
  var failedAssertions = [];
  function logFailedAssertions() {
    var assertion, stack;
    // Print each assertion error + stack.
    while (assertion = failedAssertions.shift()) {
      nodeunitUtils.betterErrors(assertion);
      verbose.or.error(assertion.testName);
      if (assertion.error.name === 'AssertionError' && assertion.message) {
        log.error('AssertionMessage: ' + assertion.message.magenta);
      }
      stack = assertion.error.stack.replace(/ {4}(at)/g, '  $1');
      stack = stack.replace(/:(.*?\n)/, '$1'.magenta);
      log.error(stack + '\n').writeln();
    }
  }

  // Define our own Nodeunit reporter.
  nodeunit.reporters.grunt = {
    info: 'Grunt reporter',
    run: function(files, options, callback) {
      var opts = {
        // No idea.
        testspec: undefined,
        // Executed when the first test in a file is run. If no tests exist in
        // the file, this doesn't execute.
        moduleStart: function(name) {
          // Keep track of this so that moduleDone output can be suppressed in
          // cases where a test file contains no tests.
          currentModule = name;
          verbose.subhead('Testing ' + name).or.write('Testing ' + name);
        },
        // Executed after a file is done being processed. This executes whether
        // tests exist in the file or not.
        moduleDone: function(name) {
          // Abort if no tests actually ran.
          if (name !== currentModule) { return; }
          // Print assertion errors here, if verbose mode is disabled.
          if (!option('verbose')) {
            if (failedAssertions.length > 0) {
              log.writeln();
              logFailedAssertions();
            } else {
              log.ok();
            }
          }
        },
        // Executed before each test is run.
        testStart: function(name) {
          // Keep track of the current test, in case test.done() was omitted
          // and Nodeunit explodes.
          unfinished[name] = name;
          verbose.write(name + '...');
          // Mute output, in cases where a function being tested logs through
          // grunt (for testing grunt internals).
          log.muted = true;
        },
        // Executed after each test and all its assertions are run.
        testDone: function(name, assertions) {
          delete unfinished[name];
          // Un-mute output.
          log.muted = false;
          // Log errors if necessary, otherwise success.
          if (assertions.failures()) {
            assertions.forEach(function(ass) {
              if (ass.failed()) {
                ass.testName = name;
                failedAssertions.push(ass);
              }
            });
            if (option('verbose')) {
              log.error();
              logFailedAssertions();
            } else {
              log.write('F'.red);
            }
          } else {
            verbose.ok().or.write('.');
          }
        },
        // Executed when everything is all done.
        done: function (assertions) {
          if (assertions.failures()) {
            grunt.warn(assertions.failures() + '/' + assertions.length +
              ' assertions failed (' + assertions.duration + 'ms)',
              Math.min(99, 90 + assertions.failures()));
          } else {
            verbose.writeln();
            log.ok(assertions.length + ' assertions passed (' +
              assertions.duration + 'ms)');
          }
          // Tell the task manager we're all done.
          callback(); // callback(assertions.failures() === 0);
        }
      };

      // Nodeunit needs absolute paths.
      var paths = files.map(function(filepath) {
        return path.resolve(filepath);
      });
      nodeunit.runFiles(paths, opts);
    }
  };

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('test', 'Run unit tests with nodeunit.', function() {
    // File paths.
    var filepaths = file.expandFiles(this.file.src);
    // Clear all tests' cached require data, in case this task is run inside a
    // "watch" task loop.
    file.clearRequireCache(filepaths);
    // Run test(s)... asynchronously!
    nodeunit.reporters.grunt.run(filepaths, {}, this.async());
  });

};
