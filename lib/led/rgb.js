const Board = require("../board");
const Animation = require("../animation");
const Expander = require("../expander");
const converter = require("color-convert");
const { constrain, map } = require("../fn");
const priv = new Map();

const Controllers = {
  DEFAULT: {
    initialize: {
      value({pins, debug}) {
        RGB.colors.forEach((color, index) => {
          const pin = pins[index];

          if (debug && !this.board.pins.isPwm(pin)) {
            Board.Pins.Error({
              pin,
              type: "PWM",
              via: "Led.RGB"
            });
          }

          this.io.pinMode(pin, this.io.MODES.PWM);
          this.pins[index] = pin;
        });
      }
    },
    write: {
      writable: true,
      value(colors) {
        const state = priv.get(this);

        RGB.colors.forEach((color, index) => {
          const pin = this.pins[index];
          let value = colors[color];

          if (state.isAnode) {
            value = 255 - constrain(value, 0, 255);
          }
          value = map(value, 0, 255, 0, this.board.RESOLUTION.PWM);

          this.io.analogWrite(pin, value);
        });
      }
    }
  },
  PCA9685: {
    initialize: {
      value({address, pwmRange, frequency, pins}) {

        const state = priv.get(this);

        this.address = address || 0x40;
        this.pwmRange = pwmRange || [0, 4095];
        this.frequency = frequency || 200;

        state.expander = Expander.get({
          address: this.address,
          controller: this.controller,
          bus: this.bus,
          pwmRange: this.pwmRange,
          frequency: this.frequency,
        });

        RGB.colors.forEach((color, index) => {
          this.pins[index] = state.expander.normalize(pins[index]);
          state.expander.analogWrite(this.pins[index], 0);
        });
      }
    },
    write: {
      writable: true,
      value(colors) {
        const state = priv.get(this);

        RGB.colors.forEach((color, index) => {
          const pin = this.pins[index];
          let value = colors[color];

          if (state.isAnode) {
            value = 255 - constrain(value, 0, 255);
          }

          state.expander.analogWrite(pin, value);

        });
      }
    }
  },
  BLINKM: {
    REGISTER: {
      value: {
        GO_TO_RGB_COLOR_NOW: 0x6e,
        STOP_SCRIPT: 0x6f
      }
    },
    initialize: {
      value(options) {
        this.address = options.address || 0x09;

        // Ensure that this is passed on to i2cConfig
        options.address = this.address;

        /* istanbul ignore else */
        if (!this.board.Drivers[this.address]) {
          this.io.i2cConfig(options);
          this.board.Drivers[this.address] = {
            initialized: false
          };

          // Stop the current script
          this.io.i2cWrite(this.address, [this.REGISTER.STOP_SCRIPT]);

          this.board.Drivers[this.address].initialized = true;
        }
      }
    },
    write: {
      writable: true,
      value({red, green, blue}) {
        this.io.i2cWrite(this.address, [this.REGISTER.GO_TO_RGB_COLOR_NOW, red, green, blue]);
      }
    }
  }
};

Controllers.ESPLORA = {
  initialize: {
    value(options) {
      options.pins = [5, 10, 9];
      this.pins = [];
      Controllers.DEFAULT.initialize.value.call(this, options);
    }
  },
  write: Controllers.DEFAULT.write
};

/**
 * RGB
 * @constructor
 *
 * @param {Object} options [description]
 * @alias Led.RGB
 */
class RGB {
  constructor(options) {

    if (Array.isArray(options)) {
      // RGB([Byte, Byte, Byte]) shorthand
      // Convert to options.pins array definition
      options = {
        pins: options
      };
      // If options.pins is an object, convert to array
    } else if (typeof options.pins === "object" && !Array.isArray(options.pins)) {
      options.pins = [options.pins.red, options.pins.green, options.pins.blue];
    }

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(
      this, Controllers, options
    );

    // The default color is #ffffff, but the light will be off
    const state = {
      red: 255,
      green: 255,
      blue: 255,
      intensity: 100,
      isAnode: options.isAnode || false,
      interval: null,
      // red, green, and blue store the raw color set via .color()
      // values takes state into account, such as on/off and intensity
      values: {
        red: 255,
        green: 255,
        blue: 255,
      }
    };

    priv.set(this, state);

    Object.defineProperties(this, {
      isOn: {
        get() {
          return RGB.colors.some(color => state[color] > 0);
        }
      },
      isRunning: {
        get() {
          return !!state.interval;
        }
      },
      isAnode: {
        get() {
          return state.isAnode;
        }
      },
      values: {
        get() {
          return Object.assign({}, state.values);
        }
      },
      update: {
        value(colors) {
          const state = priv.get(this);

          colors = colors || this.color();

          state.values = RGB.ToScaledRGB(state.intensity, colors);

          this.write(state.values);

          Object.assign(state, colors);
        }
      }
    });

    this.initialize(options);
    this.off();
  }

  /**
   * color
   *
   * @param  {String} color Hexadecimal color string or CSS color name
   * @param  {Array} color Array of color values
   * @param  {Object} color object {red, green, blue}
   *
   * @return {RGB}
   */
  color(red, green, blue) {
    const state = priv.get(this);
    let colors;

    if (arguments.length === 0) {
      // Return a copy of the state values,
      // not a reference to the state object itself.
      colors = this.isOn ? state : state.prev;
      return RGB.colors.reduce((current, color) => (current[color] = Math.round(colors[color]), current), {});
    }

    const update = RGB.ToRGB(red, green, blue);

    // Validate all color values before writing any values
    RGB.colors.forEach(color => {
      let value = update[color];

      if (value == null) {
        throw new Error(`Led.RGB.color: invalid color ([${[update.red, update.green, update.blue].join(",")}])`);
      }

      value = constrain(value, 0, 255);
      update[color] = value;
    });

    this.update(update);

    return this;
  }

  on() {
    const state = priv.get(this);
    let colors;

    // If it's not already on, we set them to the previous color
    if (!this.isOn) {
      /* istanbul ignore next */
      colors = state.prev || {
        red: 255,
        green: 255,
        blue: 255
      };

      state.prev = null;

      this.update(colors);
    }

    return this;
  }

  off() {
    const state = priv.get(this);

    // If it's already off, do nothing so the pervious state stays intact
    /* istanbul ignore else */
    if (this.isOn) {
      state.prev = RGB.colors.reduce((current, color) => (current[color] = state[color], current), {});

      this.update({
        red: 0,
        green: 0,
        blue: 0
      });
    }

    return this;
  }

  /**
   * blink
   * @param  {Number} duration Time in ms on, time in ms off
   * @return {RGB}
   */
  blink(duration, callback) {
    const state = priv.get(this);

    // Avoid traffic jams
    this.stop();

    if (typeof duration === "function") {
      callback = duration;
      duration = null;
    }

    state.interval = setInterval(() => {
      this.toggle();
      if (typeof callback === "function") {
        callback();
      }
    }, duration || 100);

    return this;
  }

  toggle() {
    return this[this.isOn ? "off" : "on"]();
  }

  stop() {
    const state = priv.get(this);

    if (state.interval) {
      clearInterval(state.interval);
    }

    /* istanbul ignore if */
    if (state.animation) {
      state.animation.stop();
    }

    state.interval = null;

    return this;
  }

  intensity(intensity) {
    const state = priv.get(this);

    if (arguments.length === 0) {
      return state.intensity;
    }

    state.intensity = constrain(intensity, 0, 100);

    this.update();

    return this;
  }

  /**
   * Animation.normalize
   *
   * @param [number || object] keyFrames An array of step values or a keyFrame objects
   */

  [Animation.normalize](keyFrames) {
    const state = priv.get(this);

    // If user passes null as the first element in keyFrames use current value
    if (keyFrames[0] === null) {
      keyFrames[0] = state.values;
    }

    return keyFrames.reduce((accum, frame) => {
      const value = frame;
      let normalized = {};
      let color = null;
      let intensity = state.intensity;

      if (frame !== null) {
        // Frames that are just numbers are not allowed
        // because it is ambiguous.
        if (typeof value === "number") {
          throw new Error("RGB LEDs expect a complete keyFrame object or hexadecimal string value");
        }

        if (typeof value === "string") {
          color = value;
        }

        if (Array.isArray(value)) {
          color = value;
        } else {
          if (typeof value === "object") {
            if (typeof value.color !== "undefined") {
              color = value.color;
            } else {
              color = value;
            }
          }
        }

        if (typeof frame.intensity === "number") {
          intensity = frame.intensity;
          delete frame.intensity;
        }

        normalized.easing = frame.easing || "linear";
        normalized.value = RGB.ToScaledRGB(intensity, RGB.ToRGB(color));
      } else {
        normalized = frame;
      }

      accum.push(normalized);

      return accum;
    }, []);
  }

  /**
   * Animation.render
   *
   * @color [object] color object
   */

  [Animation.render](frames) {
    return this.color(frames[0]);
  }


}
/**
 * For multi-property animation, must define
 * the keys to use for tween calculation.
 */
RGB.prototype[Animation.keys] = RGB.colors;

RGB.colors = ["red", "green", "blue"];

RGB.ToScaledRGB = (intensity, colors) => {
  const scale = intensity / 100;

  return RGB.colors.reduce((current, color) => (current[color] = Math.round(colors[color] * scale), current), {});
};

RGB.ToRGB = (red, green, blue) => {
  let update = {};
  let flags = 0;
  let input;

  if (typeof red !== "undefined") {
    // 0b100
    flags |= 1 << 2;
  }

  if (typeof green !== "undefined") {
    // 0b010
    flags |= 1 << 1;
  }

  if (typeof blue !== "undefined") {
    // 0b001
    flags |= 1 << 0;
  }

  if ((flags | 0x04) === 0x04) {
    input = red;

    if (input == null) {
      throw new Error(`Invalid color (${input})`);
    }

    /* istanbul ignore else */
    if (Array.isArray(input)) {
      // color([Byte, Byte, Byte])
      update = {
        red: input[0],
        green: input[1],
        blue: input[2]
      };
    } else if (typeof input === "object") {
      // color({
      //   red: Byte,
      //   green: Byte,
      //   blue: Byte
      // });
      update = {
        red: input.red,
        green: input.green,
        blue: input.blue
      };
    } else if (typeof input === "string") {

      // color("#ffffff") or color("ffffff")
      if (/^#?[0-9A-Fa-f]{6}$/.test(input)) {

        // remove the leading # if there is one
        if (input.length === 7 && input[0] === "#") {
          input = input.slice(1);
        }

        update = {
          red: parseInt(input.slice(0, 2), 16),
          green: parseInt(input.slice(2, 4), 16),
          blue: parseInt(input.slice(4, 6), 16)
        };
      } else {
        // color("rgba(r, g, b, a)") or color("rgb(r, g, b)")
        // color("rgba(r g b a)") or color("rgb(r g b)")
        if (/^rgb/.test(input)) {
          const args = input.match(/^rgba?\(([^)]+)\)$/)[1].split(/[\s,]+/);

          // If the values were %...
          if (isPercentString(args[0])) {
            args.forEach((value, index) => {
              // Only convert the first 3 values
              if (index <= 2) {
                args[index] = Math.round((parseInt(value, 10) / 100) * 255);
              }
            });
          }

          update = {
            red: parseInt(args[0], 10),
            green: parseInt(args[1], 10),
            blue: parseInt(args[2], 10)
          };

          // If rgba(...)
          if (args.length > 3) {
            if (isPercentString(args[3])) {
              args[3] = parseInt(args[3], 10) / 100;
            }
            update = RGB.ToScaledRGB(100 * parseFloat(args[3]), update);
          }
        } else {
          // color name
          return RGB.ToRGB(converter.keyword.rgb(input.toLowerCase()));
        }
      }
    }
  } else {
    // color(red, green, blue)
    update = {
      red,
      green,
      blue
    };
  }

  return update;
};

function isPercentString(input) {
  return typeof input === "string" && input.endsWith("%");
}

RGB.prototype.strobe = RGB.prototype.blink;



/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  RGB.Controllers = Controllers;
  RGB.purge = () => {
    priv.clear();
  };
}

module.exports = RGB;
