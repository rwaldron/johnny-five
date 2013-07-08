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

// Filter for change events
// Pass in data by type
// e.g. accel.get("smooth")
function axisChange( data, threshold ) {
  var changed, axes;
  axes = Object.keys(data);
  changed = axes.map(function( axis ) {
    var extent = data[ axis ].length - 1;
    return data[ axis ][ extent ] - data[ axis ][ extent - 1 ];
  });
  return changed.some(function( element ) {
    return Math.abs( element ) > threshold;
  });
}

// relatively terse updating function
// vs. this.data.thing.axis.whatever = value
// queue is the array on whatever object we want to update
function update( queue, value, extent ) {
  queue.push( value );
  if (queue.length > extent) {
    queue.shift();
  }
  return queue;
}

// build data based on types and axes passed in
// initialize at zero
function dataStr( types, axes ){
  var container = {};
  types.forEach(function( type ){
    container[ type ] = {};
    axes.forEach(function( axis ) {
      container[ type ][ axis ] = [ 0 ];
    });
  });
  return container;
}


/* Expects an options argument e.g.
{
  accel: this.data.accel,
  smooth: this.data.smooth,
  alpha: this.alpha,
  extent: this.extent
}
*/

function exponential( smopts ) {
  var smooth, accel;
  smooth = smopts.smooth;
  accel = smopts.accel;

  this.axes.forEach(function( axis ) {
    var acper, smper, currsm;
    // Exponential smoothing
    // see http://people.duke.edu/~rnau/411avg.htm
    acper = accel[ axis ];
    smper = smooth[ axis ];
    // bootstrap for initial state
    if ( smper.length < smopts.extent ) {
      smooth[ axis ] = update( smper, acper[ 0 ], smopts.extent );
    } else {
      // convolves past smoothed/nonsmooth readings
      currsm = smper[ 0 ] + smopts.alpha * ( acper[ 0 ] - smper[ 0 ] );
      // update current smoothed values 
      smooth[ axis ] = update( smper , currsm, smopts.extent );
    }
  });
  return smooth;
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

  var err = null;

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  this.mode = this.firmata.MODES.ANALOG;

  // Accelerometer instance properties
  this.voltage = opts.voltage || 3.3;
  this.sensitivity = opts.sensitivity || 0.8;
  this.freq = opts.freq || 50;
  // Threshold needs to be tested
  this.threshold = opts.threshold || 0.5;

  // axis keys
  this.axes = opts.axes || [ "x", "y", "z" ];
  // types (not really important unless you need them)
  this.types = opts.types || [ "smooth", "accel", "trend" ];
  // how many past values to store
  this.extent = opts.extent || 2;
  // some smoothing methods require bootstrapping
  this.initial = opts.initial || true;

  // build data based on types and axes passed in
  // initialize at zero
  this.data = dataStr( this.types, this.axes );

  // Blending property for the smoother.
  // Smaller is less filtering
  this.alpha = opts.alpha || 0.2;

  // default smoother is an exponential smoother
  this.smoother = opts.smoother || exponential;


  // Setup read listeners for each pin, update instance
  // properties as they are received. Special values are
  // calculated during the throttled event emit phase
  this.pins.forEach(function( pin, index ) {

    // Set the pin to input mode to ANALOG
    this.firmata.pinMode( pin, this.mode );

    this.firmata.analogRead( pin, function( data ) {
      var paxis, accel, sink;
      paxis = this.axes[ index ];
      accel = acceleration( data, this.voltage, this.sensitivity );
      sink = this.data.accel[ paxis ];
      // The output we're interested in most of the time
      this.data.accel[ paxis ] = update( sink , accel, this.extent );

    }.bind( this ));

  }, this );



  // Throttle event emitter
  setInterval(function() {
    this.data.smooth = this.smoother({
      accel: this.data.accel,
      smooth: this.data.smooth,
      alpha: this.alpha,
      extent: this.extent
    });
    var data = {
      smooth: this.data.smooth,
      rough: this.data.accel
    };

    // Check each axis for change above some threshold
    if ( axisChange( this.data.accel, this.threshold ) ) {
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
        var x, y, z, accel;
        accel = this.data.accel;
        x = accel.x[ 1 ];
        y = accel.y[ 1 ];
        z = this.axes.indexOf( "z" ) > -1 ? accel.z[ 1 ]: 0;
        return Math.abs(
          Math.atan2(
            x,
            Math.sqrt( Math.pow( y, 2 ) + Math.pow( z, 2 ) )
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
        var x, y, z, accel;
        accel = this.data.accel;
        x = accel.x[ 1 ];
        y = accel.y[ 1 ];
        z = this.axes.indexOf( "z" ) > -1 ? accel.z[ 1 ]: 0;
        return Math.abs(
          Math.atan2(
            y,
            Math.sqrt( Math.pow( x, 2 ) + Math.pow( z, 2 ) )
          )
        );
      }
    }
  });
}

util.inherits( Accelerometer, events.EventEmitter );

Object.defineProperty( Accelerometer, "G", {
  /**
   * [read-only] One g is the acceleration due to gravity at the Earth's surface
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
// http://www.instructables.com/image/F7NMMPEG4PBOJPY/The-Accelerometer.jpg
