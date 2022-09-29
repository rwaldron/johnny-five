const Board = require("./board");
const Emitter = require("./mixins/emitter");
const Collection = require("./mixins/collection");

const priv = new Map();
const modes = {
  INPUT: 0x00,
  OUTPUT: 0x01,
  ANALOG: 0x02,
  PWM: 0x03,
  SERVO: 0x04
};

const LOW = "low";
const HIGH = "high";
const ANALOG = "analog";
const DIGITAL = "digital";

/**
 * Pin
 * @constructor
 *
 * @description Direct Pin access objects
 *
 * @param {Object} options Options: pin, freq, range
 */

class Pin extends Emitter {
  constructor(options) {
    super();

    if (options === undefined || (typeof options === "object" &&
        options.addr === undefined && options.pin === undefined)) {
      throw new Error("Pins must have a pin number");
    }

    const pinValue = typeof options === "object" ? (options.addr || options.pin || 0) : options;
    let isAnalogInput = Pin.isAnalog(options);
    let isDTOA = false;

    Board.Component.call(
      this, options = Board.Options(options)
    );

    options.addr = options.addr || options.pin;

    if (this.io.analogPins.includes(pinValue)) {
      isAnalogInput = false;
      isDTOA = true;
    }

    const isPin = typeof options !== "object";
    const addr = isDTOA ? pinValue : (isPin ? options : options.addr);
    const type = options.type || (isAnalogInput ? ANALOG : DIGITAL);

    // Create a private side table
    const state = {
      mode: null,
      last: null,
      value: 0
    };

    priv.set(this, state);

    // Create read-only "addr(address)" property
    Object.defineProperties(this, {
      type: {
        get() {
          return type;
        }
      },
      addr: {
        get() {
          return addr;
        }
      },
      value: {
        get() {
          return state.value;
        }
      },
      mode: {
        set(mode) {
          priv.get(this).mode = mode;
          this.io.pinMode(this.addr, mode);
        },
        get() {
          return priv.get(this).mode;
        }
      }
    });

    this.mode = typeof options.as !== "undefined" ? options.as :
      (typeof options.mode !== "undefined" ? options.mode : (isAnalogInput ? 0x02 : 0x01));

    this.freq = typeof options.freq !== "undefined" ? options.freq : 20;

    if (this.mode === 0 || this.mode === 2) {
      read(this);
    }

    if (type === DIGITAL) {
      Object.defineProperties(this, {
        isHigh: {
          get() {
            return !!state.value;
          }
        },
        isLow: {
          get() {
            return !state.value;
          }
        },
      });
    }
  }

  query(callback) {
    let index = this.addr;

    if (this.type === ANALOG) {
      index = this.io.analogPins[this.addr];
    }

    this.io.queryPinState(index, () => callback(this.io.pins[index]));

    return this;
  }

  /**
   * high  Write high/1 to the pin
   * @return {Pin}
   */

  high() {
    const value = this.type === ANALOG ? this.board.RESOLUTION.PWM : 1;
    Pin.write(this, value);
    this.emit(HIGH);
    return this;
  }

  /**
   * low  Write low/0 to the pin
   * @return {Pin}
   */

  low() {
    Pin.write(this, 0);
    this.emit(LOW);
    return this;
  }
}


function read(pin) {
  const state = priv.get(pin);

  pin.io[`${pin.type}Read`](pin.addr, data => state.value = data);

  setInterval(() => {
    let isNot;
    let emit;

    isNot = state.value ? LOW : HIGH;
    emit = state.value ? HIGH : LOW;

    if (state.mode === modes.INPUT) {
      if (state.last === null) {
        state.last = isNot;
      }
      if (state.last === isNot) {
        state.last = emit;
        pin.emit(emit, state.value);
        pin.emit("change", state.value);
      }
    }
    pin.emit("data", state.value);
  }, pin.freq);
}


/**
 * Pin.@@MODE
 *
 * Read-only constants
 * Pin.INPUT   = 0x00
 * Pin.OUTPUT  = 0x01
 * Pin.ANALOG  = 0x02
 * Pin.PWM     = 0x03
 * Pin.SERVO   = 0x04
 *
 */
Object.entries(modes).forEach(([mode, value]) => {
  Object.defineProperty(Pin, mode, { value });
});


Pin.isAnalog = options => {
  if (typeof options === "string" &&
      Pin.isPrefixed(options, ["I", "A"])) {
    return true;
  }

  if (typeof options === "object") {
    return Pin.isAnalog(
      typeof options.addr !== "undefined" ?
        options.addr : options.pin
    );
  }
};

Pin.isPrefixed = (value, prefixes) => {
  value = value[0];

  return prefixes.reduce((resolution, prefix) => {
    if (!resolution) {
      return prefix === value;
    }
    return resolution;
  }, false);
};

Pin.write = (pin, val) => {
  const state = priv.get(pin);

  state.value = val;

  // Set the correct mode (OUTPUT)
  // This will only set if it needs to be set, otherwise a no-op
  pin.mode = modes.OUTPUT;

  // Create the correct type of write command
  pin.io[`${pin.type}Write`](pin.addr, val);

  pin.emit("write", null, val);
};

Pin.read = (pin, callback) => {
  // Set the correct mode (INPUT)
  // This will only set if it needs to be set, otherwise a no-op

  let isChanging = false;

  if (pin.type === DIGITAL && pin.mode !== 0) {
    isChanging = true;
    pin.mode = modes.INPUT;
  }

  if (pin.type === ANALOG && pin.mode !== 2) {
    isChanging = true;
    pin.mode = modes.ANALOG;
  }

  if (isChanging) {
    read(pin);
  }

  pin.on("data", () => {
    callback.call(pin, null, pin.value);
  });
};


/**
 * read  Read from the pin, value is passed to callback continuation
 * @return {Pin}
 */

/**
 * write  Write to a pin
 * @return {Pin}
 */
["read", "write"].forEach(operation => {
  Pin.prototype[operation] = function(valOrCallback) {
    Pin[operation](this, valOrCallback);
    return this;
  };
});


/**
 * Pins()
 * new Pins()
 *
 * Constructs an Array-like instance of all servos
 */
class Pins extends Collection.Emitter {
  constructor(numsOrObjects) {
    super(numsOrObjects);
  }
  get type() {
    return Pin;
  }
}

Collection.installMethodForwarding(
  Pins.prototype, Pin.prototype
);

Pin.Collection = Pins;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Pin.purge = () => {
    priv.clear();
  };
}

module.exports = Pin;
