var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function Piezo( opts ) {

  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  this.pin = this.pin || 3;
  this.mode = this.firmata.MODES.PWM;

  if ( !this.board.pins.isPwm(this.pin) ) {
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

/**
 * Alternate between high/low pulses count number of times,
 * changing every duration ms.
 *
 * This simulates different tone.
 *
 * From https://www.sparkfun.com/products/7950#comment-4eaad84d757b7fd351006efb
 */
function pulse( piezo, count, duration ) {

  if ( count > 0 ) {

    piezo.firmata.analogWrite( piezo.pin, 255 );
    setTimeout(function() {
      piezo.firmata.analogWrite( piezo.pin, 0 );
      setTimeout(function() {
        pulse( piezo, --count, duration );
      }, duration);
    }, duration);

  }

}

Piezo.prototype.tone = function( tone, duration ) {

  var us = 500000 / tone - 11,
      rep = (duration * 500) / (us + 11),
      firmata = this.firmata,
      pin = this.pin;

  pulse( this, rep, us / 1000 );

  return this;
};

Piezo.prototype.fade = function( fromVol, toVol ) {
  // TODO: Add speed control
  toVol = toVol === 0 ? -1 : toVol;

  var now = fromVol,
      step = toVol < fromVol ? -1 : 1;

  this.interval = setInterval(function() {

    now = now + step;

    if ( now !== toVol ) {

      this.firmata.analogWrite( this.pin, now );
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
