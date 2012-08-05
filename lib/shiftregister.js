var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    __ = require("../lib/fn.js"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap;

var priv = new WeakMap();

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

  for (var mask = 128; mask > 0; mask = mask >> 1) {
    this.board.digitalWrite( this.pins.clock, this.firmata.LOW );

    this.board.digitalWrite(
      this.pins.data,
      this.firmata[ value & mask ? 'HIGH' : 'LOW']
    );

    this.board.digitalWrite( this.pins.clock, this.firmata.HIGH );
  }

  this.board.digitalWrite( this.pins.latch, this.firmata.HIGH );
};

module.exports = ShiftRegister;