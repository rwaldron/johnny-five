// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/sensor.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function Sensor( opts ) {
  var currentValue,
      min = 1023,
      max = 0;

  opts = Board.options( opts );

  // Hardware instance properties
  this.firmata = Board.mount( opts ).firmata;
  this.mode = this.firmata.MODES.ANALOG;
  this.pin = opts.pin || 0;

  // Set the pin to INPUT mode
  this.firmata.pinMode( this.pin, this.mode );

  this.freq = opts.freq || 25;
  this.range = opts.range || [ 0, 1023 ];

  this.normalized = null;
  this.constrained = null;

  // Analog Read event loop
  this.firmata.analogRead( this.pin, function( data ) {
    currentValue = data;

    // In the first 5 seconds, we will receive min/max
    // calibration values which will be used to
    // map and scale all sensor readings from this pin
    if ( data > max ) {
      this.range[ 1 ] = max = data;
    }

    if ( data < min ) {
      this.range[ 0 ] = min = data;
    }
  }.bind(this));

  // Throttle
  setInterval(function() {
    var err = null;

    this.normalized = Board.map( currentValue, this.range[0], this.range[1], 0, 255 ),
    this.constrained = Board.constrain( this.normalized, 0, 255 );

    this.emit( "read", err, currentValue );

  }.bind(this), this.freq );
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
