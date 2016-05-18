var RGB = require("./rgb");
var Collection = require("../mixins/collection");

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

module.exports = RGBs;
