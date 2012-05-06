var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap;

// Motor Constructor specific arrays
var motors = new WeakMap();

function Motor( opts ) {

  if ( !(this instanceof Motor) ) {
    return new Motor( opts );
  }

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;
  this.mode = this.firmata.MODES.OUTPUT;
  this.pin = opts && opts.pin;

  // Set the pin to OUTPUT mode
  this.firmata.pinMode( this.pin, this.mode );

  // Create a "state" entry for privately
  // storing the state of the motor
  motors.set( this, { isOn: false });


  Object.defineProperty( this, "isOn", {
    get: function() {
      return motors.get( this ).isOn;
    }
  });
}

util.inherits( Motor, events.EventEmitter );

// Move the servo horn N degrees
Motor.prototype.start = function( speed ) {
  // Send a HIGH signal to turn on the motor
  this.firmata.digitalWrite( this.pin, this.firmata.HIGH );

  // Update the stored instance state
  motors.set( this, { isOn: true });

  // "start" event is fired when the motor is started
  this.emit( "start", null, new Date() );

  return this;
};

Motor.prototype.stop = function() {
  // Send a LOW signal to shut off the motor
  this.firmata.digitalWrite( this.pin, this.firmata.LOW );

  // Update the stored instance state
  motors.set( this, { isOn: false });

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
