const Board = require("../board");
const Animation = require("../animation");
const Expander = require("../expander");
const { constrain, map, scale } = require("../fn");
const Pins = Board.Pins;
const priv = new Map();

const Controllers = {
  PCA9685: {
    initialize: {
      value({address, pwmRange, frequency, pin}) {

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

        this.pin = state.expander.normalize(pin);

        state.mode = this.io.MODES.PWM;
      }
    },
    update: {
      writable: true,
      value(input) {
        const state = priv.get(this);
        const output = typeof input !== "undefined" ? input : state.value;
        const value = state.isAnode ? 255 - Board.constrain(output, 0, 255) : output;
        this.write(value);
      }
    },
    write: {
      writable: true,
      value(value) {
        const state = priv.get(this);
        state.expander.analogWrite(this.pin, value);
      }
    }
  },
  DEFAULT: {
    initialize: {
      value({pin}, pinValue) {

        const state = priv.get(this);
        const isFirmata = Pins.isFirmata(this);
        let defaultLed;

        if (isFirmata && typeof pinValue === "string" &&
            (pinValue.length > 1 && pinValue[0] === "A")) {
          pinValue = this.io.analogPins[+pinValue.slice(1)];
        }

        defaultLed = this.io.defaultLed || 13;
        pinValue = +pinValue;

        if (isFirmata && this.io.analogPins.includes(pinValue)) {
          this.pin = pinValue;
          state.mode = this.io.MODES.OUTPUT;
        } else {
          this.pin = typeof pin === "undefined" ? defaultLed : pin;
          state.mode = this.io.MODES[
            (this.board.pins.isPwm(this.pin) ? "PWM" : "OUTPUT")
          ];
        }

        this.io.pinMode(this.pin, state.mode);
      }
    },
    update: {
      writable: true,
      value(input) {
        const state = priv.get(this);
        const output = typeof input !== "undefined" ? input : state.value;
        let value = state.isAnode ? 255 - Board.constrain(output, 0, 255) : output;
        value = map(value, 0, 255, 0, this.board.RESOLUTION.PWM);

        // If pin is not a PWM pin and brightness is not HIGH or LOW, emit an error
        if (value !== this.io.LOW && value !== this.io.HIGH && this.mode !== this.io.MODES.PWM) {
          Board.Pins.Error({
            pin: this.pin,
            type: "PWM",
            via: "Led"
          });
        }

        if (state.mode === this.io.MODES.OUTPUT) {
          value = output;
        }

        this.write(value);
      }
    },
    write: {
      writable: true,
      value(value) {
        const state = priv.get(this);

        if (state.mode === this.io.MODES.OUTPUT) {
          this.io.digitalWrite(this.pin, value);
        }

        if (state.mode === this.io.MODES.PWM) {
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

class Led {
  constructor(options) {
    const pinValue = typeof options === "object" ? options.pin : options;

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(
      this, Controllers, options
    );

    const state = {
      isAnode: options.isAnode,
      isOn: false,
      isRunning: false,
      value: null,
      direction: 1,
      mode: null,
      intensity: 0,
      interval: null
    };

    priv.set(this, state);

    Object.defineProperties(this, {
      value: {
        get() {
          return state.value;
        }
      },
      mode: {
        get() {
          return state.mode;
        }
      },
      isOn: {
        get() {
          return !!state.value;
        }
      },
      isRunning: {
        get() {
          return state.isRunning;
        }
      },
      animation: {
        get() {
          return state.animation;
        }
      }
    });

    /* istanbul ignore else */
    if (typeof this.initialize === "function") {
      this.initialize(options, pinValue);
    }
  }

  /**
   * on Turn the led on
   * @return {Led}
   */

  on() {
    const state = priv.get(this);

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

    this.update();

    return this;
  }

  /**
   * off  Turn the led off
   * @return {Led}
   */
  off() {
    const state = priv.get(this);

    state.value = 0;

    this.update();

    return this;
  }

  /**
   * toggle Toggle the on/off state of an led
   * @return {Led}
   */
  toggle() {
    return this[this.isOn ? "off" : "on"]();
  }

  /**
   * brightness
   * @param  {Number} value analog brightness value 0-255
   * @return {Led}
   */
  brightness(brightness) {
    const state = priv.get(this);
    state.value = brightness;

    this.update();

    return this;
  }

  /**
   * intensity
   * @param  {Number} value Light intensity 0-100
   * @return {Led}
   */
  intensity(intensity) {
    const state = priv.get(this);

    if (arguments.length === 0) {
      return state.intensity;
    }

    state.intensity = constrain(intensity, 0, 100);

    return this.brightness(scale(state.intensity, 0, 100, 0, 255));
  }

  /**
   * Animation.normalize
   *
   * @param [number || object] keyFrames An array of step values or a keyFrame objects
   */

  [Animation.normalize](keyFrames) {
    const state = priv.get(this);

    // If user passes null as the first element in keyFrames use current value
    /* istanbul ignore else */
    if (keyFrames[0] === null) {
      keyFrames[0] = {
        value: state.value || 0
      };
    }

    return keyFrames.map(frame => {
      const value = frame;
      /* istanbul ignore else */
      if (frame !== null) {
        // frames that are just numbers represent values
        if (typeof frame === "number") {
          frame = {
            value,
          };
        } else {
          if (typeof frame.brightness === "number") {
            frame.value = frame.brightness;
            delete frame.brightness;
          }
          if (typeof frame.intensity === "number") {
            frame.value = scale(frame.intensity, 0, 100, 0, 255);
            delete frame.intensity;
          }
        }

        /* istanbul ignore else */
        if (!frame.easing) {
          frame.easing = "linear";
        }
      }
      return frame;
    });
  }

  /**
   * Animation.render
   *
   * @position [number] value to set the led to
   */

  [Animation.render](position) {
    const state = priv.get(this);
    state.value = position[0];
    return this.update();
  }

  /**
   * pulse Fade the Led in and out in a loop with specified time
   * @param  {number} duration Time in ms that a fade in/out will elapse
   * @return {Led}
   *
   * - or -
   *
   * @param  {Object} val An Animation() segment config object
   */

  pulse(duration, callback) {
    const state = priv.get(this);

    this.stop();

    const options = {
      duration: typeof duration === "number" ? duration : 1000,
      keyFrames: [0, 0xff],
      metronomic: true,
      loop: true,
      easing: "inOutSine",
      onloop() {
        /* istanbul ignore else */
        if (typeof callback === "function") {
          callback();
        }
      }
    };

    if (typeof duration === "object") {
      Object.assign(options, duration);
    }

    if (typeof duration === "function") {
      callback = duration;
    }

    state.isRunning = true;

    state.animation = state.animation || new Animation(this);
    state.animation.enqueue(options);
    return this;
  }

  /**
   * fade Fade an led in and out
   * @param  {Number} val  Analog brightness value 0-255
   * @param  {Number} duration Time in ms that a fade in/out will elapse
   * @return {Led}
   *
   * - or -
   *
   * @param  {Object} val An Animation() segment config object
   */

  fade(val, duration, callback) {

    const state = priv.get(this);

    this.stop();

    const options = {
      duration: typeof duration === "number" ? duration : 1000,
      keyFrames: [null, typeof val === "number" ? val : 0xff],
      easing: "outSine",
      oncomplete() {
        state.isRunning = false;
        /* istanbul ignore else */
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

    if (typeof duration === "object") {
      Object.assign(options, duration);
    }

    if (typeof duration === "function") {
      callback = duration;
    }

    state.isRunning = true;

    state.animation = state.animation || new Animation(this);
    state.animation.enqueue(options);

    return this;
  }

  fadeIn(duration, callback) {
    return this.fade(255, duration || 1000, callback);
  }

  fadeOut(duration, callback) {
    return this.fade(0, duration || 1000, callback);
  }

  /**
   * blink
   * @param  {Number} duration Time in ms on, time in ms off
   * @return {Led}
   */
  blink(duration, callback) {
    const state = priv.get(this);

    // Avoid traffic jams
    this.stop();

    if (typeof duration === "function") {
      callback = duration;
      duration = null;
    }

    state.isRunning = true;

    state.interval = setInterval(() => {
      this.toggle();
      if (typeof callback === "function") {
        callback();
      }
    }, duration || 100);

    return this;
  }


  /**
   * stop Stop the led from strobing, pulsing or fading
   * @return {Led}
   */
  stop() {
    const state = priv.get(this);

    if (state.interval) {
      clearInterval(state.interval);
    }

    if (state.animation) {
      state.animation.stop();
    }

    state.interval = null;
    state.isRunning = false;

    return this;
  }
}

Led.prototype.strobe = Led.prototype.blink;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Led.Controllers = Controllers;
  Led.purge = function() {
    priv.clear();
  };
}


module.exports = Led;
