var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  within = require("./mixins/within"),
  __ = require("./fn");

var priv = new Map();
var Devices;

/**
 * Sonar
 * @constructor
 *
 * @param {Object} opts Options: pin (analog)
 */

function Sonar(opts) {

  if (!(this instanceof Sonar)) {
    return new Sonar(opts);
  }

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  var device, state;

  // Sonar instance properties
  this.freq = opts.freq || 100;
  this.value = null;

  state = {
    last: 0,
    median: 0,
    samples: []
  };

  priv.set(this, state);

  if (typeof opts.device === "string") {
    device = Devices[opts.device];
  } else {
    device = opts.device;
  }

  if (typeof device === "undefined") {
    device = Devices.DEFAULT;
  }

  device.initialize.call(this, opts);

  if (!device.descriptor.inches) {
    device.descriptor.inches = {
      get: function() {
        return +(this.cm * 0.39).toFixed(2);
      }
    };
  }

  device.descriptor.in = device.descriptor.inches;

  Object.defineProperties(this, device.descriptor);

  // Throttle
  setInterval(function() {
    var err = null;

    // Nothing read since previous interval
    if (state.samples.length === 0) {
      return;
    }

    state.median = state.samples.sort()[Math.floor(state.samples.length / 2)];
    this.value = state.median;

    // @DEPRECATE
    this.emit("read", err, state.median);
    // The "read" event has been deprecated in
    // favor of a "data" event.
    this.emit("data", err, state.median);


    // If the state.median value for this interval is not the same as the
    // state.median value in the last interval, fire a "change" event.
    //
    if (state.last && state.median &&
      (state.median.toFixed(1) !== state.last.toFixed(1))) {
      this.emit("change", err, state.median);
    }

    // Store this media value for comparison
    // in next interval
    state.last = state.median;

    // Reset state.samples;
    state.samples.length = 0;
  }.bind(this), this.freq);
}

util.inherits(Sonar, events.EventEmitter);
__.mixin(Sonar.prototype, within);

Devices = {
  SRF10: {
    initialize: function(opts) {

      var samples = priv.get(this).samples;
      var address = 0x70;
      var delay = 65;

      // Set up I2C data connection
      this.io.i2cConfig(opts);

      // Startup parameter
      this.io.i2cWrite(address, [0x01, 16]);
      this.io.i2cWrite(address, [0x02, 255]);

      this.io.setMaxListeners(100);

      function read() {
        this.io.i2cWrite(address, [0x02]);
        this.io.i2cReadOnce(address, 2, function(data) {
          samples.push((data[0] << 8) | data[1]);
        }.bind(this));

        prime.call(this);
      }

      function prime() {
        // 0x52 result in us (microseconds)
        this.io.i2cWrite(address, [0x00, 0x52]);

        setTimeout(read.bind(this), delay);
      }

      prime.call(this);
    },
    descriptor: {
      cm: {
        get: function() {
          var median = priv.get(this).median;
          return +((((median / 2) * 343.2) / 10) / 1000).toFixed(1);
        }
      }
    }
  },

  DEFAULT: {
    initialize: function() {
      var samples = priv.get(this).samples;

      // Set the pin to ANALOG mode
      this.mode = this.io.MODES.ANALOG;
      this.io.pinMode(this.pin, this.mode);

      this.io.analogRead(this.pin, function(data) {
        samples.push(data);
      }.bind(this));
    },
    descriptor: {
      cm: {
        get: function() {
          var median = priv.get(this).median;
          return +((median / 2) * 2.54).toFixed(1);
        }
      }
    }
  }
};

Devices.SRF02 = Devices.SRF08 = Devices.SRF10;

module.exports = Sonar;

// Reference
//
// http://www.maxbotix.com/tutorials.htm#Code_example_for_the_BasicX_BX24p
// http://www.electrojoystick.com/tutorial/?page_id=285

// Tutorials
//
// http://www.sensorpedia.com/blog/how-to-interface-an-ultrasonic-rangefinder-with-sensorpedia-via-twitter-guide-2/
