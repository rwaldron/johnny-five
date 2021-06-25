const Board = require("./board");
const Emitter = require("./mixins/emitter");
const { constrain, fscale } = require("./fn");
const priv = new Map();
const axes = ["x", "y"];

class Multiplexer {
  constructor({pins, io}) {
    this.pins = pins;
    this.io = io;

    // Setup these "analog" pins as digital output.
    this.io.pinMode(this.pins[0], this.io.MODES.OUTPUT);
    this.io.pinMode(this.pins[1], this.io.MODES.OUTPUT);
    this.io.pinMode(this.pins[2], this.io.MODES.OUTPUT);
    this.io.pinMode(this.pins[3], this.io.MODES.OUTPUT);
  }

  select(channel) {
    this.io.digitalWrite(this.pins[0], channel & 1 ? this.io.HIGH : this.io.LOW);
    this.io.digitalWrite(this.pins[1], channel & 2 ? this.io.HIGH : this.io.LOW);
    this.io.digitalWrite(this.pins[2], channel & 4 ? this.io.HIGH : this.io.LOW);
    this.io.digitalWrite(this.pins[3], channel & 8 ? this.io.HIGH : this.io.LOW);
  }
}

const Controllers = {
  ANALOG: {
    initialize: {
      value({pins}, callback) {
        const axisValues = {
          x: null,
          y: null
        };

        pins.forEach((pin, index) => {
          this.io.pinMode(pin, this.io.MODES.ANALOG);
          this.io.analogRead(pin, value => {
            axisValues[axes[index]] = value;

            if (axisValues.x !== null && axisValues.y !== null) {
              callback({
                x: axisValues.x,
                y: axisValues.y
              });

              axisValues.x = null;
              axisValues.y = null;
            }
          });
        });
      }
    },
    toAxis: {
      value(raw, axis) {
        const state = priv.get(this);
        return constrain(fscale(raw - state[axis].zeroV, -511, 511, -1, 1), -1, 1);
      }
    }
  },
  ESPLORA: {
    initialize: {
      value(options, callback) {
        // References:
        //
        // https://github.com/arduino/Arduino/blob/master/libraries/Esplora/src/Esplora.h
        // https://github.com/arduino/Arduino/blob/master/libraries/Esplora/src/Esplora.cpp
        //
        const multiplexer = new Multiplexer({
          // Since Multiplexer uses digitalWrite,
          // we have to send the analog pin numbers
          // in their "digital" pin order form.
          pins: [18, 19, 20, 21],
          io: this.io
        });
        const channels = [11, 12];
        let index = 1;
        const axisValues = {
          x: null,
          y: null
        };

        this.io.pinMode(4, this.io.MODES.ANALOG);

        const handler = value => {
          axisValues[axes[index]] = value;

          if (axisValues.x !== null && axisValues.y !== null) {
            callback({
              x: axisValues.x,
              y: axisValues.y
            });

            axisValues.x = null;
            axisValues.y = null;
          }

          // Remove this handler to all the multiplexer
          // to setup the next pin for the next read.
          this.io.removeListener("analog-read-4", handler);

          setTimeout(read, 10);
        };

        var read = () => {
          multiplexer.select(channels[index ^= 1]);
          this.io.analogRead(4, handler);
        };

        read();
      }
    },
    toAxis: {
      value(raw, axis) {
        const state = priv.get(this);
        return constrain(fscale(raw - state[axis].zeroV, -511, 511, -1, 1), -1, 1);
      }
    }
  }
};

Controllers.DEFAULT = Controllers.ANALOG;

/**
 * Joystick
 * @constructor
 *
 * five.Joystick([ x, y[, z] ]);
 *
 * five.Joystick({
 *   pins: [ x, y[, z] ]
 *   freq: ms
 * });
 *
 *
 * @param {Object} options [description]
 *
 */
class Joystick extends Emitter {
  constructor(options) {
    super();

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    if (!this.toAxis) {
      this.toAxis = options.toAxis || (raw => raw);
    }

    const state = {
      x: {
        invert: false,
        value: 0,
        previous: 0,
        zeroV: 0,
        calibrated: false
      },
      y: {
        invert: false,
        value: 0,
        previous: 0,
        zeroV: 0,
        calibrated: false
      }
    };

    state.x.zeroV = options.zeroV === undefined ? 0 : (options.zeroV.x || 0);
    state.y.zeroV = options.zeroV === undefined ? 0 : (options.zeroV.y || 0);

    state.x.invert = options.invertX || options.invert || false;
    state.y.invert = options.invertY || options.invert || false;

    priv.set(this, state);

    if (typeof this.initialize === "function") {
      this.initialize(options, data => {
        let isChange = false;
        const computed = {
          x: null,
          y: null
        };

        Object.keys(data).forEach(axis => {
          const value = data[axis];
          const sensor = state[axis];

          // Set the internal ADC reading value...
          sensor.value = value;

          if (!state[axis].calibrated) {
            state[axis].calibrated = true;
            state[axis].zeroV = value;
            isChange = true;
          }

          // ... Get the computed axis value.
          computed[axis] = this[axis];

          const absAxis = Math.abs(computed[axis]);
          const absPAxis = Math.abs(sensor.previous);

          if ((absAxis < absPAxis) ||
            (absAxis > absPAxis)) {
            isChange = true;
          }

          sensor.previous = computed[axis];
        });

        this.emit("data", {
          x: computed.x,
          y: computed.y
        });

        if (isChange) {
          this.emit("change", {
            x: computed.x,
            y: computed.y
          });
        }
      });
    }

    Object.defineProperties(this, {
      x: {
        get() {
          return this.toAxis(state.x.value, "x") * (state.x.invert ? -1 : 1);
        }
      },
      y: {
        get() {
          return this.toAxis(state.y.value, "y") * (state.y.invert ? -1 : 1);
        }
      }
    });
  }
}

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Joystick.Controllers = Controllers;
  Joystick.purge = () => {
    priv.clear();
  };
}

module.exports = Joystick;
