var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

// Sensor instance private data
var priv = new WeakMap(),
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
function Sensor( opts ) {

  if ( !(this instanceof Sensor) ) {
    return new Sensor( opts );
  }

  var value, last, min, max, samples;

  value = null;
  last = null;
  min = 1023;
  max = 0;
  samples = [];

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  // Set the pin to ANALOG (INPUT) mode
  this.mode = this.firmata.MODES.ANALOG;
  this.firmata.pinMode( this.pin, this.mode );

  // Sensor instance properties
  this.freq = opts.freq || 25;
  this.range = opts.range || [ 0, 1023 ];
  this.threshold = opts.threshold === undefined ? 1 : opts.threshold;
  this.isScaled = false;

  // Analog Read event loop
  this.firmata.analogRead( this.pin, function( data ) {

    // In the first 5 seconds, we will receive min/max
    // calibration values which will be used to
    // map and scale all sensor readings from this pin
    // if ( data > max ) {
    //   this.range[1] = max = data;
    // }

    // if ( data < min ) {
    //   this.range[0] = min = data;
    // }

    // Update the closed over `value`
    value = data;

    samples.push( data );

  }.bind(this));

  // Throttle
  setInterval(function() {
    var err, median, low, high;

    err = null;

    // To reduce noise in sensor readings, sort collected samples
    // from high to low and select the value in the center.
    median = (function( input ) {
      var half, len, sorted;
      // faster than default comparitor (even for small n)
      sorted = input.sort(function( a, b ) {
        return a - b;
      });
      len = sorted.length;
      half = Math.floor( len / 2 );

      // If the length is odd, return the midpoint m
      // If the length is even, return average of m & m + 1
      return len % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
    }( samples ));

    // @DEPRECATE
    this.emit( "read", err, median );
    // The "read" event has been deprecated in
    // favor of a "data" event.
    this.emit( "data", err, median );

    // If the median value for this interval is outside last +/- a threshold
    // fire a change event

    low = last - this.threshold;
    high = last + this.threshold;

    // Includes all aliases
    // Prevent events from firing if the latest value is the same as
    // the last value to trigger a change event
    if ( median < low || median > high ) {
      aliases.change.forEach(function( change ) {
        this.emit( change, err, median );
      }, this );
    }

    // Store this media value for comparison
    // in next interval
    last = median;

    // Reset samples
    samples.length = 0;
  }.bind(this), this.freq );

  // Create a "state" entry for privately
  // storing the state of the sensor
  priv.set( this, {
    booleanBarrier: 512,
    scale: null,
    value: 0
  });


  Object.defineProperties( this, {
    raw: {
      get: function() {
        return value;
      }
    },
    analog: {
      get: function() {
        return value === null ? null :
          Board.map( this.raw, 0, 1023, 0, 255 ) | 0;
      }
    },
    constrained: {
      get: function() {
        return value === null ? null :
          Board.constrain( this.raw, 0, 255 );
      }
    },
    boolean: {
      get: function() {
        return this.value > priv.get( this ).booleanBarrier ?
          true : false;
      }
    },
    scaled: {
      get: function() {
        var mapped, constrain, scale;

        scale = priv.get( this ).scale;

        if ( scale && value !== null ) {
          mapped = Board.map( value, this.range[0], this.range[1], scale[0], scale[1] );
          constrain = Board.constrain( mapped, scale[0], scale[1] );

          return constrain;
        }
        return this.constrained;
      }
    },
    value: {
      get: function() {
        var state;

        state = priv.get( this );

        if ( state.scale ) {
          this.isScaled = true;
          return this.scaled;
        }

        return value;
      }
    }
  });
}

util.inherits( Sensor, events.EventEmitter );

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
Sensor.prototype.scale = function( low, high ) {
  this.isScaled = true;

  priv.get( this ).scale = Array.isArray(low) ?
    low : [ low, high ];

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

Sensor.prototype.booleanAt = function( barrier ) {
  priv.get(this).booleanBarrier = barrier;
  return this;
};

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
Sensor.prototype.within = function( range, callback ) {
  var upper;

  if ( typeof range === "number" ) {
    upper = range;
    range = [ 0, upper ];
  }

  if ( !Array.isArray(range) ) {
    this.emit( "error", { message: "range must be an array" } );
    return;
  }

  // Use the continuous read event for high resolution
  this.on("data", function() {
    var value = this.value|0;
    if ( value >= range[0] && value <= range[1] ) {
      callback.call( this, null );
    }
  }.bind(this));


  return this;
};

module.exports = Sensor;

// Reference
// http://itp.nyu.edu/physcomp/Labs/Servo
// http://arduinobasics.blogspot.com/2011/05/arduino-uno-flex-sensor-and-leds.html



// TODO:
// Update comments/docs
