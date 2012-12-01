var Board = require("../lib/board.js");

function ShiftRegister( opts ) {
  if ( !(this instanceof ShiftRegister) ) {
    return new ShiftRegister( opts );
  }

  opts = Board.options( opts );

  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;

  this.pins = {
    data: opts.pins.data,
    clock: opts.pins.clock,
    latch: opts.pins.latch
  };
}

ShiftRegister.prototype.send = function( value ) {
  this.board.digitalWrite( this.pins.latch, this.firmata.LOW );
  this.board.shiftOut( this.pins.data, this.pins.clock, true, value );
  this.board.digitalWrite( this.pins.latch, this.firmata.HIGH );

  return this;
};

module.exports = ShiftRegister;
