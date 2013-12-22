var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util");


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

  var median, last, samples;

  median = 0;
  last = 0;
  samples = [];

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  // Sonar instance properties
  this.freq = opts.freq || 100;
  this.voltage = null;

  // Set the pin to ANALOG mode
  this.mode = this.io.MODES.ANALOG;
  this.io.pinMode(this.pin, this.mode);

  this.io.analogRead(this.pin, function(data) {
    this.voltage = data;

    samples.push(data);
  }.bind(this));

  // Throttle
  setInterval(function() {
    var err;

    err = null;

    // Nothing read since previous interval
    if (samples.length === 0) {
      return;
    }

    median = samples.sort()[Math.floor(samples.length / 2)];

    // @DEPRECATE
    this.emit("read", err, median);
    // The "read" event has been deprecated in
    // favor of a "data" event.
    this.emit("data", err, median);


    // If the median value for this interval is not the same as the
    // median value in the last interval, fire a "change" event.
    //
    if (last && median && (median.toFixed(1) !== last.toFixed(1))) {
      this.emit("change", err, median);
    }

    // Store this media value for comparison
    // in next interval
    last = median;

    // Reset samples;
    samples.length = 0;
  }.bind(this), this.freq);


  Object.defineProperties(this, {
    // Based on the voltage,
    // Calculate the distance in inches and centimeters
    inches: {
      get: function() {
        return +((254 / 1024) * 2 * median).toFixed(1);
      }
    },
    cm: {
      get: function() {
        return +((median / 2) * 2.54).toFixed(1);
      }
    }
  });
}

util.inherits(Sonar, events.EventEmitter);

Sonar.prototype.within = function(range, unit, callback) {
  var upper;

  if (typeof range === "number") {
    upper = range;
    range = [0, upper];
  }

  if (!Array.isArray(range)) {
    this.emit("error", {
      message: "range must be an array"
    });
    return;
  }

  if (unit === "cm" || unit === "inches") {

    // Use the continuous read event for high resolution
    this.on("data", function() {
      var value = this[ unit ] | 0;
      if (value >= range[0] && value <= range[1]) {
        callback.call(this, null);
      }
    }.bind(this));
  }

  return this;
};


module.exports = Sonar;


// Reference
//
// http://www.maxbotix.com/tutorials.htm#Code_example_for_the_BasicX_BX24p
// http://www.electrojoystick.com/tutorial/?page_id=285

// Tutorials
//
// http://www.sensorpedia.com/blog/how-to-interface-an-ultrasonic-rangefinder-with-sensorpedia-via-twitter-guide-2/
