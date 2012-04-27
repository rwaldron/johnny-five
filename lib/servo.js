// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/servo.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function Servo( opts ) {
  var pin;

  if ( typeof opts === "number" ) {
    pin = opts;

    opts = {
      pin: pin
    };
  }

  this.firmata = Board.mount( opts ).firmata;
  this.mode = this.firmata.MODES.SERVO;
  this.pin = opts && opts.pin;

  if ( !Board.Pin.isPWM(this.pin) ) {
    this.emit( "error", this.pin + "is not a valid PWM pin" );
  }

  // Set the pin to input mode
  this.firmata.pinMode( this.pin, this.mode );

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

  // If "reset" true Set servo to 0deg
  if ( opts.reset ) {
    this.reset();
  }
}

util.inherits( Servo, events.EventEmitter );

// Move the servo horn N degrees
Servo.prototype.move = function( degrees ) {

  if ( this.last && this.last.degrees === degrees ) {
    return this;
  }
  // Useful Standard positions:
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
  }.bind(this), 500);

  // return this instance
  return this;
};

// Reset Servo to 0deg
Servo.prototype.reset = function() {
  return this.move(0);
};

Servo.prototype.sweep = function( options ) {
  // If the last recorded movement was not to 0deg
  // move the servo to 0deg
  if ( this.last.degrees !== 0 ) {
    this.move(0);
  }

  options = options || {};

  // TODO: allow for calculated stepping based
  //       on a total sweep time
  var lapse = options.lapse || 500,
      degrees = options.degrees || 10,
      step = degrees;

  this.interval = setInterval(function() {
    if ( degrees >= 180 || degrees === 0 ) {
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
    this.move( 94 );
  } else {
    clearInterval( this.interval );
  }
  return this;
};

// Create a computed "last" property to retrieve
// the last servo movement history object
Object.defineProperty( Servo.prototype, "last", {
  get: function() {
    return this.history[ this.history.length - 1 ];
  }
});


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
Servo.prototype.center = Servo.prototype.reset;




module.exports = Servo;



// References
// http://www.societyofrobots.com/actuators_servos.shtml
// http://www.parallax.com/Portals/0/Downloads/docs/prod/motors/900-00008-CRServo-v2.2.pdf
// http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM

// Further API info:
// http://www.tinkerforge.com/doc/Software/Bricks/Servo_Brick_Python.html#servo-brick-python-api
// http://www.tinkerforge.com/doc/Software/Bricks/Servo_Brick_Java.html#servo-brick-java-api
