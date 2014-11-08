var Board = require("../lib/board.js");

var priv = new Map();

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

  priv.set(this, { state: 0 });

  Object.defineProperties(this, {
    state: {
      get: function() {
        return priv.get(this).state;
      }
    }
  });
}

ShiftRegister.prototype.send = function(value) {
  this.board.digitalWrite(this.pins.latch, this.io.LOW);
  this.board.shiftOut(this.pins.data, this.pins.clock, true, value);
  this.board.digitalWrite(this.pins.latch, this.io.HIGH);

  priv.get(this).state = value;

  return this;
};

module.exports = ShiftRegister;
