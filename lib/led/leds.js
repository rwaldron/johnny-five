const Animation = require("../animation");
const Led = require("./led");
const Collection = require("../mixins/collection");

/**
 * new Leds()
 *
 * Create an Array-like object instance of Leds
 * @alias Led.Collection
 * @constructor
 * @return {Leds}
 */

class Leds extends Collection {
  constructor(numsOrObjects) {
    super(numsOrObjects);
  }
  get type() {
    return Led;
  }

  /**
   * Animation.normalize
   *
   * @param [number || object] keyFrames An array of step values or a keyFrame objects
   */
  [Animation.normalize](keyFrameSet) {
    return keyFrameSet.map((keyFrames, index) => {
      if (keyFrames !== null) {
        return this[index][Animation.normalize](keyFrames);
      }
      return keyFrames;
    });
  }

  /**
   * Animation.render
   *
   * @position [number] array of values to set the leds to
   */
  [Animation.render](frames) {
    return this.each((led, i) => led[Animation.render]([frames[i]]));
  }
}

Collection.installMethodForwarding(
  Leds.prototype, Led.prototype,
  {
    skip: [Animation.normalize, Animation.render]
  }
);

Collection.installCallbackReconciliation(
  Leds.prototype,
  ["pulse", "fade", "fadeIn", "fadeOut", "blink"]
);

// Assign Leds Collection class as static "method" of Led.
Led.Collection = Leds;

module.exports = Leds;
