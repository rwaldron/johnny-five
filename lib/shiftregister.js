var Board = require("../lib/board.js");

function ShiftRegister(opts) {
  if (!(this instanceof ShiftRegister)) {
    return new ShiftRegister(opts);
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  this.pins = {
    data: opts.pins.data,
    clock: opts.pins.clock,
    latch: opts.pins.latch
  };
}

ShiftRegister.prototype.send = function(value) {
  this.board.digitalWrite(this.pins.latch, this.io.LOW);
  this.board.shiftOut(this.pins.data, this.pins.clock, true, value);
  this.board.digitalWrite(this.pins.latch, this.io.HIGH);

  return this;
};

module.exports = ShiftRegister;
