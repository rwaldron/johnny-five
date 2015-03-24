var Led = require("./led");

/**
 * Leds()
 * new Leds()
 *
 * Create an Array-like object instance of Leds
 * @alias Led.Array
 * @constructor
 * @return {Leds}
 */
var Leds = function(numsOrObjects) {
  if (!(this instanceof Leds)) {
    return new Leds(numsOrObjects);
  }

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
};


/**
 * each Execute callbackFn for each active led instance in an Leds
 * @param  {Function} callbackFn
 * @return {Leds}
 */
Leds.prototype.each = function(callbackFn) {
  var length = this.length;

  for (var i = 0; i < length; i++) {
    callbackFn.call(this[i], this[i], i);
  }

  return this;
};


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
