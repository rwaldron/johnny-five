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
  },
  IS_TEST_MODE = !!process.env.IS_TEST_MODE;

// To reduce noise in sensor readings, sort collected samples
// from high to low and select the value in the center.
function arrayMedian(input) {
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
} // ./arrayMedian(input)

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

  var value, last, min, max, samples, state, median, eventProcessing;

  value = null;
  min = 1023;
  max = 0;
  last = -min;
  samples = [];
  median = NaN;

  Board.Component.call(
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

  // Create a "state" entry for privately
  // storing the state of the sensor
  state = {
    enabled: typeof opts.enabled === "undefined" ? true : opts.enabled,
    booleanBarrier: opts.type === "digital" ? 0 : 512,
    intervalId: null,
    scale: null,
    value: 0,
    freq: opts.freq || 25,
    previousFreq: opts.freq || 25,
  };
  // Put a reference where the prototype methods defined in this file have access
  priv.set(this, state);

  // Sensor instance properties
  this.range = opts.range || [0, 1023];
  this.limit = opts.limit || null;
  this.threshold = opts.threshold === undefined ? 1 : opts.threshold;
  this.isScaled = false;

  // Read event loop
  this.io[opts.type + "Read"](this.pin, function(data) {
    // Update the instance-local `value` value.
    // This is shared by the accessors defined below.
    value = data;

    // Only append to the samples when noise filtering can/will be used
    if (opts.type !== "digital") {
      samples.push(value);
    }
  }.bind(this));

  // Throttle
  // TODO: The event (interval) processing function should be outside of the Sensor
  // constructor function (with appropriate passed (and bound?) arguments), to
  // avoid creating a separate copy (of the function) for each Sensor instance.
  eventProcessing = function() {
    var err, boundary;

    err = null;

    // For digital sensors, skip the analog
    // noise filtering provided below.
    if (opts.type === "digital") {
      this.emit("data", err, value);

      if (last !== value) {
        aliases.change.forEach(function(change) {
          this.emit(change, err, value);
        }, this);
        // Update the instance-local `last` value.
        last = value;
      }
      return;
    }

    // Keep the previous calculated value if there were no new readings
    if (samples.length > 0) {
      // Filter the accumulated sample values to reduce analog reading noise
      median = arrayMedian(samples);
    }
    // @DEPRECATE
    this.emit("read", err, median);
    // The "read" event has been deprecated in
    // favor of a "data" event.
    this.emit("data", err, median);

    // If the filtered (median) value for this interval is at least ± the
    // configured threshold from last, fire change events
    if (median <= (last - this.threshold) || median >= (last + this.threshold)) {
      // Include all aliases
      aliases.change.forEach(function(change) {
        this.emit(change, err, median);
      }, this);
      // Update the instance-local `last` value (only) when a new change event
      // has been emitted.  For comparison in the next interval
      last = median;
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

    // Reset samples
    samples.length = 0;
  }.bind(this); // ./function eventProcessing()


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
        var mapped, constrain;

        if (state.scale && value !== null) {
          if (opts.type === "digital") {
            // Value is either 0 or 1, use as an index
            // to return the scaled value.
            return state.scale[value];
          }

          mapped = Board.fmap(value, this.range[0], this.range[1], state.scale[0], state.scale[1]);
          constrain = Board.constrain(mapped, state.scale[0], state.scale[1]);

          return constrain;
        }
        return this.constrained;
      }
    },
    freq: {
      get: function() {
        return state.freq;
      },
      set: function(newFreq) {
        state.freq = newFreq;
        if (state.intervalId) {
          clearInterval(state.intervalId);
        }

        if (state.freq !== null) {
          state.intervalId = setInterval(eventProcessing, newFreq);
        }
      }
    },
    value: {
      get: function() {
        if (state.scale) {
          this.isScaled = true;
          return this.scaled;
        }

        return value;
      }
    }
  });

  if (IS_TEST_MODE) {
    Object.defineProperties(this, {
      state: {
        get: function() {
          return priv.get(this);
        }
      }
    });
  }

  // Set the freq property only after the get and set functions are defined
  // and only if the sensor is not `enabled: false`
  if (state.enabled) {
    this.freq = state.freq;
  }
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
 * enable Enable a disabled sensor.
 *
 * @return {Object} instance
 *
 */
Sensor.prototype.enable = function() {
  var state = priv.get(this);

  if (!state.enabled) {
    this.freq = state.freq || state.previousFreq;
  }

  return this;
};

/**
 * disable Disable an enabled sensor.
 *
 * @return {Object} instance
 *
 */
Sensor.prototype.disable = function() {
  var state = priv.get(this);

  if (state.enabled) {
    state.enabled = false;
    state.previousFreq = state.freq;
    this.freq = null;
  }

  return this;
};

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
