var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

// Motor Constructor specific arrays
var priv = new WeakMap();

function Motor( opts ) {

  if ( !(this instanceof Motor) ) {
    return new Motor( opts );
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  this.pin = opts && opts.pin;

  // Set the pin to OUTPUT mode
  this.mode = this.firmata.MODES.OUTPUT;
  this.firmata.pinMode( this.pin, this.mode );

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

util.inherits( Motor, events.EventEmitter );

// Move the servo horn N degrees
Motor.prototype.start = function( speed ) {
  // Send a HIGH signal to turn on the motor
  this.firmata.digitalWrite( this.pin, this.firmata.HIGH );

  // Update the stored instance state
  priv.get( this ).isOn = true;

  // "start" event is fired when the motor is started
  this.emit( "start", null, new Date() );

  return this;
};

Motor.prototype.stop = function() {
  // Send a LOW signal to shut off the motor
  this.firmata.digitalWrite( this.pin, this.firmata.LOW );

  // Update the stored instance state
  priv.get( this ).isOn = false;

  // "stop" event is fired when the motor is stopped
  this.emit( "stop", null, new Date() );

  return this;
};

// Motor.prototype.forward = function( speed ) {

// };

// Motor.prototype.reverse = function( speed ) {

// };

module.exports = Motor;



// References
// http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM

// Further API info:
