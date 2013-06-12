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

  var pinAxis, last, err, axes, changed, loPass;

  // axis keys
  axes = ["x", "y", "z"];
  // "last" values initialized as zeros for the smoother
  last = {
    x: 0,
    y: 0,
    z: 0
  };
  // Array of changed values 
  changed = [];
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
  
  // unconditioned response
  this.raw = {};
  
  // Objects for possible output

  // conditioned response, no smoother
  this.accel = {};
  // conditioned response, smoothed

  this.smooth = {};

  // smoother 

  // Blending property for the smoother. Smaller is less filtering

  this.alpha = opts.alpha || 0.2;

  // make an actual API sometime
  loPass = function() {
    var alpha = this.alpha;

    axes.forEach( function( axis, index ) {
      // Simple blending with n - 1th result. last is initialized at 0 for 
      // the very first run only.  
      this.smooth[axis] = (last[axis] * alpha) + (1 - alpha) * this.accel[axis];
      // update change for the axischange event
      changed[index] = last[axis] - this.smooth[axis];
      // might as well set the last value here
      last[axis] = this.smooth[axis];
    }, this);
    return this.smooth;
  }.bind(this);

  this.smoother = opts.smoother || loPass;

  // Pin to Axis mapping
  pinAxis = {};

  // Setup read listeners for each pin, update instance
  // properties as they are received. Special values are
  // calculated during the throttled event emit phase
  this.pins.forEach(function( pin, index ) {

    pinAxis[ pin ] = axes.slice( index, index + 1 )[0];

    // Set the pin to input mode to ANALOG
    this.firmata.pinMode( pin, this.mode );

    this.firmata.analogRead( pin, function( data ) {
      var paxis = pinAxis[ pin ];
      // unconditioned on voltage/sensitivity
      this.raw[ paxis ] = data;
      // the output we're interested in most of the time
      this.accel[ paxis ] = acceleration( data, this.voltage, this.sensitivity );
    }.bind(this));

  }, this );

  // Throttle event emitter
  setInterval(function() {
    var data = {
      smooth: this.smoother(),
      rough: this.accel
    };

    // Check each axis for change above some threshold
    // threshold is not set properly now
    if ( changed.some(function(element) {
          return Math.abs(element) > 5;
        }) ) {
      this.emit( "axischange", err, {
        now: this.smooth,
        previous: last
      });
    }

    this.emit( "acceleration", err, data );

  }.bind(this), this.freq );

  /**
   * raw x, y, z data
   * @property raw
   * @type Object
   */

  /**
   * smooth x, y, z data
   * @property smooth
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
        return Math.abs( Math.atan2( this.accel.x, Math.sqrt( Math.pow(this.accel.y, 2) + Math.pow(this.accel.z, 2) ) ) );
      }
    },
    /**
     * [read-only] Calculated roll value
     * @property roll
     * @type Number
     */
    roll: {
      get: function() {
        return Math.abs( Math.atan2( this.accel.y, Math.sqrt( Math.pow(this.accel.x, 2) + Math.pow(this.accel.z, 2) ) ) );
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
