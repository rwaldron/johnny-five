var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    __ = require("../lib/fn.js");

/**
 * Joystick
 * @constructor
 *
 * five.Joystick([ x, y[, z] ]);
 *
 * five.Joystick({
 *   pins: [ x, y[, z] ]
 *   freq: ms
 *  });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Joystick( opts ) {

  if ( !(this instanceof Joystick) ) {
    return new Joystick( opts );
  }

  var err = null;

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  this.mode = this.firmata.MODES.ANALOG;

  // Joystick instance properties
  this.freq = opts.freq || 500;

  this.magnitude = 0;

  this.axis = {
    x: 0,
    y: 0
  };

  this.fixed = {
    x: 0,
    y: 0
  };

  this.normalized = {
    x: 0,
    y: 0
  };

  this.raw = {
    x: 0,
    y: 0
  };


  // TODO: calculate joystick direction based on X/Y values
  this.direction = "";

  this.pins.forEach(function( pin ) {
    // Set the pin to input mode
    this.firmata.pinMode( pin, this.mode );

    // Arduino 0-1023  512
    this.firmata.analogRead( pin, function( data ) {

      var val = data / 1023;

      // register X axis, L/R (A0)
      if ( pin === 1 ) {
        this.axis.x = val;
        this.raw.x = data;
      // register Y axis, U/D (A1)
      } else {
        this.axis.y = val;
        this.raw.y = data;
      }
    }.bind(this));
  }.bind(this));


  // Throttle event emitter
  setInterval(function() {

    this.emit( "axismove", err, new Date() );

  }.bind(this), this.freq );

  Object.defineProperties( this, {
    /**
     * [read-only] Calculated magnitude value
     * @name magnitude
     * @property
     * @type Number
     */
    magnitude: {
      get: function() {
        return Math.sqrt( __.square(this.axis.x) + __.square(this.axis.y) );
      }
    },
    /**
     * [read-only] Calculated normalized x, y
     * @name magnitude
     * @property
     * @type Object
     */
    normalized: {
      get: function() {
        return {
          x: this.axis.x / this.magnitude,
          y: this.axis.y / this.magnitude
        };
      }
    },
    /**
     * [read-only] Calculated fixed x, y
     * @name magnitude
     * @property
     * @type Object
     */
    fixed: {
      get: function() {
        return {
          x: this.axis.x.toFixed(2),
          y: this.axis.y.toFixed(2)
        };
      }
    }
  });
}

util.inherits( Joystick, events.EventEmitter );

/**
 * Fires when either x, y axis moves
 *
 * @event
 * @name axismove
 * @memberOf Accelerometer
 */

module.exports = Joystick;

// References
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-2-AxisJoystick-v1.2.pdf
// https://sites.google.com/site/parallaxinretailstores/home/2-axis-joystick
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-Axis%20JoyStick_B%20Schematic.pdf

// http://www.built-to-spec.com/blog/2009/09/10/using-a-pc-joystick-with-the-arduino/
// http://msdn.microsoft.com/en-us/library/windows/desktop/ee417001(v=vs.85).aspx
// http://retroblast.arcadecontrols.com/reviews/Ultimarc_Ultrastick_0925006-02.html

// 2-axis-joystick
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-2-AxisJoystick-v1.2.pdf
// http://myweb.wit.edu/johnsont/Classes/462/Arduino%20Tutorials.pdf
