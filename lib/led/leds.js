var Led = require("./led");
var collections = require("../mixins/collections");

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

  var pins = [];

  if (numsOrObjects) {
    while (numsOrObjects.length) {
      var numOrObject = numsOrObjects.shift();
      if (!(numOrObject instanceof Led)) {
        numOrObject = new Led(numOrObject);
      }
      pins.push(numOrObject);
    }
  }

  this.length = pins.length;

  pins.forEach(function(pin, index) {
    this[index] = pin;
  }, this);
}

Object.assign(Leds.prototype, collections);

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
