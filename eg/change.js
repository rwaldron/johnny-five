"use strict";
/**
 * Change
 *
 * Produces change "tracking" instances
 * to determine if a given value has changed
 * drastically enough
 */

function Change(margin) {
  if (!(this instanceof Change)) {
    return new Change(margin);
  }
  this.last = 0;
  this.margin = margin || 0;
}

/**
 * isNoticeable
 *
 * Determine if a given value has changed
 * enough to be considered "noticeable".
 *
 * @param  {Number} value  [description]
 * @param  {Number} margin Optionally override the
 *                         change instance's margin
 *
 * @return {Boolean} returns true if value is different
 *                           enough from the last value
 *                           to be considered "noticeable"
 */
Change.prototype.isNoticeable = function(value, margin) {
  margin = margin || this.margin;

  if (!Number.isFinite(value)) {
    return false;
  }

  if ((value > this.last + margin) || (value < this.last - margin)) {
    this.last = value;
    return true;
  }
  return false;
};


module.exports = Change;
