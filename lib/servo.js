// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/servo.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap;

// Sensor instance private data
var servos = [],
    states = [],
    servo = new WeakMap();

function Servo( opts ) {

  if ( !(this instanceof Servo) ) {
    return new Servo( opts );
  }

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;
  this.mode = this.firmata.MODES.SERVO;
  this.pin = opts.pin;

  // If pin is not a PWM pin, emit an error
  if ( !Board.Pin.isPWM(this.pin) ) {
    this.emit( "error", this.pin + "is not a valid PWM pin" );
  }

  // Servo instance properties
  this.range = opts.range || [ 0, 180 ];

  // Allow user defined ids, defaults to system ID
  this.id = opts.id || Board.uid();

  // The type of servo determines certain alternate
  // behaviours in the API
  this.type = opts.type || "standard";

  // Collect all movement history for this servo
  this.history = [/*
    {
      timestamp: Date.now(),
      degrees: degrees
    }
  */];

  // Interval/Sweep pointer
  this.interval = null;

  this.moving = false;

  // Set the pin to INPUT mode
  this.firmata.pinMode( this.pin, this.mode );

  // Create a non-writable "last" property
  // shortcut to access the last servo movement
  Object.defineProperty( this, "last", {
    get: function() {
      return this.history[ this.history.length - 1 ];
    }
  });

  // Allow "setup"instructions to come from
  // constructor options properties

  // If "start" true set servo to min or max degrees
  if ( opts.startAt && !opts.center  ) {
    this[ opts.startAt ]();
  }

  // If "min" true set servo to 90deg
  if ( opts.center ) {
   this.center();
  }

  // Create a "state" entry for privately
  // storing the state of the servos
  servos.push( this );
  states.push( {} );
}

util.inherits( Servo, events.EventEmitter );

// move( degrees [, fireEvent ] )
//
// Move the servo horn N degrees
// Optionally fire a move event
//
Servo.prototype.move = function( degrees, fireEvent ) {

  // Enforce limited range of motion
  degrees = Board.constrain( degrees, this.range[0], this.range[1] );

  // If same degrees, do nothing
  if ( this.last && this.last.degrees === degrees ) {
    return this;
  }

  // Useful Standard positions in degrees:
  // 0, 45, 90, 135, 180

  // Useful Continuous speeds
  // Clockwise: 85-95,
  // Counter-Clockwise: 95-110
  this.firmata.servoWrite( this.pin, degrees );

  this.moving = true;

  this.history.push({
    timestamp: Date.now(),
    degrees: degrees
  });

  // Wait until the stack winds down and
  // fire a move event
  if ( fireEvent ) {
    setTimeout(function() {
      this.emit( "move", null, degrees );
    }.bind(this), 1000);
  }

  // return this instance
  return this;
};

// min()
//
// Set Servo to minimum degrees, defaults to 0deg
//
Servo.prototype.min = function() {
  return this.move( this.range[0], true );
};

// max()
//
// Set Servo to maximum degrees, defaults to 180deg
//
Servo.prototype.max = function() {
  return this.move( this.range[1], true );
};

// center()
//
// Set Servo to centerpoint, defaults to 90deg
//
Servo.prototype.center = function() {
  return this.move( (this.range[0] + this.range[1] / 2) );
};

// sweep( [range] )
//
// Sweep the servo between min and max or provided range
//
Servo.prototype.sweep = function( range ) {
  // Support custom `range`
  range = range || this.range;

  // If the last recorded movement was not to 0deg
  // move the servo to 0deg
  if ( this.last && this.last.degrees !== 0 ) {
    this.move(0);
  }

  this.moving = true;

  this.interval = setInterval(function() {
    var moveTo = range[0];

    if ( this.last && this.last.degrees === range[0] ) {
      this.emit( "move", null, this.last.degrees );

      moveTo = range[1];
    }

    this.move( moveTo );
  }.bind(this), 1000 );

  return this;
};

// stop( [degrees] )
//
// Stop a moving servo
// Optionally stop a moving servo at specified degrees
//
Servo.prototype.stop = function() {
  if ( this.type === "continuous" ) {
    // TODO: this may differ with varying
    //       models - need to research
    this.move( 91 );
  } else {
    clearInterval( this.interval );
  }

  this.moving = false;

  return this;
};


// Static API

// Servo.Array()
// new Servo.Array()
//
// Return Array-like object instance of servos
//
Servo.Array = function() {
  if ( !(this instanceof Servo.Array) ) {
    return new Servo.Array();
  }

  this.length = 0;

  servos.forEach(function( servo, index ) {
    this[ index ] = servo;

    this.length++;
  }, this );
};



// Servo.Array, each( callbackFn )
//
// Execute callbackFn for each active servo instance
//
// eg.
// array.each(function( servo, index ) {
//
//  `this` refers to the current servo instance
//
// });

Servo.Array.prototype.each = function( callbackFn ) {
  var servo, i, length;

  i = 0;
  length = this.length;

  for ( ; i < length; i++ ) {
    servo = this[i];
    callbackFn.call( servo, servo, i );
  }
};

// Servo.Array, center()
//
// centers all servos to 90deg
//
// eg. array.center();

// Servo.Array, min()
//
// set all servos to the minimum degrees
// defaults to 0
//
// eg. array.min();

// Servo.Array, max()
//
// set all servos to the maximum degrees
// defaults to 180
//
// eg. array.max();

// Servo.Array, stop()
//
// stop all servos
//
// eg. array.stop();


[ "center", "min", "max", "move", "stop" ].forEach(function( method ) {
  // Create Servo.Array wrappers for each method listed.
  // This will allow us control over all Servo instances
  // simultaneously.
  Servo.Array.prototype[ method ] = function() {
    this.each(function( servo ) {
      Servo.prototype[ method ].apply( servo, arguments );
    });
  };
});


/** Speeds for continuous rotation
 *
 * Mock directions: A, B
 *
 * 0 Full speed A
 * 89 Slowest speed A
 * 90 Stopped
 * 91 Slowest speed B
 * 180 Fastest speed B
 *
 *
**/

/**
 * Degrees to Pulse lengths in ms
 * Servo.pulse = {
 *   lengths: {
 *     0: 1,
 *     90: 1.5,
 *     180: 2
 *   },
 *   width: 2 / 180
 * };
 *
**/


// Alias
Servo.prototype.write = Servo.prototype.move;





module.exports = Servo;



// References
//
// http://www.societyofrobots.com/actuators_servos.shtml
// http://www.parallax.com/Portals/0/Downloads/docs/prod/motors/900-00008-CRServo-v2.2.pdf
// http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM
// http://servocity.com/html/hs-7980th_servo.html
// http://mbed.org/cookbook/Servo

// Further API info:
// http://www.tinkerforge.com/doc/Software/Bricks/Servo_Brick_Python.html#servo-brick-python-api
// http://www.tinkerforge.com/doc/Software/Bricks/Servo_Brick_Java.html#servo-brick-java-api
