const Board = require("./board");
const Collection = require("./mixins/collection");
const Emitter = require("./mixins/emitter");
const EVS = require("./evshield");
const Fn = require("./fn");

const priv = new Map();
const Pins = Board.Pins;
const aliases = {
  down: ["down", "press"],
  up: ["up", "release"]
};

const Controllers = {
  DEFAULT: {
    initialize: {
      value(options, callback) {
        const state = priv.get(this);

        if (Pins.isFirmata(this) &&
            (typeof options.pinValue === "string" &&
              (options.pinValue.length > 1 && options.pinValue[0] === "A"))) {
          options.pinValue = this.io.analogPins[+options.pinValue.slice(1)];
        }

        this.pin = Number.isNaN(+options.pinValue) ? options.pinValue : +options.pinValue;

        this.io.pinMode(this.pin, this.io.MODES.INPUT);

        // Enable the pullup resistor after setting pin mode
        if (this.pullup) {
          this.io.digitalWrite(this.pin, this.io.HIGH);
        }

        // Enable the pulldown resistor after setting pin mode
        if (this.pulldown) {
          this.io.digitalWrite(this.pin, this.io.LOW);
        }

        this.io.digitalRead(this.pin, data => {
          if (data !== state.last) {
            callback(data);
          }
        });
      }
    },
    toBoolean: {
      writable: true,
      value(raw) {
        return raw === this.downValue;
      }
    }
  },

  TINKERKIT: {
    initialize: {
      value(options, callback) {
        const state = priv.get(this);
        let value = 0;

        this.io.pinMode(this.pin, this.io.MODES.ANALOG);

        this.io.analogRead(this.pin, data => {
          data = data > 512 ?  1 : 0;

          // This condition simulates digitalRead's
          // behavior of limiting calls to changes in
          // pin value.
          /* istanbul ignore else */
          if (data !== value && data !== state.last) {
            callback(data);
          }

          value = data;
        });
      }
    },
    toBoolean: {
      writable: true,
      value(raw) {
        return raw === this.downValue;
      }
    }
  },

  EVS_EV3: {
    initialize: {
      value(options, callback) {
        const state = priv.get(this);

        state.previous = 0;
        state.shield = EVS.shieldPort(options.pin);
        state.register = EVS.Touch;

        state.ev3 = new EVS(Object.assign(options, {
          io: this.io
        }));
        state.ev3.setup(state.shield, EVS.Type_EV3_TOUCH);
        state.ev3.read(state.shield, EVS.Touch, EVS.Touch_Bytes, data => {
          const value = data[0];
          // Since i2cRead is continuous regardless of the reading,
          // and digitalRead is continuous but only called for changes
          // in reading value, we need to suppress repeated calls to
          // callback by limiting to only changed values.
          /* istanbul ignore else */
          if (state.previous !== value) {
            callback(value);
          }
          state.previous = value;
        });
      }
    },
    toBoolean: {
      writable: true,
      value(raw) {
        return raw === this.downValue;
      }
    }
  },
  EVS_NXT: {
    initialize: {
      value(options, callback) {
        const state = priv.get(this);

        state.previous = 0;
        state.shield = EVS.shieldPort(options.pin);

        state.ev3 = new EVS(Object.assign(options, {
          io: this.io
        }));
        state.ev3.setup(state.shield, EVS.Type_ANALOG);
        state.ev3.read(state.shield, state.shield.analog, EVS.Analog_Bytes, data => {
          let value = data[0] | (data[1] << 8);
          // Since i2cRead is continuous regardless of the reading,
          // and digitalRead is continuous but only called for changes
          // in reading value, we need to suppress repeated calls to
          // callback by limiting to only changed values.
          value = value < 300 ? 1 : 0;

          /* istanbul ignore else */
          if (state.previous !== value) {
            callback(value);
          }
          state.previous = value;
        });
      }
    },
    toBoolean: {
      writable: true,
      value(raw) {
        return raw === this.downValue;
      }
    }
  }
};

/**
 * Button
 * @constructor
 *
 * Button();
 *
 * Button({
 *   pin: 10
 * });
 *
 *
 * @param {Object} options [description]
 *
 */

class Button extends Emitter {
  constructor(options) {
    super();

    let raw;
    let invert = false;
    let downValue = 1;
    let upValue = 0;
    const state = {
      interval: null,
      last: null
    };

    // Create a debounce boundary on event triggers
    // this avoids button events firing on
    // press noise and false positives
    const trigger = Fn.debounce(key => {
      aliases[key].forEach(type => this.emit(type));
    }, 7);

    let pinValue = typeof options === "object" ? options.pin : options;

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    options.pinValue = pinValue;

    // `holdtime` is used by an interval to determine
    // if the button has been released within a specified
    // time frame, in milliseconds.
    this.holdtime = options.holdtime || 500;

    // `options.isPullup` is included as part of an effort to
    // phase out "isFoo" options properties
    this.pullup = options.pullup || options.isPullup || false;

    this.pulldown = options.pulldown || options.isPulldown || false;

    // Turns out some button circuits will send
    // 0 for up and 1 for down, and some the inverse,
    // so we can invert our function with this option.
    // Default to invert in pullup mode, but use options.invert
    // if explicitly defined (even if false)
    invert = typeof options.invert !== "undefined" ?
      options.invert : (this.pullup || false);

    if (invert) {
      downValue = downValue ^ 1;
      upValue = upValue ^ 1;
    }

    state.last = upValue;

    // Create a "state" entry for privately
    // storing the state of the button
    priv.set(this, state);

    Object.defineProperties(this, {
      value: {
        get() {
          return Number(this.isDown);
        }
      },
      invert: {
        get() {
          return invert;
        },
        set(value) {
          invert = value;
          downValue = invert ? 0 : 1;
          upValue = invert ? 1 : 0;
          state.last = upValue;
        }
      },
      downValue: {
        get() {
          return downValue;
        },
        set(value) {
          downValue = value;
          upValue = value ^ 1;
          invert = value ? true : false;
          state.last = upValue;
        }
      },
      upValue: {
        get() {
          return upValue;
        },
        set(value) {
          upValue = value;
          downValue = value ^ 1;
          invert = value ? true : false;
          state.last = downValue;
        }
      },
      isDown: {
        get() {
          return this.toBoolean(raw);
        }
      }
    });

    /* istanbul ignore else */
    if (typeof this.initialize === "function") {
      this.initialize(options, data => {
        // Update the raw data value, which
        // is used by isDown = toBoolean()
        raw = data;

        if (!this.isDown) {
          /* istanbul ignore else */
          if (state.interval) {
            clearInterval(state.interval);
          }
          trigger("up");
        }

        if (this.isDown) {
          trigger("down");

          state.interval = setInterval(() => {
            /* istanbul ignore else */
            if (this.isDown) {
              this.emit("hold");
            }
          }, this.holdtime);
        }

        state.last = data;
      });
    }
  }
}

/**
 * Fired when the button is pressed down
 *
 * @event
 * @name down
 * @memberOf Button
 */

/**
 * Fired when the button is held
 *
 * @event
 * @name hold
 * @memberOf Button
 */

/**
 * Fired when the button is released
 *
 * @event
 * @name up
 * @memberOf Button
 */


/**
 * Buttons()
 * new Buttons()
 */

class Buttons extends Collection.Emitter {
  constructor(numsOrObjects) {
    super(numsOrObjects);
  }
  get type() {
    return Button;
  }
}

Collection.installMethodForwarding(
  Buttons.prototype, Button.prototype
);

// Assign Buttons Collection class as static "method" of Button.
Button.Collection = Buttons;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Button.Controllers = Controllers;
  Button.purge = function() {
    priv.clear();
  };
}


module.exports = Button;
