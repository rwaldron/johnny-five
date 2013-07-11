var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

// Directional Motor Constructor specific arrays
var priv = new WeakMap();

function DirectionalMotor( opts ) {

  if ( !(this instanceof DirectionalMotor) ) {
    return new DirectionalMotor( opts );
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  this.motorPin = opts && opts.motorPin;
  this.dirPin = opts && opts.dirPin

  this.speedThreshold = 30; // set to disengage the motor if less

  // Set the motor pin to PWM mode
  this.firmata.pinMode( this.motorPin, this.firmata.MODES.PWM);
  // set the direction pin to OUTPUT MODE
  this.firmata.pinMode(this.dirPin, this.firmata.MODES.OUTPUT);

  // Create a "state" entry for privately
  // storing the state of the motor
  priv.set( this, { isOn: false });

  Object.defineProperties( this, {
    // Calculated, read-only motor on/off state
    // true|false
    isOn: {
      get: function() {
        return priv.get( this ).isOn;
      }
    }
  });
}

util.inherits( DirectionalMotor, events.EventEmitter );

// start a motor - essetially just switch it on like a normal motor
DirectionalMotor.prototype.start = function( speed ) {
  // Send a signal to turn on the motor and run at given speed in whatever
  // direction is currently set.

  speed = speed || 128; // set half speed if nothing provided.
  this.firmata.analogWrite( this.motorPin, speed );

  // Update the stored instance state
  priv.get( this ).isOn = true;

  // "start" event is fired when the motor is started
  this.emit( "start", null, new Date() );

  return this;
};

DirectionalMotor.prototype.stop = function() {
  // Send a LOW signal to shut off the motor
  this.firmata.analogWrite( this.motorPin, this.firmata.LOW );

  // Update the stored instance state
  priv.get( this ).isOn = false;

  // "stop" event is fired when the motor is stopped
  this.emit( "stop", null, new Date() );

  return this;
};

DirectionalMotor.prototype.forward = function( speed ) {
  // Send a PWM signal to the motor and set going forward

  "use strict"
  if (speed > 255) speed = 255;
  if (speed < 0) speed = 0;

  if (speed > this.speedThreshold) {
    this.firmata.digitalWrite( this.dirPin, this.firmata.HIGH );
    this.start( speed );

    // Update the stored instance state
    priv.get( this ).isOn = true;

    // "forward" event is fired when the motor is going forward
    this.emit( "forward", null, new Date() );
  } else {
    this.stop();
  }

  return this;
};

DirectionalMotor.prototype.reverse = function( speed ) {
  // send a PWM signal to the motor and set going backwards

  if (speed > 255) speed = 255;
  if (speed < 0) speed = 0;

  if (speed > this.speedThreshold) {
    this.firmata.digitalWrite( this.dirPin, this.firmata.LOW );
    this.start( speed );

    // Update the stored instance state
    priv.get( this ).isOn = true;

    // "forward" event is fired when the motor is going forward
    this.emit( "reverse", null, new Date() );
  } else {
    this.stop();
  }

  return this;
};

module.exports = DirectionalMotor;



// References
// http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM

// Further API info:
