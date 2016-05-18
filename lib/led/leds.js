var Led = require("./led");
var Collection = require("../mixins/collection");

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


Collection.installMethodForwarding(
  Leds.prototype, Led.prototype
);

module.exports = Leds;
