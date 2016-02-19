var Board = require("./board"),
  Emitter = require("events").EventEmitter,
  util = require("util"),
  within = require("./mixins/within");

var priv = new Map();

/**
 * Ping
 * @param {Object} opts Options: pin
 */

function Ping(opts) {

  if (!(this instanceof Ping)) {
    return new Ping(opts);
  }

  var last = null;

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  this.pin = opts && opts.pin || 7;
  this.freq = opts.freq || 20;
  // this.pulse = opts.pulse || 250;

  var state = {
    value: null
  };

  // Private settings object
  var settings = {
    pin: this.pin,
    value: this.io.HIGH,
    pulseOut: 5
  };

  this.io.setMaxListeners(100);

  // Interval for polling pulse duration as reported in microseconds
  setInterval(function() {
    this.io.pingRead(settings, function(microseconds) {
      state.value = microseconds;
    });
  }.bind(this), 225);

  // Interval for throttled event
  setInterval(function() {
    if (state.value === null) {
      return;
    }

    // The "read" event has been deprecated in
    // favor of a "data" event.
    this.emit("data", state.value);

    // If the state.value for this interval is not the same as the
    // state.value in the last interval, fire a "change" event.
    if (state.value !== last) {
      this.emit("change", state.value);
    }

    // Store state.value for comparison in next interval
    last = state.value;

    // Reset samples;
    // samples.length = 0;
  }.bind(this), this.freq);

  Object.defineProperties(this, {
    value: {
      get: function() {
        return state.value;
      }
    },
    // Based on the round trip travel time in microseconds,
    // Calculate the distance in inches and centimeters
    inches: {
      get: function() {
        return +(state.value / 74 / 2).toFixed(2);
      }
    },
    in: {
      get: function() {
        return this.inches;
      }
    },
    cm: {
      get: function() {
        return +(state.value / 29 / 2).toFixed(3);
      }
    }
  });

  priv.set(this, state);
}

util.inherits(Ping, Emitter);

Object.assign(Ping.prototype, within);

module.exports = Ping;


//http://itp.nyu.edu/physcomp/Labs/Servo
//http://arduinobasics.blogspot.com/2011/05/arduino-uno-flex-sensor-and-leds.html
//http://protolab.pbworks.com/w/page/19403657/TutorialPings
