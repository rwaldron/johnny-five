var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Board = require("../board");
var Animation = require("../animation");
var Expander = require("../expander");
var Fn = require("../fn");
var converter = require("color-convert");

var priv = new Map();

var Controllers = {
  DEFAULT: {
    initialize: {
      value: function(opts) {
        RGB.colors.forEach(function(color, index) {
          var pin = opts.pins[index];

          if (opts.debug && !this.board.pins.isPwm(pin)) {
            Board.Pins.Error({
              pin: pin,
              type: "PWM",
              via: "Led.RGB"
            });
          }

          this.io.pinMode(pin, this.io.MODES.PWM);
          this.pins[index] = pin;
        }, this);
      }
    },
    write: {
      writable: true,
      value: function(colors) {
        var state = priv.get(this);

        RGB.colors.forEach(function(color, index) {
          var pin = this.pins[index];
          var value = colors[color];

          if (state.isAnode) {
            value = 255 - Board.constrain(value, 0, 255);
          }

          this.io.analogWrite(pin, value);
        }, this);
      }
    }
  },
  PCA9685: {
    initialize: {
      value: function(opts) {

        var state = priv.get(this);

        this.address = opts.address || 0x40;
        this.pwmRange = opts.pwmRange || [0, 4095];
        this.frequency = opts.frequency || 200;

        state.expander = Expander.get({
          address: this.address,
          controller: this.controller,
          bus: this.bus,
          pwmRange: this.pwmRange,
          frequency: this.frequency,
        });

        RGB.colors.forEach(function(color, index) {
          this.pins[index] = state.expander.normalize(opts.pins[index]);
          state.expander.analogWrite(this.pins[index], 0);
        }, this);
      }
    },
    write: {
      writable: true,
      value: function(colors) {
        var state = priv.get(this);

        RGB.colors.forEach(function(color, index) {
          var pin = this.pins[index];
          var value = colors[color];

          if (state.isAnode) {
            value = 255 - Board.constrain(value, 0, 255);
          }

          state.expander.analogWrite(pin, value);

        }, this);
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
      value: function(opts) {
        this.address = opts.address || 0x09;

        // Ensure that this is passed on to i2cConfig
        opts.address = this.address;

        /* istanbul ignore else */
        if (!this.board.Drivers[this.address]) {
          this.io.i2cConfig(opts);
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
      value: function(colors) {
        this.io.i2cWrite(this.address, [this.REGISTER.GO_TO_RGB_COLOR_NOW, colors.red, colors.green, colors.blue]);
      }
    }
  }
};

Controllers.ESPLORA = {
  initialize: {
    value: function(opts) {
      opts.pins = [5, 10, 9];
      this.pins = [];
      Controllers.DEFAULT.initialize.value.call(this, opts);
    }
  },
  write: Controllers.DEFAULT.write
};

/**
 * RGB
 * @constructor
 *
 * @param {Object} opts [description]
 * @alias Led.RGB
 */
function RGB(opts) {
  if (!(this instanceof RGB)) {
    return new RGB(opts);
  }

  var state;
  var controller;

  if (Array.isArray(opts)) {
    // RGB([Byte, Byte, Byte]) shorthand
    // Convert to opts.pins array definition
    opts = {
      pins: opts
    };
    // If opts.pins is an object, convert to array
  } else if (typeof opts.pins === "object" && !Array.isArray(opts.pins)) {
    opts.pins = [opts.pins.red, opts.pins.green, opts.pins.blue];
  }

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    controller = Controllers.DEFAULT;
  }

  Object.defineProperties(this, controller);

  // The default color is #ffffff, but the light will be off
  state = {
    red: 255,
    green: 255,
    blue: 255,
    intensity: 100,
    isAnode: opts.isAnode || false,
    interval: null
  };

  // red, green, and blue store the raw color set via .color()
  // values takes state into account, such as on/off and intensity
  state.values = {
    red: state.red,
    green: state.green,
    blue: state.blue
  };

  priv.set(this, state);

  Object.defineProperties(this, {
    isOn: {
      get: function() {
        return RGB.colors.some(function(color) {
          return state[color] > 0;
        });
      }
    },
    isRunning: {
      get: function() {
        return !!state.interval;
      }
    },
    isAnode: {
      get: function() {
        return state.isAnode;
      }
    },
    values: {
      get: function() {
        return Object.assign({}, state.values);
      }
    },
    update: {
      value: function(colors) {
        var state = priv.get(this);

        colors = colors || this.color();

        state.values = RGB.ToScaledRGB(state.intensity, colors);

        this.write(state.values);

        Object.assign(state, colors);
      }
    }
  });

  this.initialize(opts);
  this.off();
}

RGB.colors = ["red", "green", "blue"];


RGB.ToScaledRGB = function(intensity, colors) {
  var scale = intensity / 100;

  return RGB.colors.reduce(function(current, color) {
    return (current[color] = Math.round(colors[color] * scale), current);
  }, {});
};

RGB.ToRGB = function(red, green, blue) {
  var update = {};
  var flags = 0;
  var input;

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
      throw new Error("Invalid color (" + input + ")");
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
      if (input.match(/^#?[0-9A-Fa-f]{6}$/)) {

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
        // color name
        return RGB.ToRGB(converter.keyword.rgb(input.toLowerCase()));
      }
    }
  } else {
    // color(red, green, blue)
    update = {
      red: red,
      green: green,
      blue: blue
    };
  }

  return update;
};
/**
 * color
 *
 * @param  {String} color Hexadecimal color string or CSS color name
 * @param  {Array} color Array of color values
 * @param  {Object} color object {red, green, blue}
 *
 * @return {RGB}
 */
RGB.prototype.color = function(red, green, blue) {
  var state = priv.get(this);
  var colors;

  if (arguments.length === 0) {
    // Return a copy of the state values,
    // not a reference to the state object itself.
    colors = this.isOn ? state : state.prev;
    return RGB.colors.reduce(function(current, color) {
      return (current[color] = Math.round(colors[color]), current);
    }, {});
  }

  var update = RGB.ToRGB(red, green, blue);

  // Validate all color values before writing any values
  RGB.colors.forEach(function(color) {
    var value = update[color];

    if (value == null) {
      throw new Error("Led.RGB.color: invalid color ([" + [update.red, update.green, update.blue].join(",") + "])");
    }

    value = Fn.constrain(value, 0, 255);
    update[color] = value;
  }, this);

  this.update(update);

  return this;
};

RGB.prototype.on = function() {
  var state = priv.get(this);
  var colors;

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
};

RGB.prototype.off = function() {
  var state = priv.get(this);

  // If it's already off, do nothing so the pervious state stays intact
  /* istanbul ignore else */
  if (this.isOn) {
    state.prev = RGB.colors.reduce(function(current, color) {
      return (current[color] = state[color], current);
    }.bind(this), {});

    this.update({
      red: 0,
      green: 0,
      blue: 0
    });
  }

  return this;
};

/**
 * blink
 * @param  {Number} duration Time in ms on, time in ms off
 * @return {RGB}
 */
RGB.prototype.blink = function(duration, callback) {
  var state = priv.get(this);

  // Avoid traffic jams
  this.stop();

  if (typeof duration === "function") {
    callback = duration;
    duration = null;
  }

  state.interval = setInterval(function() {
    this.toggle();
    if (typeof callback === "function") {
      callback();
    }
  }.bind(this), duration || 100);

  return this;
};

RGB.prototype.strobe = RGB.prototype.blink;

RGB.prototype.toggle = function() {
  return this[this.isOn ? "off" : "on"]();
};

RGB.prototype.stop = function() {
  var state = priv.get(this);

  if (state.interval) {
    clearInterval(state.interval);
  }

  /* istanbul ignore if */
  if (state.animation) {
    state.animation.stop();
  }

  state.interval = null;

  return this;
};

RGB.prototype.intensity = function(intensity) {
  var state = priv.get(this);

  if (arguments.length === 0) {
    return state.intensity;
  }

  state.intensity = Fn.constrain(intensity, 0, 100);

  this.update();

  return this;
};

/**
 * Animation.normalize
 *
 * @param [number || object] keyFrames An array of step values or a keyFrame objects
 */

RGB.prototype[Animation.normalize] = function(keyFrames) {
  var state = priv.get(this);

  // If user passes null as the first element in keyFrames use current value
  if (keyFrames[0] === null) {
    keyFrames[0] = state.values;
  }

  return keyFrames.reduce(function(accum, frame) {
    var normalized = {};
    var value = frame;
    var color = null;
    var intensity = state.intensity;

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
};

/**
 * Animation.render
 *
 * @color [object] color object
 */

RGB.prototype[Animation.render] = function(frames) {
  return this.color(frames[0]);
};

/**
 * For multi-property animation, must define
 * the keys to use for tween calculation.
 */
RGB.prototype[Animation.keys] = RGB.colors;

/* istanbul ignore else */
if (IS_TEST_MODE) {
  RGB.purge = function() {
    priv.clear();
  };
}


module.exports = RGB;
