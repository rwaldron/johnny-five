var Animation = require("../animation");
var callbacks = require("./callbacks");
var Collection = require("../mixins/collection");
var RGB = require("./rgb");

/**
 * RGBs()
 * new RGBs()
 *
 * Create an Array-like object instance of RGBs
 * @alias Led.RGB.Collection
 * @constructor
 * @return {RGBs}
 */
function RGBs(numsOrObjects) {
  if (!(this instanceof RGBs)) {
    return new RGBs(numsOrObjects);
  }

  Object.defineProperty(this, "type", {
    value: RGB
  });

  Collection.call(this, numsOrObjects);
}

RGBs.prototype = Object.create(Collection.prototype, {
  constructor: {
    value: RGBs
  }
});

Collection.installMethodForwarding(
  RGBs.prototype, RGB.prototype
);

callbacks(RGBs, ["blink"]);


/**
 * Animation.normalize
 *
 * @param [number || object] keyFrames An array of step values or a keyFrame objects
 */

RGBs.prototype[Animation.normalize] = function(keyFrameSet) {
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

RGBs.prototype[Animation.render] = function(frames) {
  return this.each(function(rgb, i) {
    rgb[Animation.render]([frames[i]]);
  });
};

/**
 * For multi-property animation, must define
 * the keys to use for tween calculation.
 */
RGBs.prototype[Animation.keys] = RGB.colors;


module.exports = RGBs;
