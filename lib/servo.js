const Board = require("./board");
const Pins = Board.Pins;
const Expander = require("./expander");
const Emitter = require("events");
const Collection = require("./mixins/collection");
const Fn = require("./fn");
const Animation = require("./animation");

// Servo instance private data
const priv = new Map();

const Controllers = {
  PCA9685: {
    initialize: {
      value({address, pwmRange, frequency, pin}) {
        const state = priv.get(this);

        this.address = address || 0x40;
        this.pwmRange = pwmRange || [450, 1850];
        this.frequency = frequency || 50;

        state.expander = Expander.get({
          address: this.address,
          controller: this.controller,
          bus: this.bus,
          pwmRange: this.pwmRange,
          frequency: this.frequency,
        });

        this.pin = state.expander.normalize(pin);
      }
    },
    update: {
      writable: true,
      value(microseconds) {
        const state = priv.get(this);
        state.expander.servoWrite(this.pin, microseconds);
      }
    }
  },
  Standard: {
    initialize: {
      value({debug, pwmRange}) {

        // When in debug mode, if pin is not a PWM pin, emit an error
        if (debug && !this.board.pins.isServo(this.pin)) {
          Board.Pins.Error({
            pin: this.pin,
            type: "PWM",
            via: "Servo",
          });
        }

        if (Array.isArray(pwmRange)) {
          this.io.servoConfig(this.pin, pwmRange[0], pwmRange[1]);
        } else {
          this.io.pinMode(this.pin, this.mode);
        }
      }
    },
    update: {
      writable: true,
      value(degrees) {

        // If same degrees return immediately.
        if (this.last && this.last.degrees === degrees) {
          return this;
        }

        // Map value from degreeRange to pwmRange
        let microseconds = Fn.map(
          degrees,
          this.degreeRange[0], this.degreeRange[1],
          this.pwmRange[0], this.pwmRange[1]
        );

        // Restrict values to integers
        microseconds |= 0;

        this.io.servoWrite(this.pin, microseconds);
      }
    }
  }
};

Controllers.DEFAULT = Controllers.Standard;

/**
 * Servo
 * @constructor
 *
 * @param {Object} opts Options: pin, type, id, range
 */

class Servo extends Emitter {
  constructor(options) {

    super();

    const history = [];
    let pinValue = typeof options === "object" ? options.pin : options;

    Board.Component.call(
      this, options = Board.Options(options)
    );

    this.degreeRange = options.degreeRange || [0, 180];
    this.pwmRange = options.pwmRange || [600, 2400];
    this.range = options.range || this.degreeRange;
    this.deadband = options.deadband || [90, 90];
    this.fps = options.fps || 100;
    this.offset = options.offset || 0;
    this.range = options.range || [0 - this.offset, 180 - this.offset];
    this.mode = this.io.MODES.SERVO;
    this.interval = null;
    this.value = null;
    // The type of servo determines certain alternate
    // behaviours in the API
    this.type = options.type || "standard";

    // Invert the value of all servoWrite operations
    // eg. 80 => 100, 90 => 90, 0 => 180
    if (options.isInverted) {
      console.warn("The 'isInverted' property has been renamed 'invert'");
    }
    this.invert = options.isInverted || options.invert || false;

    // StandardFirmata on Arduino allows controlling
    // servos from analog pins.
    // If we're currently operating with an Arduino
    // and the user has provided an analog pin name
    // (eg. "A0", "A5" etc.), parse out the numeric
    // value and capture the fully qualified analog
    // pin number.
    if (typeof options.controller === "undefined" && Pins.isFirmata(this)) {
      if (typeof pinValue === "string" &&
          (pinValue.length > 1 && pinValue[0] === "A")) {
        pinValue = this.io.analogPins[+pinValue.slice(1)];
      }

      pinValue = +pinValue;

      // If the board's default pin normalization
      // came up with something different, use the
      // the local value.
      if (!Number.isNaN(pinValue) && this.pin !== pinValue) {
        this.pin = pinValue;
      }
    }

    Board.Controller.call(this, Controllers, options);

    priv.set(this, {
      history
    });

    Object.defineProperties(this, {
      history: {
        get() {
          return history.slice(-5);
        }
      },
      last: {
        get() {
          return history[history.length - 1];
        }
      },
      position: {
        get() {
          return history.length ? history[history.length - 1].degrees : -1;
        }
      }
    });

    this.initialize(options);

    // If "startAt" is defined and center is falsy
    // set servo to min or max degrees
    if (typeof options.startAt !== "undefined") {
      this.startAt = options.startAt;
      this.to(options.startAt);
    } else {
      this.startAt = (this.degreeRange[1] - this.degreeRange[0]) / 2 + this.degreeRange[0];
    }

    // If "center" true set servo to 90deg
    if (options.center) {
      this.center();
    }

    if (options.type === "continuous") {
      this.stop();
    }
  }

  /**
   * to
   *
   * Set the servo horn's position to given degree over time.
   *
   * @param  {Number} degrees   Degrees to turn servo to.
   * @param  {Number} time      Time to spend in motion.
   * @param  {Number} rate      The rate of the motion transiton
   *
   * - or -
   *
   * @param {Object} an Animation() segment config object
   *
   * @return {Servo} instance
   */

  to(degrees, time, rate) {

    const state = priv.get(this);
    const options = {};

    if (typeof degrees === "object") {

      Object.assign(options, degrees);

      options.duration = degrees.duration || degrees.interval || 1000;
      options.cuePoints = degrees.cuePoints || [0, 1.0];
      options.keyFrames = degrees.keyFrames || [
        null,
        {
          value: typeof degrees.degrees === "number" ? degrees.degrees : this.startAt
        }
      ];

      options.oncomplete = () => {
        // Enforce async execution for user "oncomplete"
        process.nextTick(() => {
          if (typeof degrees.oncomplete === "function") {
            degrees.oncomplete();
          }
          this.emit("move:complete");
        });
      };


      state.isRunning = true;
      state.animation = state.animation || new Animation(this);
      state.animation.enqueue(options);

    } else {

      const target = degrees;

      // Enforce limited range of motion
      degrees = Fn.constrain(degrees, this.range[0], this.range[1]);

      if (typeof time !== "undefined") {

        options.duration = time;
        options.keyFrames = [null, {
          degrees
        }];
        options.fps = rate || this.fps;

        this.to(options);

      } else {

        this.value = degrees;

        degrees += this.offset;

        if (this.invert) {
          degrees = Fn.map(
            degrees,
            this.degreeRange[0], this.degreeRange[1],
            this.degreeRange[1], this.degreeRange[0]
          );
        }

        this.update(degrees);

        if (state.history.length > 5) {
          state.history.shift();
        }

        state.history.push({
          timestamp: Date.now(),
          degrees,
          target
        });
      }
    }

    // return this instance
    return this;
  }

  /**
   * step
   *
   * Update the servo horn's position by specified degrees (over time)
   *
   * @param  {Number} degrees   Degrees to turn servo to.
   * @param  {Number} time      Time to spend in motion.
   *
   * @return {Servo} instance
   */

  step(degrees, time) {
    return this.to(this.last.target + degrees, time);
  }

  /**
   * move Alias for Servo.prototype.to
   */
  move(degrees, time) {
    console.warn("Servo.prototype.move has been renamed to Servo.prototype.to");

    return this.to(degrees, time);
  }

  /**
   * min Set Servo to minimum degrees, defaults to 0deg
   * @param  {Number} time      Time to spend in motion.
   * @param  {Number} rate      The rate of the motion transiton
   * @return {Object} instance
   */

  min(time, rate) {
    return this.to(this.range[0], time, rate);
  }

  /**
   * max Set Servo to maximum degrees, defaults to 180deg
   * @param  {Number} time      Time to spend in motion.
   * @param  {Number} rate      The rate of the motion transiton
   * @return {[type]} [description]
   */
  max(time, rate) {
    return this.to(this.range[1], time, rate);
  }

  /**
   * center Set Servo to centerpoint, defaults to 90deg
   * @param  {Number} time      Time to spend in motion.
   * @param  {Number} rate      The rate of the motion transiton
   * @return {[type]} [description]
   */
  center(time, rate) {
    return this.to(Math.abs((this.range[0] + this.range[1]) / 2), time, rate);
  }

  /**
   * home Return Servo to startAt position
   */
  home() {
    return this.to(this.startAt);
  }

  /**
   * sweep Sweep the servo between min and max or provided range
   * @param  {Array} range constrain sweep to range
   *
   * @param {Object} options Set range or interval.
   *
   * @return {[type]} [description]
   */
  sweep(opts) {

    const options = {
      keyFrames: [{
        value: this.range[0]
      }, {
        value: this.range[1]
      }],
      metronomic: true,
      loop: true,
      easing: "inOutSine"
    };

    // If opts is an array, then assume a range was passed
    if (Array.isArray(opts)) {
      options.keyFrames = rangeToKeyFrames(opts);
    } else {
      if (typeof opts === "object" && opts !== null) {
        Object.assign(options, opts);
        /* istanbul ignore else */
        if (Array.isArray(options.range)) {
          options.keyFrames = rangeToKeyFrames(options.range);
        }
      }
    }

    return this.to(options);
  }

  /**
   * stop Stop a moving servo
   * @return {[type]} [description]
   */
  stop() {
    const state = priv.get(this);

    if (state.animation) {
      state.animation.stop();
    }

    if (this.type === "continuous") {
      this.to(
        this.deadband.reduce((a, b) => Math.round((a + b) / 2))
      );
    } else {
      clearInterval(this.interval);
    }

    return this;
  }
}


/**
 * Animation.normalize
 *
 * @param [number || object] keyFrames An array of step values or a keyFrame objects
 */

Servo.prototype[Animation.normalize] = function(keyFrames) {

  const last = this.last ? this.last.target : this.startAt;

  // If user passes null as the first element in keyFrames use current position
  if (keyFrames[0] === null) {
    keyFrames[0] = {
      value: last
    };
  }

  // If user passes a step as the first element in keyFrames use current position + step
  if (typeof keyFrames[0] === "number") {
    keyFrames[0] = {
      value: last + keyFrames[0]
    };
  }

  return keyFrames.map(frame => {
    const value = frame;

    /* istanbul ignore else */
    if (frame !== null) {
      // frames that are just numbers represent _step_
      if (typeof frame === "number") {
        frame = {
          step: value,
        };
      } else {
        if (typeof frame.degrees === "number") {
          frame.value = frame.degrees;
          delete frame.degrees;
        }
        if (typeof frame.copyDegrees === "number") {
          frame.copyValue = frame.copyDegrees;
          delete frame.copyDegrees;
        }
      }

      /* istanbul ignore else */
      if (!frame.easing) {
        frame.easing = "linear";
      }
    }
    return frame;
  });
};

/**
 * Animation.render
 *
 * @position [number] value to set the servo to
 */
Servo.prototype[Animation.render] = function(position) {
  return this.to(position[0]);
};

function rangeToKeyFrames(range) {
  return range.map(value => ({
    value
  }));
}

//
["clockWise", "cw", "counterClockwise", "ccw"].forEach(api => {
  Servo.prototype[api] = function(rate) {
    let range;
    rate = rate === undefined ? 1 : rate;
    /* istanbul ignore if */
    if (this.type !== "continuous") {
      this.board.error(
        "Servo",
        `Servo.prototype.${api} is only available for continuous servos`
      );
    }
    if (api === "cw" || api === "clockWise") {
      range = [rate, 0, 1, this.deadband[1] + 1, this.range[1]];
    } else {
      range = [rate, 0, 1, this.deadband[0] - 1, this.range[0]];
    }
    return this.to(Fn.scale.apply(null, range) | 0);
  };
});


// Servo.Continuous = function(pinOrOpts) {
//   const options = {};
//   if (typeof pinOrOpts !== "object") {
//     Object.assign(options, pinOrOpts);
//   } else {
//     options.pin = pinOrOpts;
//   }

//   options.type = "continuous";

//   return new Servo(options);
// };


Servo.Continuous = class extends Servo {
  constructor(pinOrOpts) {
    const options = {};
    if (typeof pinOrOpts === "object") {
      Object.assign(options, pinOrOpts);
    } else {
      options.pin = pinOrOpts;
    }

    options.type = "continuous";

    super(options);
  }
};

/**
 * Servos()
 * new Servos()
 */
class Servos extends Collection {
  constructor(numsOrObjects) {
    super(numsOrObjects);
  }
  get type() {
    return Servo;
  }

  /**
   * Animation.normalize
   *
   * @param [number || object] keyFrames An array of step values or a keyFrame objects
   */
  [Animation.normalize](keyFrameSet) {
    return keyFrameSet.map((keyFrames, index) => {
      if (keyFrames !== null && Array.isArray(keyFrames)) {
        let servo = this[index];

        // If servo is a servoArray then user servo[0] for default values
        if (servo instanceof Servos) {
          servo = servo[0];
        }

        const last = servo.last ? servo.last.target : servo.startAt;

        // If the first keyFrameSet is null use the current position
        if (keyFrames[0] === null) {
          keyFrames[0] = {
            value: last
          };
        }

        if (Array.isArray(keyFrames)) {
          if (keyFrames[0] === null) {
            keyFrameSet[index][0] = {
              value: last
            };
          }
        }
        return this[index][Animation.normalize](keyFrames);
      }

      if (keyFrames && typeof keyFrames.degrees === "number") {
        keyFrames.value = keyFrames.degrees;
        delete keyFrames.degrees;
      }
      return keyFrames;
    });
  }

  /**
   * Animation.render
   *
   * @position [number] array of values to set the servos to
   */
  [Animation.render](position) {
    return this.each((servo, i) => servo.to(position[i]));
  }
}

/*
 * Servos, center()
 *
 * centers all servos to 90deg
 *
 * eg. array.center();

 * Servos, min()
 *
 * set all servos to the minimum degrees
 * defaults to 0
 *
 * eg. array.min();

 * Servos, max()
 *
 * set all servos to the maximum degrees
 * defaults to 180
 *
 * eg. array.max();

 * Servos, stop()
 *
 * stop all servos
 *
 * eg. array.stop();
 */

Collection.installMethodForwarding(
  Servos.prototype, Servo.prototype, {
    skip: [Animation.normalize, Animation.render]
  }
);

// Assign Servos Collection class as static "method" of Servo.
Servo.Collection = Servos;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Servo.Controllers = Controllers;
  Servo.purge = () => {
    priv.clear();
  };
}

module.exports = Servo;
// References
//
// http://www.societyofrobots.com/actuators_servos.shtml
// http://www.parallax.com/Portals/0/Downloads/docs/prod/motors/900-00008-CRServo-v2.2.pdf
// http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM
// http://servocity.com/html/hs-7980th_servo.html
// http://mbed.org/cookbook/Servo

// Further API info:
// http://www.tinkerforge.com/doc/Software/Bricks/Servo_Brick_Python.html#servo-brick-python-api
// http://www.tinkerforge.com/doc/Software/Bricks/Servo_Brick_Java.html#servo-brick-java-api
