// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/led.js
var events = require("events"),
    util = require("util");

function Led( opts ) {

  this.board = opts.board.board;
  this.mode = this.board.MODES.OUTPUT;
  this.pin = opts.pin || 9; // Use a PWM pin
  this.level = 0;

  // Set the output mode
  this.board.pinMode( this.pin, this.mode );
};

Led.prototype.on = function() {
  this.board.digitalWrite( this.pin, this.board.HIGH );
  this.level = 255;
  return this;
};

Led.prototype.off = function() {
  this.board.digitalWrite( this.pin, this.board.LOW );
  this.level = 0;
  return this;
};

Led.prototype.brightness = function( val ) {
  this.board.analogWrite( this.pin, this.level = val );
  return this;
};

Led.prototype.fade = function( rate ) {
  // Reset pinMode for PWM writes
  if ( this.mode !== this.board.MODES.PWM ) {
    this.mode = this.board.MODES.PWM;
    this.board.pinMode( this.pin, this.mode );
  }

  var to = ( rate || 5000 ) / ( 255 * 2 ),
      direction;

  setInterval(function() {
    if ( +this.level === 0 ) {
      direction = 1;
    }
    if ( +this.level === 255 ) {
      direction = -1;
    }

    this.brightness( this.level + direction );
  }.bind(this), to);
};

Led.prototype.strobe = function( rate ) {
  // Reset pinMode to OUTPUT
  if ( this.mode !== this.board.MODES.OUTPUT ) {
    this.mode = this.board.MODES.OUTPUT;
    this.board.pinMode( this.pin, this.mode );
  }

  setInterval(function() {
    if ( this.level ) {
      this.off();
    } else {
      this.on();
    }
  }.bind(this), rate || 1000);

  return this;
};

module.exports = Led;
