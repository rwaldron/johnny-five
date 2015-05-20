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

module.exports = Leds;
