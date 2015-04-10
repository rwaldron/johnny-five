var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Board = require("../board.js");
var __ = require("../fn.js");
var nanosleep = require("../sleep.js").nano;
var Pins = Board.Pins;

var priv = new Map();

var Controllers = {
  PCA9685: {
    COMMANDS: {
      value: {
        PCA9685_MODE1: 0x0,
        PCA9685_PRESCALE: 0xFE,
        LED0_ON_L: 0x6
      }
    },
    initialize: {
      value: function(opts) {

        var state = priv.get(this);

        this.address = opts.address || 0x40;
        this.pwmRange = opts.pwmRange || [0, 4095];

        if (!this.board.Drivers[this.address]) {
          this.io.i2cConfig();
          this.board.Drivers[this.address] = {
            initialized: false
          };

          // Reset
          this.io.i2cWrite(this.address, [this.COMMANDS.PCA9685_MODE1, 0x0]);
          // Sleep
          this.io.i2cWrite(this.address, [this.COMMANDS.PCA9685_MODE1, 0x10]);
          // Set prescalar
          this.io.i2cWrite(this.address, [this.COMMANDS.PCA9685_PRESCALE, 0x70]);
          // Wake up
          this.io.i2cWrite(this.address, [this.COMMANDS.PCA9685_MODE1, 0x0]);
          // Wait 5 nanoseconds for restart
          nanosleep(5);
          // Auto-increment
          this.io.i2cWrite(this.address, [this.COMMANDS.PCA9685_MODE1, 0xa1]);

          this.board.Drivers[this.address].initialized = true;

          this.pin = typeof opts.pin === "undefined" ? 0 : opts.pin;

          state.mode = this.io.MODES.PWM;

          Object.defineProperties(this, {
            mode: {
              get: function() {
                return state.mode;
              }
            }
          });
        }
      }
    },
    write: {
      value: function() {

        var on, off;
        var state = priv.get(this);
        var value = state.isAnode ? 255 - Board.constrain(state.value, 0, 255) : state.value;

        on = 0;
        off = this.pwmRange[1] * value / 255;

        this.io.i2cWrite(this.address, [this.COMMANDS.LED0_ON_L + 4 * (this.pin), on, on >> 8, off, off >> 8]);
      }
    }
  },
  DEFAULT: {
    initialize: {
      value: function(opts, pinValue) {

        var state = priv.get(this);
        var isFirmata = true;
        var defaultLed;

        isFirmata = Pins.isFirmata(this);

        if (isFirmata && typeof pinValue === "string" && pinValue[0] === "A") {
          pinValue = this.io.analogPins[+pinValue.slice(1)];
        }

        defaultLed = this.io.defaultLed || 13;
        pinValue = +pinValue;

        if (isFirmata && this.io.analogPins.includes(pinValue)) {
          this.pin = isFirmata ? pinValue : this.pin;
          state.mode = this.io.MODES.OUTPUT;
        } else {
          this.pin = typeof opts.pin === "undefined" ? defaultLed : opts.pin;
          state.mode = this.io.MODES[
            (opts.type && opts.type.toUpperCase()) ||
            (this.board.pins.isPwm(this.pin) ? "PWM" : "OUTPUT")
          ];
        }

        this.io.pinMode(this.pin, state.mode);

        Object.defineProperties(this, {
          mode: {
            get: function() {
              return state.mode;
            }
          }
        });
      }
    },
    write: {
      value: function() {
        var state = priv.get(this);
        var value = state.value;

        // If pin is not a PWM pin and brightness is not HIGH or LOW, emit an error
        if (value !== this.io.LOW && value !== this.io.HIGH && this.mode !== this.io.MODES.PWM) {
          Board.Pins.Error({
            pin: this.pin,
            type: "PWM",
            via: "Led"
          });
        }

        if (state.mode === this.io.MODES.OUTPUT) {
          this.io.digitalWrite(this.pin, value);
        }

        if (state.mode === this.io.MODES.PWM) {
          if (state.isAnode) {
            value = 255 - Board.constrain(value, 0, 255);
          }

          this.io.analogWrite(this.pin, value);
        }
      }
    }
  }
};

/**
 * Led
 * @constructor
 *
 * five.Led(pin);
 *
 * five.Led({
 *   pin: number
 *  });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Led(opts) {
  var pinValue;
  var defaultLed;
  var state;

  if (!(this instanceof Led)) {
    return new Led(opts);
  }

  var controller = null;
  var err = null;

  pinValue = typeof opts === "object" ? opts.pin : opts;

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    controller = Controllers["DEFAULT"];
  }

  Object.defineProperties(this, controller);

  // LED instance properties
  this.interval = null;

  state = {
    isOn: false,
    isRunning: false,
    value: null,
    direction: 1,
    mode: null,
    isAnode: opts.isAnode
  };

  priv.set(this, state);

  Object.defineProperties(this, {
    value: {
      get: function() {
        return state.value;
      }
    },
    isOn: {
      get: function() {
        return !!state.value;
      }
    },
    isRunning: {
      get: function() {
        return state.isRunning;
      }
    }
  });

  if (typeof this.initialize === "function") {
    this.initialize(opts, pinValue);
  }
}

/**
 * on Turn the led on
 * @return {Led}
 */
Led.prototype.on = function() {
  var state = priv.get(this);

  if (state.mode === this.io.MODES.OUTPUT) {
    state.value = this.io.HIGH;
  }

  if (state.mode === this.io.MODES.PWM) {
    // Assume we need to simply turn this all the way on, when:

    // ...state.value is null
    if (state.value === null) {
      state.value = 255;
    }

    // ...there is no active interval
    if (!this.interval) {
      state.value = 255;
    }

    // ...the last value was 0
    if (state.value === 0) {
      state.value = 255;
    }
  }

  this.write();

  return this;
};

/**
 * off  Turn the led off
 * @return {Led}
 */
Led.prototype.off = function() {
  var state = priv.get(this);

  state.value = 0;

  this.write();

  return this;
};

/**
 * toggle Toggle the on/off state of an led
 * @return {Led}
 */
Led.prototype.toggle = function() {
  return this[this.isOn ? "off" : "on"]();
};

/**
 * brightness
 * @param  {Number} value analog brightness value 0-255
 * @return {Led}
 */
Led.prototype.brightness = function(value) {
  var state = priv.get(this);

  state.value = value;

  this.write();

  return this;
};

/**
 * animate Animate the brightness of an led
 * @param {Object} opts {
 *                        step: function to call on each step
 *                        delta: function to calculate each change
 *                        complete: function to call on completion,
 *                        duration: ms duration of animation
 *                        delay: ms interval delay
 *                      }
 * @return {Led}
 */

Led.prototype.animate = function(opts) {
  var state = priv.get(this);
  var start = Date.now();

  // Avoid traffic jams
  if (this.interval) {
    clearInterval(this.interval);
  }

  if (!opts.duration) {
    opts.duration = 1000;
  }

  if (!opts.delta) {
    opts.delta = function(val) {
      return val;
    };
  }
  // TODO: Give opts.step a default

  state.isRunning = true;

  this.interval = setInterval(function() {
    var lapsed = Date.now() - start;
    var progress = lapsed / opts.duration;

    if (progress > 1) {
      progress = 1;
    }

    var delta = opts.delta(progress);

    opts.step(delta);

    if (progress === 1) {
      this.stop();
      if (typeof opts.complete === "function") {
        opts.complete();
      }
    }
  }.bind(this), opts.delay || 10);

  return this;
};

/**
 * pulse Fade the Led in and out in a loop with specified time
 * @param  {number} rate Time in ms that a fade in/out will elapse
 * @return {Led}
 */

Led.prototype.pulse = function(time, callback) {
  var state = priv.get(this);
  var max = 0xff;
  var target = state.value !== 0 ?
    (state.value === max ? 0 : max) : max;
  var direction = target === max ? 1 : -1;
  var update = state.value <= target ? target : (state.value - target);

  if (typeof time === "function") {
    callback = time;
    time = 1000;
  }

  var step = function(delta) {
    var value = (update * delta);

    if (direction === -1) {
      value = value ^ 0xff;
    }

    state.value = value;
    state.direction = direction;

    this.write();

  }.bind(this);

  var complete = function() {
    this.pulse(time, callback);
    if (typeof callback === "function") {
      callback();
    }
  }.bind(this);

  return this.animate({
    duration: time || 1000,
    complete: complete,
    step: step
  });
};

/**
 * fade Fade an led in and out
 * @param  {Number} val  Analog brightness value 0-255
 * @param  {Number} time Time in ms that a fade in/out will elapse
 * @return {Led}
 */

Led.prototype.fade = function(val, time, callback) {
  var state = priv.get(this);
  var difference = val - state.value;
  var direction = difference > 0 ? 1 : -1;
  var previous = state.value || 0;
  var update = val - state.value;

  if (typeof time === "function") {
    callback = time;
    time = 1000;
  }

  var step = function(delta) {
    var value = previous + (update * delta);

    state.value = value;

    this.write();
  }.bind(this);

  var complete = function() {
    if (typeof callback === "function") {
      callback();
    }
  }.bind(this);

  return this.animate({
    duration: time || 1000,
    complete: complete,
    step: step
  });
};

Led.prototype.fadeIn = function(time, callback) {
  return this.fade(255, time || 1000, callback);
};

Led.prototype.fadeOut = function(time, callback) {
  return this.fade(0, time || 1000, callback);
};

/**
 * strobe
 * @param  {Number} rate Time in ms to strobe/blink
 * @return {Led}
 */
Led.prototype.strobe = function(rate, callback) {
  var isHigh = false;
  var state = priv.get(this);

  // Avoid traffic jams
  if (this.interval) {
    clearInterval(this.interval);
  }

  if (typeof rate === "function") {
    callback = rate;
    rate = null;
  }

  state.isRunning = true;

  this.interval = setInterval(function() {
    this.toggle();
    if (typeof callback === "function") {
      callback();
    }
  }.bind(this), rate || 100);

  return this;
};

Led.prototype.blink = Led.prototype.strobe;

/**
 * stop Stop the led from strobing, pulsing or fading
 * @return {Led}
 */
Led.prototype.stop = function() {
  var state = priv.get(this);

  clearInterval(this.interval);

  state.isRunning = false;

  return this;
};

/**
 * Led.Array()
 * new Led.Array()
 *
 * Create an Array-like object instance of Leds
 *
 * @return {Led.Array}
 */
Led.Array = function(numsOrObjects) {
  if (!(this instanceof Led.Array)) {
    return new Led.Array(numsOrObjects);
  }

  var pins = [];

  if (numsOrObjects) {
    while (numsOrObjects.length) {
      var numOrObject = numsOrObjects.shift();
      if (!(numOrObject instanceof Led)) {
        numOrObject = new Led(numOrObject);
      }
      pins.push(numOrObject);
    }
  } else {
    pins = pins.concat(Array.from(priv.keys()));
  }

  this.length = pins.length;

  pins.forEach(function(pin, index) {
    this[index] = pin;
  }, this);
};


/**
 * each Execute callbackFn for each active led instance in an Led.Array
 * @param  {Function} callbackFn
 * @return {Led.Array}
 */
Led.Array.prototype.each = function(callbackFn) {
  var length = this.length;

  for (var i = 0; i < length; i++) {
    callbackFn.call(this[i], this[i], i);
  }

  return this;
};


[

  "on", "off", "toggle", "brightness",
  "fade", "fadeIn", "fadeOut",
  "pulse", "strobe",
  "stop"

].forEach(function(method) {
  // Create Led.Array wrappers for each method listed.
  // This will allow us control over all Led instances
  // simultaneously.
  Led.Array.prototype[method] = function() {
    var length = this.length;

    for (var i = 0; i < length; i++) {
      this[i][method].apply(this[i], arguments);
    }
    return this;
  };
});

Led.Array.prototype.blink = Led.Array.prototype.strobe;

/**
 * Led.RGB
 *
 *
 * @param  {[type]} opts [description]
 * @return {[type]}      [description]
 */
Led.RGB = function(opts) {
  if (!(this instanceof Led.RGB)) {
    return new Led.RGB(opts);
  }

  var color, colors, k, state;

  colors = Led.RGB.colors.slice();
  k = -1;

  // This will normalize an array of pins in [ r, g, b ]
  // order to an object that's shaped like:
  // {
  //   red: r,
  //   green: g,
  //   blue: b
  // }
  if (Array.isArray(opts.pins)) {
    opts.pins = colors.reduce(function(pins, pin, i, list) {
      return (pins[list[i]] = opts.pins[i], pins);
    }, {});
  }

  // Initialize each Led instance
  while (colors.length) {
    color = colors.shift();
    this[color] = new Led({
      pin: opts.pins[color],
      board: opts.board,
      address: opts.address,
      controller: opts.controller,
      isAnode: opts.isAnode
    });
  }

  this.interval = null;

  state = {
    red: 255,
    green: 255,
    blue: 255,
    isAnode: opts.isAnode || false,
    isRunning: false
  };

  priv.set(this, state);

  Object.defineProperties(this, {
    isOn: {
      get: function() {
        return Led.RGB.colors.some(function(color) {
          return this[color].isOn;
        }, this);
      }
    },
    isRunning: {
      get: function() {
        return state.isRunning;
      }
    },
    isAnode: {
      get: function () {
        return state.isAnode;
      }
    },
    values: {
      get: function() {
        return Led.RGB.colors.reduce(function(current, color) {
          return (current[color] = this[color].value, current);
        }.bind(this), {});
      }
    }
  });
};

Led.RGB.colors = ["red", "green", "blue"];

/**
 * color
 *
 * @param  {String} color Hexadecimal color string
 * @param  {Array} color Array of color values
 *
 * @return {Led.RGB}
 */
Led.RGB.prototype.color = function(red, green, blue) {
  var state = priv.get(this);
  var input, update;

  update = {
    red: null,
    green: null,
    blue: null
  };

  if (arguments.length === 0) {
    // Return a "copy" of the state values,
    // not a reference to the state object itself.
    return Led.RGB.colors.reduce(function(current, color) {
      return (current[color] = state[color], current);
    }, {});
  }

  if (arguments.length === 1) {
    input = red;

    if (input === null || input === undefined) {
      throw new Error("Led.RGB.color: invalid color (" + input + ")");
    }

    if (typeof input === "object") {

      if (Array.isArray(input)) {
        // color([Byte, Byte, Byte])
        update.red = input[0];
        update.green = input[1];
        update.blue = input[2];
      } else {
        // colors({
        //   red: Byte,
        //   green: Byte,
        //   blue: Byte
        // });
        update.red = input.red;
        update.green = input.green;
        update.blue = input.blue;
      }
    } else if (typeof input === "string") {
      // color("#ffffff")
      if (input.length === 7 && input[0] === "#") {
        input = input.slice(1);
      }

      if (!input.match(/^[0-9A-Fa-f]{6}$/)) {
        throw new Error("Led.RGB.color: invalid color (#" + input + ")");
      }

      // color("ffffff")
      update.red = parseInt(input.slice(0, 2), 16);
      update.green = parseInt(input.slice(2, 4), 16);
      update.blue = parseInt(input.slice(4, 6), 16);
    }
  } else {
    // color(Byte, Byte, Byte)
    update.red = red;
    update.green = green;
    update.blue = blue;
  }

  Led.RGB.colors.forEach(function(color) {
    var value = update[color];

    // == purposely checking null and undefined
    if (value == null) {
      throw new Error("Led.RGB.color: invalid color ([" + [update.red, update.green, update.blue].join(",") + "])");
    }

    // constrain to [0,255]
    value = Math.min(255, Math.max(0, value));

    state[color] = value;
    this[color].brightness(value);
  }, this);

  return this;
};

Led.RGB.prototype.on = function() {
  var state = priv.get(this);

  // If it's not already on, we turn
  // them on to previous color value
  if (!this.isOn) {
    Led.RGB.colors.forEach(function(color) {
      this[color].brightness(state[color]);
    }, this);
  }

  return this;
};

Led.RGB.prototype.off = function() {
  Led.RGB.colors.forEach(function(color) {
    this[color].off();
  }, this);

  return this;
};

/**
 * strobe
 * @param  {Number} rate Time in ms to strobe/blink
 * @return {Led}
 */
Led.RGB.prototype.strobe = function(rate) {
  var isHigh = false;
  var state = priv.get(this);

  // Avoid traffic jams
  if (this.interval) {
    clearInterval(this.interval);
  }

  state.isRunning = true;

  this.interval = setInterval(function() {
    this.toggle();
  }.bind(this), rate || 100);

  return this;
};

Led.RGB.prototype.blink = Led.RGB.prototype.strobe;
Led.RGB.prototype.toggle = Led.prototype.toggle;
Led.RGB.prototype.stop = Led.prototype.stop;

if (IS_TEST_MODE) {
  Led.purge = function() {
    priv.clear();
  };
}



module.exports = Led;
