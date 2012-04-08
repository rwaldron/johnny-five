/**
 * Temporary - The lord of tmp.
 * 
 * Author: Veselin Todorov <hi@vesln.com>
 * Licensed under the MIT License.
 */

/**
 * Dependencies.
 */
var path = require('path');
var detector = require('./detector');

/**
 * Generator namespace.
 * 
 * @type {Object}
 */
var generator = module.exports;

/**
 * Generates random name.
 * 
 * @returns {String}
 */
generator.name = function() {
  var id = null;
  var tmp = detector.tmp();
  do {
    id = Date.now() + Math.random();
  } while(path.existsSync(tmp + '/' + id));
  
  return id + '';
};

/**
 * Buld a full name. (tmp dir + name).
 * 
 * @param {String} name
 * @returns {String}
 */
generator.build = function(name) {
  var filename = detector.tmp();
  if (name) filename += name + '.';
  return filename + this.name();
};