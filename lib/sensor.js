var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  within = require("./mixins/within"),
  __ = require("./fn");

// Sensor instance private data
var priv = new Map(),
  aliases = {
    change: [
      // Generic sensor value change
      "change",
      // Slider sensors (alias)
      "slide",
      // Soft Potentiometer (alias)
      "touch",
      // Force Sensor (alias)
      "force",
      // Flex Sensor (alias)
      "bend"
    ]
  };


/**
 * Sensor
 * @constructor
 *
 * @description Generic analog or digital sensor constructor
 *
 * @param {Object} opts Options: pin, freq, range
 */

function Sensor(opts) {

  if (!(this instanceof Sensor)) {
    return new Sensor(opts);
  }

  var value, last, min, max, samples;

  value = null;
  last = null;
  min = 1023;
  max = 0;
  samples = [];

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  if (!opts.type) {
    opts.type = "analog";
  }

  // Set the pin to ANALOG (INPUT) mode
  this.mode = opts.type === "digital" ?
    this.io.MODES.INPUT :
    this.io.MODES.ANALOG;

  this.io.pinMode(this.pin, this.mode);

  // Sensor instance properties
  this.freq = opts.freq || 25;
  this.range = opts.range || [0, 1023];
  this.limit = opts.limit || null;
  this.threshold = opts.threshold === undefined ? 1 : opts.threshold;
  this.isScaled = false;

  // Read event loop
  this.io[opts.type + "Read"](this.pin, function(data) {
    var err = null;

    // Update the closed over last value.
    last = value;

    // Update the closed over `value`. This is
    // shared by the accessors defined below.
    value = data;

    // For digital sensors, skip the analog
    // noise filtering provided below.
    if (opts.type === "digital") {
      this.emit("data", err, value);

      if (last !== value) {
        aliases.change.forEach(function(change) {
          this.emit(change, err, value);
        }, this);
      }
    } else {
      samples.push(value);
    }

  }.bind(this));

  // Throttle
  setInterval(function() {
    var err, median, low, high, boundary;

    err = null;

    if (opts.type === "digital") {
      return;
    }

    // To reduce noise in sensor readings, sort collected samples
    // from high to low and select the value in the center.
    median = (function(input) {
      var half, len, sorted;
      // faster than default comparitor (even for small n)
      sorted = input.sort(function(a, b) {
        return a - b;
      });
      len = sorted.length;
      half = Math.floor(len / 2);

      // If the length is odd, return the midpoint m
      // If the length is even, return average of m & m + 1
      return len % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
    }(samples));

    // @DEPRECATE
    this.emit("read", err, median);
    // The "read" event has been deprecated in
    // favor of a "data" event.
    this.emit("data", err, median);

    // If the median value for this interval is outside last +/- a threshold
    // fire a change event

    low = last - this.threshold;
    high = last + this.threshold;

    // Includes all aliases
    // Prevent events from firing if the latest value is the same as
    // the last value to trigger a change event
    if (median < low || median > high) {
      aliases.change.forEach(function(change) {
        this.emit(change, err, median);
      }, this);
    }


    if (this.limit) {
      if (median <= this.limit[0]) {
        boundary = "lower";
      }
      if (median >= this.limit[1]) {
        boundary = "upper";
      }

      if (boundary) {
        this.emit("limit", err, {
          boundary: boundary,
          value: median
        });
        this.emit("limit:" + boundary, err, median);
      }
    }

    // Store this media value for comparison
    // in next interval
    last = median;

    // Reset samples
    samples.length = 0;
  }.bind(this), this.freq);

  // Create a "state" entry for privately
  // storing the state of the sensor
  priv.set(this, {
    booleanBarrier: opts.type === "digital" ? 0 : 512,
    scale: null,
    value: 0
  });


  Object.defineProperties(this, {
    raw: {
      get: function() {
        return value;
      }
    },
    analog: {
      get: function() {
        if (opts.type === "digital") {
          return value;
        }

        return value === null ? null :
          Board.map(this.raw, 0, 1023, 0, 255) | 0;
      }
    },
    constrained: {
      get: function() {
        if (opts.type === "digital") {
          return value;
        }

        return value === null ? null :
          Board.constrain(this.raw, 0, 255);
      }
    },
    boolean: {
      get: function() {
        return this.value > priv.get(this).booleanBarrier ?
          true : false;
      }
    },
    scaled: {
      get: function() {
        var mapped, constrain, scale;

        scale = priv.get(this).scale;

        if (scale && value !== null) {
          if (opts.type === "digital") {
            // Value is either 0 or 1, use as an index
            // to return the scaled value.
            return scale[value];
          }

          mapped = Board.map(value, this.range[0], this.range[1], scale[0], scale[1]);
          constrain = Board.constrain(mapped, scale[0], scale[1]);


          return constrain;
        }
        return this.constrained;
      }
    },
    value: {
      get: function() {
        var state;

        state = priv.get(this);

        if (state.scale) {
          this.isScaled = true;
          return this.scaled;
        }

        return value;
      }
    }
  });
}

util.inherits(Sensor, events.EventEmitter);

/**
 * EXPERIMENTAL
 *
 * within When value is within the provided range, execute callback
 *
 * @param {Number} range Upperbound, converted into an array,
 *                       where 0 is lowerbound
 * @param {Function} callback Callback to execute when value falls inside range
 * @return {Object} instance
 *
 *
 * @param {Array} range Lower to Upper bounds [ low, high ]
 * @param {Function} callback Callback to execute when value falls inside range
 * @return {Object} instance
 *
 */
__.mixin(Sensor.prototype, within);


/**
 * scale/scaleTo Set a value scaling range
 *
 * @param  {Number} low  Lowerbound
 * @param  {Number} high Upperbound
 * @return {Object} instance
 *
 * @param  {Array} [ low, high]  Lowerbound
 * @return {Object} instance
 *
 */
Sensor.prototype.scale = function(low, high) {
  this.isScaled = true;

  priv.get(this).scale = Array.isArray(low) ?
    low : [low, high];

  return this;
};

Sensor.prototype.scaleTo = Sensor.prototype.scale;

/**
 * booleanAt Set a midpoint barrier value used to calculate returned value of
 *           .boolean property.
 *
 * @param  {Number} barrier
 * @return {Object} instance
 *
 */

Sensor.prototype.booleanAt = function(barrier) {
  priv.get(this).booleanBarrier = barrier;
  return this;
};




module.exports = Sensor;

// Reference
// http://itp.nyu.edu/physcomp/Labs/Servo
// http://arduinobasics.blogspot.com/2011/05/arduino-uno-flex-sensor-and-leds.html



// TODO:
// Update comments/docs
