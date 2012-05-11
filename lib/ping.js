// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/ping.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function Ping( opts ) {

  if ( !(this instanceof Ping) ) {
    return new Ping( opts );
  }

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;
  this.pin = opts && opts.pin || 7;

  // interval for polling pulse duration
  setInterval(function(){
    this.firmata.pulseIn( {pin: this.pin, value: this.firmata.HIGH, pulseOut: 5}, function(duration){
      this.emit("read",{
        inches : duration / 74 / 2,
        cm : duration / 29 /2
      });
    }.bind(this));
    
  }.bind(this), opts.pingInterval);
}

util.inherits( Ping, events.EventEmitter );


module.exports = Ping;


//http://itp.nyu.edu/physcomp/Labs/Servo
//http://arduinobasics.blogspot.com/2011/05/arduino-uno-flex-sensor-and-leds.html
//http://protolab.pbworks.com/w/page/19403657/TutorialPings
