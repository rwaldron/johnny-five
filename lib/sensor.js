var Board = require("./board");
var Fn = require("./fn");
var events = require("events");
var util = require("util");
var Collection = require("./mixins/collection");
var within = require("./mixins/within");


// Sensor instance private data
var priv = new Map();
// var aliases = {
//   change: [
//     // Generic sensor value change
//     "change",
//     // Slider sensors (alias)
//     "slide",
//     // Soft Potentiometer (alias)
//     "touch",
//     // Force Sensor (alias)
//     "force",
//     // Flex Sensor (alias)
//     "bend"
//   ]
// };

// To reduce noise in sensor readings, sort collected samples
// from high to low and select the value in the center.
function median(input) {
  // faster than default comparitor (even for small n)
  var sorted = input.sort(function(a, b) {
    return a - b;
  });
  var len = sorted.length;
  var half = Math.floor(len / 2);

  // If the length is odd, return the midpoint m
  // If the length is even, return average of m & m + 1
  return len % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
}

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

  // Defaults to 10-bit resolution
  var resolution = 0x3FF;
  var raw = null;
  var last = -1;
  var samples = [];

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  if (!opts.type) {
    opts.type = "analog";
  }

  if (this.io.RESOLUTION &&
      (this.io.RESOLUTION.ADC &&
        (this.io.RESOLUTION.ADC !== resolution))) {
    resolution = this.io.RESOLUTION.ADC;
  }

  // Set the pin to ANALOG (INPUT) mode
  this.mode = opts.type === "digital" ?
    this.io.MODES.INPUT :
    this.io.MODES.ANALOG;

  this.io.pinMode(this.pin, this.mode);

  // Create a "state" entry for privately
  // storing the state of the sensor
  var state = {
    enabled: typeof opts.enabled === "undefined" ? true : opts.enabled,
    booleanBarrier: opts.type === "digital" ? 0 : null,
    intervalId: null,
    scale: null,
    value: 0,
    median: 0,
    freq: opts.freq || 25,
    previousFreq: opts.freq || 25,
  };
  // Put a reference where the prototype methods defined in this file have access
  priv.set(this, state);

  // Sensor instance properties
  this.range = opts.range || [0, resolution];
  this.limit = opts.limit || null;
  this.threshold = opts.threshold === undefined ? 1 : opts.threshold;
  this.isScaled = false;

  this.io[opts.type + "Read"](this.pin, function(data) {
    raw = data;

    // Only append to the samples when noise filtering can/will be used
    if (opts.type !== "digital") {
      samples.push(raw);
    }
  }.bind(this));

  // Throttle
  // TODO: The event (interval) processing function should be outside of the Sensor
  // constructor function (with appropriate passed (and bound?) arguments), to
  // avoid creating a separate copy (of the function) for each Sensor instance.
  var eventProcessing = function() {
    var err, boundary;

    err = null;

    // For digital sensors, skip the analog
    // noise filtering provided below.
    if (opts.type === "digital") {
      this.emit("data", raw);

      /* istanbul ignore else */
      if (last !== raw) {
        this.emit("change", raw);
        last = raw;
      }
      return;
    }

    // Keep the previous calculated value if there were no new readings
    if (samples.length > 0) {
      // Filter the accumulated sample values to reduce analog reading noise
      state.median = median(samples);
    }

    var roundMedian = Math.round(state.median);

    this.emit("data", roundMedian);

    // If the filtered (state.median) value for this interval is at least ± the
    // configured threshold from last, fire change events
    if (state.median <= (last - this.threshold) || state.median >= (last + this.threshold)) {
      this.emit("change", roundMedian);
      // Update the instance-local `last` value (only) when a new change event
      // has been emitted.  For comparison in the next interval
      last = state.median;
    }

    if (this.limit) {
      if (state.median <= this.limit[0]) {
        boundary = "lower";
      }
      if (state.median >= this.limit[1]) {
        boundary = "upper";
      }

      if (boundary) {
        this.emit("limit", {
          boundary: boundary,
          value: roundMedian
        });
        this.emit("limit:" + boundary, roundMedian);
      }
    }

    // Reset samples
    samples.length = 0;
  }.bind(this); // ./function eventProcessing()


  Object.defineProperties(this, {
    raw: {
      get: function() {
        return raw;
      }
    },
    analog: {
      get: function() {
        if (opts.type === "digital") {
          return raw;
        }

        return raw === null ? 0 :
          Fn.map(this.raw, 0, resolution, 0, 255) | 0;
      },
    },
    constrained: {
      get: function() {
        if (opts.type === "digital") {
          return raw;
        }

        return raw === null ? 0 :
          Fn.constrain(this.raw, 0, 255);
      }
    },
    boolean: {
      get: function() {
        var state = priv.get(this);
        var booleanBarrier = state.booleanBarrier;
        var scale = state.scale || [0, resolution];

        if (booleanBarrier === null) {
          booleanBarrier = scale[0] + (scale[1] - scale[0]) / 2;
        }

        return this.value > booleanBarrier;
      }
    },
    scaled: {
      get: function() {
        var mapped, constrain;

        if (state.scale && raw !== null) {
          if (opts.type === "digital") {
            // Value is either 0 or 1, use as an index
            // to return the scaled value.
            return state.scale[raw];
          }

          mapped = Fn.fmap(raw, this.range[0], this.range[1], state.scale[0], state.scale[1]);
          constrain = Fn.constrain(mapped, state.scale[0], state.scale[1]);

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

        return raw;
      }
    },
    resolution: {
      get: function() {
        return resolution;
      }
    }
  });

  /* istanbul ignore else */
  if (!!process.env.IS_TEST_MODE) {
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
Object.assign(Sensor.prototype, within);

/**
 * enable Enable a disabled sensor.
 *
 * @return {Object} instance
 *
 */
Sensor.prototype.enable = function() {
  var state = priv.get(this);

  /* istanbul ignore else */
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

  /* istanbul ignore else */
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

/**
 * scaleTo Scales value to integer representation
 * @param  {Number} low  An array containing a lower and upper bound
 *
 * @param  {Number} low  A number to use as a lower bound
 * @param  {Number} high A number to use as an upper bound
 * @return {Number}      The scaled value
 */
Sensor.prototype.scaleTo = function(low, high) {
  var scale = Array.isArray(low) ? low : [low, high];
  return Fn.map(this.raw, 0, this.resolution, scale[0], scale[1]);
};

/**
 * fscaleTo Scales value to single precision float representation
 * @param  {Number} low  An array containing a lower and upper bound
 *
 * @param  {Number} low  A number to use as a lower bound
 * @param  {Number} high A number to use as an upper bound
 * @return {Number}      The scaled value
 */
Sensor.prototype.fscaleTo = function(low, high) {
  var scale = Array.isArray(low) ? low : [low, high];
  return Fn.fmap(this.raw, 0, this.resolution, scale[0], scale[1]);
};

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



/**
 * Sensors()
 * new Sensors()
 *
 * Constructs an Array-like instance of all servos
 */
function Sensors(numsOrObjects) {
  if (!(this instanceof Sensors)) {
    return new Sensors(numsOrObjects);
  }

  Object.defineProperty(this, "type", {
    value: Sensor
  });

  Collection.Emitter.call(this, numsOrObjects);
}

util.inherits(Sensors, Collection.Emitter);


Collection.installMethodForwarding(
  Sensors.prototype, Sensor.prototype
);

// Assign Sensors Collection class as static "method" of Sensor.
Sensor.Collection = Sensors;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Sensor.purge = function() {
    priv.clear();
  };
}


module.exports = Sensor;
