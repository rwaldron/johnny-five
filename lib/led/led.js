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
    time = null;
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
    duration: time,
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
    time = null;
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
    duration: time,
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

if (IS_TEST_MODE) {
  Led.purge = function() {
    priv.clear();
  };
}


module.exports = Led;
