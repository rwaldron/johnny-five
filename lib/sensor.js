var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap;

// Sensor instance private data
var sensors = new WeakMap(),
    changeEvents = [
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
    ];

/**
 * Sensor Generic analog or digital sensor constructor
 * @param {Object} opts Options: pin, freq, range
 */
function Sensor( opts ) {

  if ( !(this instanceof Sensor) ) {
    return new Sensor( opts );
  }

  var value, last, min, max, vranges, samples;

  value = null;
  last = null;
  min = 1023;
  max = 0;
  samples = [];


  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;
  this.mode = this.firmata.MODES.ANALOG;
  this.pin = opts.pin || 0;

  // Set the pin to INPUT mode
  this.firmata.pinMode( this.pin, this.mode );

  // Servo instance properties
  this.freq = opts.freq || 25;
  this.range = opts.range || [ 0, 1023 ];

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
    var err, median;

    err = null;

    // To reduce noise in sensor readings, sort collected samples
    // from high to low and select the value in the center.
    median = samples.sort()[ Math.floor(samples.length / 2) ];

    // Emit the continuous "read" event
    this.emit( "read", err, median );

    // If the median value for this interval is not the same as the
    // median value in the last interval, fire a "change" event.
    //
    // Includes all aliases
    if ( median !== last ) {
      changeEvents.forEach(function( change ) {
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
  sensors.set( this, {
    scale: null,
    value: 0
  });


  Object.defineProperties( this, {
    normalized: {
      get: function() {
        return value === null ? null :
          Board.map( value, this.range[0], this.range[1], 0, 255 );
      }
    },
    constrained: {
      get: function() {
        return value === null ? null :
          Board.constrain( this.normalized, 0, 255 );
      }
    },
    scaled: {
      get: function() {
        var mapped, constrain, scale;

        scale = sensors.get( this ).scale;

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

        state = sensors.get( this );

        if ( state.scale ) {
          return this.scaled;
        }

        return value;
      }
    }
  });
}

util.inherits( Sensor, events.EventEmitter );


/**
 * pinMode Change the sensor's pinMode on the fly
 * @param  {Number} mode Sensor pin mode value
 * @return {Object} instance
 */
Sensor.prototype.pinMode = function( mode ) {
  this.mode = mode;
  this.firmata.pinMode( this.pin, mode );
  return this;
};

/**
 * scale Set a value scaling range
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
  var range, state;

  range = [ low, high ];

  state = sensors.get( this );

  if ( arguments.length === 1 && Array.isArray(low) ) {
    range = low;
  }

  state.scale = range;

  sensors.set( this, state );

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
  this.on("read", function() {
    if ( this.value >= range[0] && this.value <= range[1] ) {
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
