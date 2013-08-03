var _ = require("lodash");

/**
 * Options
 *
 * @param {String} arg Pin address.
 * @param {Number} arg Pin address.
 * @param {Array} arg List of Pin addresses.
 *
 * @return {Options} normalized board options instance.
 */
function Options( arg ) {
  if ( !(this instanceof Options) ) {
    return new Options( arg );
  }
  var isArray, opts;

  isArray = Array.isArray(arg);
  opts = {};

  if ( typeof arg === "number" ||
        typeof arg === "string" ||
        Array.isArray(arg) ) {
    // Arrays are on a "pins" property
    // String/Numbers are on a "pin" property
    opts[ isArray ? "pins" : "pin" ] = arg;
  } else {
    opts = arg;
  }

  _.assign( this, opts );
}

module.exports = Options;