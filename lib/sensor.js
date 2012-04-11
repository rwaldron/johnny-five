// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/sensor.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function Sensor( opts ) {
  var hardware = Board.mount( opts );

  this.firmata = hardware.firmata;
  this.pin = opts && Board.analog.pins[ opts.pin ] || 14;

  // Set the pin to input mode
  this.firmata.pinMode( this.pin, this.firmata.MODES.ANALOG );

  // Analog Read event loop
  // TODO: make this "throttle-able"
  console.log( this.pin );
  this.firmata.analogRead( this.pin, function( data ) {
    console.log( "message" );
    // this.emit( "read", data );
  }.bind(this));


  this.firmata.on( "analog-read", function( data ) {
    // console.log( data );
    // this.emit( "read", data );
  }.bind(this));

}

util.inherits( Sensor, events.EventEmitter );

module.exports = Sensor;


//http://itp.nyu.edu/physcomp/Labs/Servo
//http://arduinobasics.blogspot.com/2011/05/arduino-uno-flex-sensor-and-leds.html
//http://protolab.pbworks.com/w/page/19403657/TutorialSensors
