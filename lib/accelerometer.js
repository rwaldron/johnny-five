var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    __ = require("../lib/fn.js");

function calculate( method, y, x ) {
  return Math[ method ]( y, x ) * 180 / Math.PI;
}

function acceleration( axis, vRange, sensitivity ) {
  var voltage;

  // convert raw reading to voltage
  // (read * vRange / 1024) - (vRange / 2)
  voltage = ( axis * vRange / 1024 ) - ( vRange / 2 );

  // 800mV sensitivity
  return voltage / sensitivity;
}

/**
 * Accelerometer
 * @constructor
 *
 * five.Accelerometer([ x, y[, z] ]);
 *
 * five.Accelerometer({
 *   pins: [ x, y[, z] ]
 *   freq: ms
 *  });
 *
 *
 * @param {Object} opts [description]
 *
 */
function Accelerometer( opts ) {

  if ( !(this instanceof Accelerometer) ) {
    return new Accelerometer( opts );
  }

  var pinAxis, initial, iranges, last, err;

  initial = {};
  iranges = {};
  last = {
    x: 0,
    y: 0,
    z: 0
  };
  err = null;

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.options( opts )
  );

  this.mode = this.firmata.MODES.ANALOG;
  this.pins = opts.pins;

  // Accelerometer instance properties
  this.voltage = opts.voltage || 3.3;

  this.sensitivity = opts.sensitivity || 0.8;

  this.freq = opts.freq || 500;

  this.raw = {
    x: null,
    y: null,
    z: null
  };

  this.axis = {
    x: null,
    y: null,
    z: null
  };

  // Pin to Axis mapping
  pinAxis = {};

  // Setup read listeners for each pin, update instance
  // properties as they are received. Special values are
  // calculated during the throttled event emit phase
  this.pins.forEach(function( pin, index ) {

    pinAxis[ pin ] = Object.keys( this.axis ).slice( index, index + 1 )[0];

    // Set the pin to input mode to ANALOG
    this.firmata.pinMode( pin, this.mode );

    this.firmata.analogRead( pin, function( data ) {
      var paxis = pinAxis[ pin ];

      if ( !initial[ paxis ] ) {
        initial[ paxis ] = data;

        // Define a reasonable noise range
        iranges[ paxis ] = Board.range( data - 5, data + 5 );
      }

      this.raw[ paxis ] = data;

      this.axis[ paxis ] = acceleration( data, this.voltage, this.sensitivity );
    }.bind(this));

  }, this );

  // Throttle event emitter
  setInterval(function() {
    var changed;

    if ( last.x !== this.raw.x ||
          last.y !== this.raw.y ||
            last.z !== this.raw.z ) {

      // TODO: Improve _NOISE_ filtering
      if ( iranges.x.indexOf(this.raw.x) === -1 &&
            iranges.y.indexOf(this.raw.y) === -1 &&
              (iranges.z && iranges.z.indexOf(this.raw.z) === -1) ) {

        // TODO: this is sloppy, needs to be cleaned up and
        // and refactored for API consistency
        this.emit( "axischange", err, {
          now: this.raw,
          previous: last
        });
      }

      last.x = this.raw.x;
      last.y = this.raw.y;
      last.z = this.raw.z;
    }

    this.emit( "acceleration", err, new Date() );

  }.bind(this), this.freq );

  /**
   * raw x, y, z data
   * @property raw
   * @type Object
   */

   /**
    * acceleration calculated x, y, z data
    * @property axis
    * @type Object
    */


  Object.defineProperties( this, {
    /**
     * [read-only] Calculated pitch value
     * @property pitch
     * @type Number
     */
    pitch: {
      get: function() {
        return Math.abs( Math.atan2( this.axis.x, Math.sqrt( Math.pow(this.axis.y, 2) + Math.pow(this.axis.z, 2) ) ) );
      }
    },
    /**
     * [read-only] Calculated roll value
     * @property roll
     * @type Number
     */
    roll: {
      get: function() {
        return Math.abs( Math.atan2( this.axis.y, Math.sqrt( Math.pow(this.axis.x, 2) + Math.pow(this.axis.z, 2) ) ) );
      }
    }
  });
}

util.inherits( Accelerometer, events.EventEmitter );

Object.defineProperty( Accelerometer, "G", {
  /**
   * [read-only] One g is the acceleration due to gravity at the Earth's surface and is the standard gravity (symbol: gn), defined as 9.80665 metres per second squared, or equivalently 9.80665 newtons of force per kilogram of mass.
   *
   * meters/s ^ 2
   *
   * @property G
   * @type Number
   */
  value: 9.81
});

/**
 * Fires once every N ms, equal to value of `freq`. Defaults to 500ms
 *
 * @event
 * @name acceleration
 * @memberOf Accelerometer
 */

/**
 * Fires only when X, Y or Z has changed
 *
 * @event
 * @name axischange
 * @memberOf Accelerometer
 */


module.exports = Accelerometer;


// References
//
// http://www.instructables.com/id/Accelerometer-Gyro-Tutorial/
//
// Images
//
// http://www.robotshop.com/gorobotics/wp-content/uploads/2012/05/euler-angles1.jpg
// http://www.instructables.com/image/F7NMMPEG4PBOJPY/The-Accelerometer.jpg
