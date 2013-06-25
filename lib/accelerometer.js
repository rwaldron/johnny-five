var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    __ = require("../lib/fn.js");

function calculate( method, y, x ) {
  return Math[ method ]( y, x ) * 180 / Math.PI;
}

// Filter for change events
function axisChange( change, threshold ) {
  // TODO set actual threshold
  return change.some(function( element ) {
    return Math.abs( element ) > threshold;
  });
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

  var err, changed;

  err = null;

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  this.mode = this.firmata.MODES.ANALOG;

  // axis keys
  this.axes = opts.axes || [ "x", "y", "z" ];
  // types (not really important unless you need them)
  this.types = opts.types || [ "smooth", "accel", "trend" ];
  // how many past values to store
  this.extent = opts.extent || 2;

  // build data based on types and axes passed in
  // initialize at zero
  this.data = (function(types, axes){
    var container = {};

    types.forEach(function(type){
      container[ type ] = {};
      axes.forEach(function(axis) {
        container[ type ][ axis ] = [ 0 ];
      });
    });
    return container;
  }(this.types, this.axes));

  // relatively terse updating function
  // vs. this.data.thing.axis.whatever = value
  this.update = function(type, axis, value, extent) {
    var arr;
    extent = extent || this.extent;
    arr = this.data[ type ][ axis ];
    arr.push( value );
    if (arr.length > extent) {
      arr.shift();
    }
    this.data[ type ][ axis ] = arr;
  };
  // simplifies getting values somewhat. Not sure if it is necessary
  this.get = function(type, axis, loc) {
    var arr = this.data[ type ];
    if ( axis ) {
      return typeof loc === "undefined" ? arr[ axis ] : arr[ axis ][ loc ];
    } else {
      return arr;
    }
  };

  // Accelerometer instance properties
  this.voltage = opts.voltage || 3.3;
  this.sensitivity = opts.sensitivity || 0.8;
  this.freq = opts.freq || 50;
  this.threshold = opts.threshold || 0.5;

  // Blending property for the smoother.
  // Smaller is less filtering
  this.alpha = opts.alpha || 0.2;

  // default smoother is a low pass filter
  this.smoother = (opts.smoother || function() {
    var alpha = this.alpha;

    this.axes.forEach(function( axis, index ) {
      var sm, last, curr;
      last = this.get("accel", axis, 0);
      curr = this.get("accel", axis, 1);
      // Simple blending with n - 1th result. last is initialized at 0 for
      // the very first run only.
      sm = ( last * alpha ) + ( 1 - alpha ) * curr;
      this.update("smooth", axis, sm);
    }, this);

    return this.get("smooth");
  }).bind(this);


  // Setup read listeners for each pin, update instance
  // properties as they are received. Special values are
  // calculated during the throttled event emit phase
  this.pins.forEach(function( pin, index ) {

    // Set the pin to input mode to ANALOG
    this.firmata.pinMode( pin, this.mode );

    this.firmata.analogRead( pin, function( data ) {
      var paxis  = this.axes[ index ];
      // The output we're interested in most of the time
      this.update("accel", paxis, acceleration(
        data, this.voltage, this.sensitivity
      ));

    }.bind(this));

  }, this );

  changed = [];

  this.axes.forEach(function(axis, index) {
    changed[ index ] = this.get("smooth", axis, 1) - this.get("smooth", axis, 0);
  }, this );

  // Throttle event emitter
  setInterval(function() {
    var data = {
      smooth: this.smoother(),
      rough: this.get("accel")
    };

    // Check each axis for change above some threshold
    if ( axisChange( changed , this.threshold ) ) {
      [ "axischange", "change" ].forEach(function( type ) {
        this.emit( type, err, data );
      }, this);
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
   * accel calculated x, y, z data
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
        return Math.abs(
          Math.atan2(
            this.accel.x,
            Math.sqrt( Math.pow(this.accel.y, 2) + Math.pow(this.accel.z || 0, 2) )
          )
        );
      }
    },
    /**
     * [read-only] Calculated roll value
     * @property roll
     * @type Number
     */
    roll: {
      get: function() {
        return Math.abs(
          Math.atan2(
            this.accel.y,
            Math.sqrt( Math.pow(this.accel.x, 2) + Math.pow(this.accel.z || 0, 2) )
          )
        );
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
