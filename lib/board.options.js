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

function Options(arg) {
  if (!(this instanceof Options)) {
    return new Options(arg);
  }

  var opts = {};

  if (typeof arg === "number" ||
    typeof arg === "string") {
    opts.pin = arg;
  } else if (Array.isArray(arg)) {
    opts.pins = arg;
  } else {
    opts = arg;
  }

  _.assign(this, opts);
}

module.exports = Options;
