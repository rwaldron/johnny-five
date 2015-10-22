var Board = require("../lib/board.js");

var priv = new Map();

function ShiftRegister(opts) {
  if (!(this instanceof ShiftRegister)) {
    return new ShiftRegister(opts);
  }

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  this.pins = {
    data: opts.pins.data,
    clock: opts.pins.clock,
    latch: opts.pins.latch
  };

  this.size = opts.size || 1;

  priv.set(this, {
    value: this.size > 1 ? new Array(this.size).fill(0) : 0
  });

  Object.defineProperties(this, {
    value: {
      get: function() {
        return priv.get(this).value;
      }
    }
  });
}

/**
 * Send one or more values to the shift register.
 * @param {...number} value Value to send
 * @returns {ShiftRegister}
 */
ShiftRegister.prototype.send = function(value) {
  var args = Array.prototype.slice.apply(arguments);
  this.board.digitalWrite(this.pins.latch, this.io.LOW);
  args.forEach(function(val) {
    this.board.shiftOut(this.pins.data, this.pins.clock, true, val);
  }, this);
  this.board.digitalWrite(this.pins.latch, this.io.HIGH);

  priv.get(this).value = args.length > 1 ? args : value;

  return this;
};

/**
 * Clear the shift register by replacing each value with a 0.
 * @type {ShiftRegister}
 */
ShiftRegister.prototype.clear = function () {
  var value = priv.get(this).value;
  if (Array.isArray(value)) {
    return this.send.apply(this, new Array(value.length).fill(0));
  }
  return this.send(0);
};

module.exports = ShiftRegister;
