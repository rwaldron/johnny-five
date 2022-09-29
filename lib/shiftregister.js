const Board = require("./board");
const Collection = require("./mixins/collection");
const priv = new Map();
const encoded = {
  cathode: [63, 6, 91, 79, 102, 109, 125, 7, 127, 103],
  anode: [64, 121, 36, 48, 25, 18, 2, 120, 0, 24],
};


class ShiftRegister {
  constructor(opts) {
    if (!(this instanceof ShiftRegister)) {
      return new ShiftRegister(opts);
    }

    if (Array.isArray(opts)) {
      // [Data, Clock, Latch, Reset]
      opts = {
        pins: {
          data: opts[0],
          clock: opts[1],
          latch: opts[2],
          reset: opts.length === 4 ? opts[3] : null,
        }
      };
    } else if (typeof opts.pins === "object" && Array.isArray(opts.pins)) {
      opts.pins = {
        data: opts.pins[0],
        clock: opts.pins[1],
        latch: opts.pins[2],
        reset: opts.pins.length === 4 ? opts.pins[3] : null,
      };
    }

    Board.Component.call(
      this, opts = Board.Options(opts)
    );

    this.size = opts.size || 1;
    this.pins.reset = typeof opts.pins.reset !== "undefined" ? opts.pins.reset : null;

    const isAnode = typeof opts.isAnode !== "undefined" ? opts.isAnode : false;
    const clear = isAnode ? 255 : 0;
    const state = {
      isAnode,
      value: new Array(this.size).fill(clear),
      encoded: encoded[isAnode ? "anode" : "cathode"],
      clear,
    };

    priv.set(this, state);

    Object.defineProperties(this, {
      isAnode: {
        get() {
          return isAnode;
        }
      },
      value: {
        get() {
          return state.value;
        }
      },
    });
  }

  /**
   * Print a digit on a seven segment display, or several
   * digits across several displays.
   */
  display(value) {
    const state = priv.get(this);
    let chars;

    if (typeof value === "number") {
      // 1, 20, etc.
      return this.display(String(value));
    }

    if (typeof value === "string") {
      const matches = value.match(/([0-9]{1}\.*)/g);

      if (matches && matches.length) {
        chars = matches.map(char => {
          // "1"
          if (char.length === 1) {
            return state.encoded[char] | (1 << 7);
          }
          // "1.?.?"
          return state.encoded[char[0]];
        });
      }
    }

    this.send(chars);

    state.value = chars;

    return this;
  }

  /**
   * Send one or more values to the shift register.
   * @param {...number} value Value to send
   * @returns {ShiftRegister}
   */
  send(value) {
    const state = priv.get(this);
    let args = Array.from(arguments);

    if (args.length === 1) {
      args = [value];
    }

    if (Array.isArray(value)) {
      args = value;
    }

    // open latch to fill register with data
    this.io.digitalWrite(this.pins.latch, this.io.LOW);

    args.forEach(function(arg) {
      if (typeof arg === "string") {
        arg = arg.charCodeAt(0);
      }
      if (this.isAnode &&
        (arg !== 255 && !state.encoded.includes(arg) && !state.encoded.includes(arg & ~(1 << 7)))) {

        const index = encoded.anode.findIndex(value => value === arg);

        if (index !== -1) {
          arg = encoded.cathode[index];
        }
      }
      this.board.shiftOut(this.pins.data, this.pins.clock, true, arg);
    }, this);

    // close latch to commit bits into register.
    this.io.digitalWrite(this.pins.latch, this.io.HIGH);

    state.value = args;

    return this;
  }

  /**
   * Clear the shift register by replacing each value with a 0.
   * @type {ShiftRegister}
   */
  clear() {
    const state = priv.get(this);
    return this.send(Array(this.size).fill(state.clear));
  }

  reset() {
    if (this.pins.reset === null) {
      throw new Error("ShiftRegister was not initialized with a reset pin");
    }
    this.io.digitalWrite(this.pins.clock, this.io.LOW);
    this.io.digitalWrite(this.pins.reset, this.io.LOW);
    this.io.digitalWrite(this.pins.clock, this.io.HIGH);
    this.io.digitalWrite(this.pins.reset, this.io.HIGH);

    return this;
  }
}



/**
 * ShiftRegisters()
 * new ShiftRegisters()
 */

class ShiftRegisters extends Collection {
  constructor(numsOrObjects) {
    super(numsOrObjects);
  }

  get type() {
    return ShiftRegister;
  }
}

Collection.installMethodForwarding(
  ShiftRegisters.prototype, ShiftRegister.prototype
);


/*
 * ShiftRegisters, display(...)
 *
 * eg. array.display(...);

 * ShiftRegisters, send(...)
 *
 * eg. array.send(...);

 * ShiftRegisters, clear()
 *
 * eg. array.clear();

 * ShiftRegisters, reset()
 *
 * eg. array.reset();
 */

Collection.installMethodForwarding(
  ShiftRegisters.prototype, ShiftRegister.prototype
);

// Assign ShiftRegisters Collection class as static "method" of ShiftRegister.
ShiftRegister.Collection = ShiftRegisters;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  ShiftRegister.purge = () => {
    priv.clear();
  };
}

module.exports = ShiftRegister;
