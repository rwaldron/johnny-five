var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function Piezo( opts ) {

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;
  this.mode = this.firmata.MODES.PWM;
  this.pin = opts.pin || 3;

  if ( !Board.Pin.isPWM(this.pin) ) {
    this.emit( "error", this.pin + "is not a valid PWM pin" );
  }

  // Set the pin to INPUT mode
  this.firmata.pinMode( this.pin, this.mode );

  // Piezo instance properties
  this.interval = null;

  this.playing = false;

  this.queue = [];

  // TODO: Implement a playback stack
}

util.inherits( Piezo, events.EventEmitter );

Piezo.prototype.tone = function( tone, duration ) {

  this.firmata.analogWrite( this.pin, tone );

  setTimeout(function() {
    this.firmata.analogWrite( this.pin, 0 );
  }.bind(this), duration );

  return this;
};

Piezo.prototype.fade = function( fromVol, toVol ) {
  // TODO: Add speed control
  toVol = toVol === 0 ? -1 : toVol;

  var current = fromVol,
      step = toVol < fromVol ? -1 : 1;

  this.interval = setInterval(function() {

    current = current + step;

    if ( current !== toVol ) {

      this.firmata.analogWrite( this.pin, current );
    } else {
      // this.firmata.analogWrite( this.pin, 0 );
      clearInterval( this.interval );
    }

  }.bind(this), 50 );

  return this;
};



// Piezo.prototype.alarm = function( pattern ) {

// };

// Piezo.prototype.note = function( note, duration ) {

//   var notes = {
//     "c": 1915,
//     "d": 1700,
//     "e": 1519,
//     "f": 1432,
//     "g": 1275,
//     "a": 1136,
//     "b": 1014,
//     "C": 956
//   };

//   return this;
// };

module.exports = Piezo;
