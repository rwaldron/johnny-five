var Led = require("./led");
var Collection = require("../mixins/collection");
var Animation = require("../animation");

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

Leds.prototype = Object.create(Collection.prototype, {
  constructor: {
    value: Leds
  }
});

[

  "on", "off", "toggle", "brightness",
  "fade", "fadeIn", "fadeOut",
  "pulse", "strobe",
  "stop"

].forEach(function(method) {
  // Create Leds wrappers for each method listed.
  // This will allow us control over all Led instances
  // simultaneously.
  Leds.prototype[method] = function() {
    var length = this.length;

    for (var i = 0; i < length; i++) {
      this[i][method].apply(this[i], arguments);
    }
    return this;
  };
});

Leds.prototype.blink = Leds.prototype.strobe;

/**
 * Animation.normalize
 *
 * @param [number || object] keyFrames An array of step values or a keyFrame objects
 */

Leds.prototype[Animation.normalize] = function(keyFrameSet) {

  keyFrameSet.forEach(function(keyFrames, index) {

    if (keyFrames !== null) {
      var led = this[index];

      // If led is an Leds then user led[0] for default values
      if (led instanceof Leds) {
        led = led[0];
      }

      var last = led.value;

      // If the first keyFrameSet is null use the current position
      if (keyFrames[0] === null) {
        keyFrames[0] = {
          value: last
        };
      }

      if (Array.isArray(keyFrames)) {
        if (keyFrames[0] === null) {
          keyFrameSet[index][0] = {
            value: last
          };
        }
      }
    }

  }, this);

  return keyFrameSet;

};

/**
 * Animation.render
 *
 * @position [number] array of values to set the leds to
 */

Leds.prototype[Animation.render] = function(value) {
  this.each(function(led, i) {
    led.brightness(value[i]);
  });
  return this;
};

module.exports = Leds;
