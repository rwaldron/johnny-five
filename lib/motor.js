var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

// Motor Constructor specific arrays
var motors = [],
    states = [];

function updateState( motor, state ) {
  states[ motors.indexOf( motor ) ] = state;
}

function Motor( opts ) {
  var pin;

  if ( typeof opts === "number" ) {
    pin = opts;

    opts = {
      pin: pin
    };
  }

  this.firmata = Board.mount( opts ).firmata;
  this.mode = this.firmata.MODES.OUTPUT;
  this.pin = opts && opts.pin;

  // Set the pin to input mode
  this.firmata.pinMode( this.pin, this.mode );

  // Create a "state" entry for privately
  // storing the state of the motor
  motors.push( this );
  states.push( false );

  Object.defineProperty( this, "isOn", {
    get: function() {
      return states[ motors.indexOf(this) ];
    }
  });
}

util.inherits( Motor, events.EventEmitter );

// Move the servo horn N degrees
Motor.prototype.start = function( speed ) {
  // Send a HIGH signal to turn on the motor
  this.firmata.digitalWrite( this.pin, this.firmata.HIGH );

  // Update the stored instance state
  updateState( this, true );

  // "start" event is fired when the motor is started
  this.emit( "start", null, new Date() );

  return this;
};

Motor.prototype.stop = function() {
  // Send a LOW signal to shut off the motor
  this.firmata.digitalWrite( this.pin, this.firmata.LOW );

  // Update the stored instance state
  updateState( this, false );

  // "stop" event is fired when the motor is stopped
  this.emit( "stop", null, new Date() );

  return this;
};

module.exports = Motor;



// References
// http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM

// Further API info:
