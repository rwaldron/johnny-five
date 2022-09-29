const Animation = require("../animation");
const Collection = require("../mixins/collection");
const RGB = require("./rgb");


/**
 * RGBs()
 * new RGBs()
 *
 * Create an Array-like object instance of RGBs
 * @alias RGB.Collection
 * @constructor
 * @return {RGBs}
 */
class RGBs extends Collection {
  constructor(numsOrObjects) {
    super(numsOrObjects);
  }
  get type() {
    return RGB;
  }

  /**
   * Animation.normalize
   *
   * @param [number || object] keyFrames An array of step values or
   *                                     a keyFrame objects
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
  RGBs.prototype, RGB.prototype,
  {
    skip: [Animation.normalize, Animation.render]
  }
);

Collection.installCallbackReconciliation(
  RGBs.prototype,
  ["blink"]
);


/**
 * For multi-property animation, must define
 * the keys to use for tween calculation.
 */
RGBs.prototype[Animation.keys] = RGB.colors;


module.exports = RGBs;
