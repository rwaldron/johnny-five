var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Board = require("../board");
var Expander = require("../expander");
var Animation = require("../animation");
var Pins = Board.Pins;

var priv = new Map();

var Controllers = {
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

        this.pin = typeof opts.pin === "undefined" ? 0 : opts.pin;

        this.pin = state.expander.normalize(opts.pin);

        state.mode = this.io.MODES.PWM;
      }
    },
    write: {
      writable: true,
      value: function() {
        var state = priv.get(this);
        var value = state.isAnode ? 255 - Board.constrain(state.value, 0, 255) : state.value;
        state.expander.analogWrite(this.pin, value);
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
          this.pin = pinValue;
          state.mode = this.io.MODES.OUTPUT;
        } else {
          this.pin = typeof opts.pin === "undefined" ? defaultLed : opts.pin;
          state.mode = this.io.MODES[
            (this.board.pins.isPwm(this.pin) ? "PWM" : "OUTPUT")
          ];
        }

        this.io.pinMode(this.pin, state.mode);
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
  if (!(this instanceof Led)) {
    return new Led(opts);
  }

  var state;
  var controller;
  var pinValue = typeof opts === "object" ? opts.pin : opts;

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

  state = {
    isOn: false,
    isRunning: false,
    value: null,
    direction: 1,
    mode: null,
    isAnode: opts.isAnode,
    interval: null
  };

  priv.set(this, state);

  Object.defineProperties(this, {
    value: {
      get: function() {
        return state.value;
      }
    },
    mode: {
      get: function() {
        return state.mode;
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
    },
    animation: {
      get: function() {
        return state.animation;
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
    if (!state.interval) {
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
 * Animation.normalize
 *
 * @param [number || object] keyFrames An array of step values or a keyFrame objects
 */

Led.prototype[Animation.normalize] = function(keyFrames) {

  var state = priv.get(this);
  var last = state.value || 0;

  // If user passes null as the first element in keyFrames use current value
  if (keyFrames[0] === null) {
    keyFrames[0] = {
      value: last
    };
  }

  keyFrames.forEach(function(keyFrame, i) {

    if (keyFrame !== null) {
      // keyFrames that are just numbers represent values
      if (typeof keyFrame === "number") {
        keyFrames[i] = {
          value: keyFrame,
          easing: "linear"
        };
      }
    }

  });

  return keyFrames;

};

/**
 * Animation.render
 *
 * @position [number] value to set the led to
 */

Led.prototype[Animation.render] = function(position) {
  var state = priv.get(this);
  state.value = position[0];
  return this.write();
};

/**
 * pulse Fade the Led in and out in a loop with specified time
 * @param  {number} rate Time in ms that a fade in/out will elapse
 * @return {Led}
 *
 * - or -
 *
 * @param  {Object} val An Animation() segment config object
 */

Led.prototype.pulse = function(rate, callback) {
  var state = priv.get(this);

  this.stop();

  var options = {
    duration: typeof rate === "number" ? rate : 1000,
    keyFrames: [0, 0xff],
    metronomic: true,
    loop: true,
    easing: "inOutSine",
    onloop: function() {
      if (typeof callback === "function") {
        callback();
      }
    }
  };

  if (typeof rate === "object") {
    Object.assign(options, rate);
  }

  if (typeof rate === "function") {
    callback = rate;
  }

  state.isRunning = true;

  state.animation = state.animation || new Animation(this);
  state.animation.enqueue(options);
  return this;
};

/**
 * fade Fade an led in and out
 * @param  {Number} val  Analog brightness value 0-255
 * @param  {Number} time Time in ms that a fade in/out will elapse
 * @return {Led}
 *
 * - or -
 *
 * @param  {Object} val An Animation() segment config object
 */

Led.prototype.fade = function(val, time, callback) {

  var state = priv.get(this);

  this.stop();

  var options = {
    duration: typeof time === "number" ? time : 1000,
    keyFrames: [null, typeof val === "number" ? val : 0xff],
    easing: "outSine",
    oncomplete: function() {
      state.isRunning = false;
      if (typeof callback === "function") {
        callback();
      }
    }
  };

  if (typeof val === "object") {
    Object.assign(options, val);
  }

  if (typeof val === "function") {
    callback = val;
  }

  if (typeof time === "function") {
    callback = time;
  }

  state.isRunning = true;

  state.animation = state.animation || new Animation(this);
  state.animation.enqueue(options);

  return this;
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
  var state = priv.get(this);

  // Avoid traffic jams
  this.stop();

  if (typeof rate === "function") {
    callback = rate;
    rate = null;
  }

  state.isRunning = true;

  state.interval = setInterval(function() {
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

  if (state.interval) {
    clearInterval(state.interval);
  }

  if (state.animation) {
    state.animation.stop();
  }

  state.isRunning = false;

  return this;
};

if (IS_TEST_MODE) {
  Led.purge = function() {
    priv.clear();
  };
}


module.exports = Led;
