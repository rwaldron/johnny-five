var Animation = require("../animation");
var Led = require("./led");
var callbacks = require("./callbacks");
var Collection = require("../mixins/collection");
var util = require("util");

/**
 * Leds()
 * new Leds()
 *
 * Create an Array-like object instance of Leds
 * @alias Led.Array
 * @constructor
 * @return {Leds}
 */
function Leds(numsOrObjects) {
  if (!(this instanceof Leds)) {
    return new Leds(numsOrObjects);
  }

  Object.defineProperty(this, "type", {
    value: Led
  });

  Collection.call(this, numsOrObjects);
}

util.inherits(Leds, Collection);

Collection.installMethodForwarding(
  Leds.prototype, Led.prototype
);

callbacks(Leds, ["pulse", "fade", "fadeIn", "fadeOut", "blink"]);

/**
 * Animation.normalize
 *
 * @param [number || object] keyFrames An array of step values or a keyFrame objects
 */

Leds.prototype[Animation.normalize] = function(keyFrameSet) {
  return keyFrameSet.map(function(keyFrames, index) {
    if (keyFrames !== null) {
      return this[index][Animation.normalize](keyFrames);
    }
    return keyFrames;
  }, this);
};

/**
 * Animation.render
 *
 * @position [number] array of values to set the leds to
 */

Leds.prototype[Animation.render] = function(frames) {
  return this.each(function(led, i) {
    led[Animation.render]([frames[i]]);
  });
};


module.exports = Leds;
