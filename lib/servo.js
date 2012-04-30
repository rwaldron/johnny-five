// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/servo.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function Servo( opts ) {

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
}

util.inherits( Servo, events.EventEmitter );

// Move the servo horn N degrees
Servo.prototype.move = function( degrees ) {

  // Enforce limited range of motion
  degrees = Board.constrain(
              Board.map( degrees, 0, 180, this.range[0], this.range[1] ),
              this.range[0], this.range[1]
            );

  console.log( degrees );

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

  this.history.push({
    timestamp: Date.now(),
    degrees: degrees
  });

  // Wait until the stack winds down and
  // fire a move event
  setTimeout(function() {
    this.emit( "move", null, degrees );
  }.bind(this), 1000);

  // return this instance
  return this;
};

// Set Servo to minimum degrees, defaults to 0deg
Servo.prototype.min = function() {
  return this.move( this.range[0] );
};

// Set Servo to maximum degrees, defaults to 180deg
Servo.prototype.max = function() {
  return this.move( this.range[1] );
};

// Ser Servo to centerpoint, defaults to 90deg
Servo.prototype.center = function() {
  return this.move( (this.range[0] + this.range[1] / 2) );
};

Servo.prototype.sweep = function( options ) {
  // If the last recorded movement was not to "minimum"
  // move the servo to "minimum"
  if ( this.last.degrees !== this.range[0] ) {
    this.move( this.range[0] );
  }

  options = options || {};

  // TODO: allow for calculated stepping based
  //       on a total sweep time
  var lapse = options.lapse || 500,
      degrees = options.degrees || 10,
      step = degrees;

  this.interval = setInterval(function() {
    if ( degrees >= this.range[1] || degrees === this.range[0] ) {
      step *= -1;
    }

    degrees += step;
    this.move( degrees );

  }.bind(this), lapse );

  return this;
};

Servo.prototype.stop = function() {
  if ( this.type === "continuous" ) {
    // TODO: this may differ with varying
    //       models - need to research
    this.move( 91 );
  } else {
    clearInterval( this.interval );
  }
  return this;
};


// Degrees to Pulse lengths in ms
Servo.pulse = {
  lengths: {
    0: 1,
    90: 1.5,
    180: 2
  },
  width: 2 / 180
};


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


// Alias
Servo.prototype.write = Servo.prototype.move;





module.exports = Servo;



// References
// http://www.societyofrobots.com/actuators_servos.shtml
// http://www.parallax.com/Portals/0/Downloads/docs/prod/motors/900-00008-CRServo-v2.2.pdf
// http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM

// Further API info:
// http://www.tinkerforge.com/doc/Software/Bricks/Servo_Brick_Python.html#servo-brick-python-api
// http://www.tinkerforge.com/doc/Software/Bricks/Servo_Brick_Java.html#servo-brick-java-api
