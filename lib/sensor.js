// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/sensor.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function Sensor( opts ) {

  opts = Board.options( opts );

  // Hardware instance properties
  this.firmata = Board.mount( opts ).firmata;
  this.mode = this.firmata.MODES.ANALOG;
  this.pin = opts && Board.Pins.analog[ opts.pin ] || 0;

  // Set the pin to INPUT mode
  this.firmata.pinMode( this.pin, this.firmata.MODES.ANALOG );

  // Analog Read event loop
  // TODO: make this "throttle-able"
  this.firmata.analogRead( this.pin, function( data ) {
    var err = null;

    this.emit( "read", err, data );
  }.bind(this));
}

util.inherits( Sensor, events.EventEmitter );

Sensor.prototype.pinMode = function( mode ) {
  this.mode = mode;
  this.firmata.pinMode( this.pin, mode );
  return this;
};

module.exports = Sensor;


//http://itp.nyu.edu/physcomp/Labs/Servo
//http://arduinobasics.blogspot.com/2011/05/arduino-uno-flex-sensor-and-leds.html
//http://protolab.pbworks.com/w/page/19403657/TutorialSensors
