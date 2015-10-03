var Board = require("../lib/board.js");
var Pins = Board.Pins;
var __ = require("../lib/fn.js");
var events = require("events");
var util = require("util");

// Button instance private data
var priv = new Map(),
  aliases = {
    down: ["down", "press", "tap", "impact", "hit"],
    up: ["up", "release"]
  };


/**
 * Button
 * @constructor
 *
 * five.Button();
 *
 * five.Button({
 *   pin: 10
 * });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Button(opts) {
  var timeout;
  var pinValue;
  var isFirmata;

  // Create a 5 ms debounce boundary on event triggers
  // this avoids button events firing on
  // press noise and false positives
  var trigger = __.debounce(function(key) {
    aliases[key].forEach(function(type) {
      this.emit(type, null);
    }, this);
  }, 7);

  if (!(this instanceof Button)) {
    return new Button(opts);
  }

  pinValue = typeof opts === "object" ? opts.pin : opts;

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  isFirmata = Pins.isFirmata(this);

  if (isFirmata && typeof pinValue === "string" && pinValue[0] === "A") {
    pinValue = this.io.analogPins[+pinValue.slice(1)];
  }

  pinValue = +pinValue;

  // Set the pin to INPUT mode
  this.mode = this.io.MODES.INPUT;

  // Option to enable the built-in pullup resistor
  this.isPullup = opts.isPullup || false;

  if (isFirmata && !Number.isNaN(pinValue)) {
    this.pin = pinValue;
  }

  this.io.pinMode(this.pin, this.mode);

  // Enable the pullup resistor after setting pin mode
  if (this.isPullup) {
    this.io.digitalWrite(this.pin, this.io.HIGH);
  }

  // Turns out some button circuits will send
  // 0 for up and 1 for down, and some the inverse,
  // so we can invert our function with this option.
  // Default to invert in pullup mode, but use opts.invert
  // if explicitly defined (even if false)
  this.invert = typeof opts.invert !== "undefined" ?
    opts.invert : (this.isPullup || false);

  this.downValue = this.invert ? 0 : 1;
  this.upValue = this.invert ? 1 : 0;

  // Button instance properties
  this.holdtime = opts && opts.holdtime || 500;

  // Create a "state" entry for privately
  // storing the state of the button
  priv.set(this, {
    isDown: false
  });

  // Analog Read event loop
  this.io.digitalRead(this.pin, function(data) {
    // data = upValue, this.isDown = true
    // indicates that the button has been released
    // after previously being pressed
    if (data === this.upValue && this.isDown) {
      if (timeout) {
        clearTimeout(timeout);
      }
      priv.get(this).isDown = false;

      trigger.call(this, "up");
    }

    // data = downValue, this.isDown = false
    // indicates that the button has been pressed
    // after previously being released
    if (data === this.downValue && !this.isDown) {

      // Update private data
      priv.get(this).isDown = true;

      // Call debounced event trigger for given "key"
      // This will trigger all event aliases assigned
      // to "key"
      trigger.call(this, "down" /* key */ );

      timeout = setTimeout(function() {
        if (this.isDown) {
          this.emit("hold");
        }
      }.bind(this), this.holdtime);
    }
  }.bind(this));

  Object.defineProperties(this, {
    value: {
      get: function() {
        return Number(this.isDown);
      }
    },
    isDown: {
      get: function() {
        return priv.get(this).isDown;
      }
    }
  });
}

util.inherits(Button, events.EventEmitter);


/**
 * Fired when the button is pressed down
 *
 * @event
 * @name down
 * @memberOf Button
 */

/**
 * Fired when the button is held
 *
 * @event
 * @name hold
 * @memberOf Button
 */

/**
 * Fired when the button is released
 *
 * @event
 * @name up
 * @memberOf Button
 */


module.exports = Button;
