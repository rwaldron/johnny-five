const Board = require("./board");
const Fn = require("./fn");
const priv = new Map();
const steppers = new Map();
const TAU = Fn.TAU;

const MAXSTEPPERS = 6; // correlates with MAXSTEPPERS in firmware


class Step {
  constructor(stepper) {
    this.rpm = 180;
    this.direction = -1;
    this.speed = 0;
    this.accel = 0;
    this.decel = 0;

    this.stepper = stepper;
  }

  move(steps, dir, speed, accel, decel, callback) {
    // Restore the param order... (steps, dir => dir, steps)
    this.stepper.io.stepperStep.apply(
      this.stepper.io, [this.stepper.id, dir, steps, speed, accel, decel, callback]
    );
  }
}

Step.PROPERTIES = ["rpm", "direction", "speed", "accel", "decel"];
Step.DEFAULTS = [180, -1, 0, 0, 0];


function MotorPins(pins) {
  let k = 0;
  pins = pins.slice();
  while (pins.length) {
    this[`motor${++k}`] = pins.shift();
  }
}

function isSupported({pins, MODES}) {
  return pins.some(({supportedModes}) => supportedModes.includes(MODES.STEPPER));
}

/**
 * Stepper
 *
 * Class for handling steppers using AdvancedFirmata support for asynchronous stepper control
 *
 *
 * five.Stepper({
 *  type: constant,     // io.STEPPER.TYPE.*
 *  stepsPerRev: number,  // steps to make on revolution of stepper
 *  pins: {
 *    step: number,   // pin attached to step pin on driver (used for type DRIVER)
 *    dir: number,    // pin attached to direction pin on driver (used for type DRIVER)
 *    motor1: number, // (used for type TWO_WIRE and FOUR_WIRE)
 *    motor2: number, // (used for type TWO_WIRE and FOUR_WIRE)
 *    motor3: number, // (used for type FOUR_WIRE)
 *    motor4: number, // (used for type FOUR_WIRE)
 *  }
 * });
 *
 *
 * five.Stepper({
 *  type: five.Stepper.TYPE.DRIVER,
 *  stepsPerRev: number,
 *  pins: {
 *    step: number,
 *    dir: number
 *  }
 * });
 *
 * five.Stepper({
 *  type: five.Stepper.TYPE.DRIVER,
 *  stepsPerRev: number,
 *  pins: [ step, dir ]
 * });
 *
 * five.Stepper({
 *  type: five.Stepper.TYPE.TWO_WIRE,
 *  stepsPerRev: number,
 *  pins: {
 *    motor1: number,
 *    motor2: number
 *  }
 * });
 *
 * five.Stepper({
 *  type: five.Stepper.TYPE.TWO_WIRE,
 *  stepsPerRev: number,
 *  pins: [ motor1, motor2 ]
 * });
 *
 * five.Stepper({
 *  type: five.Stepper.TYPE.FOUR_WIRE,
 *  stepsPerRev: number,
 *  pins: {
 *    motor1: number,
 *    motor2: number,
 *    motor3: number,
 *    motor4: number
 *  }
 * });
 *
 * five.Stepper({
 *  type: five.Stepper.TYPE.FOUR_WIRE,
 *  stepsPerRev: number,
 *  pins: [ motor1, motor2, motor3, motor4 ]
 * });
 *
 *
 * @param {Object} options
 *
 */

class Stepper {
  constructor(options) {
    const params = [];
    let state;

    Board.Component.call(
      this, options = Board.Options(options)
    );

    if (!isSupported(this.io)) {
      throw new Error(
        "Stepper is not supported"
      );
    }

    if (!options.pins) {
      throw new Error(
        "Stepper requires a `pins` object or array"
      );
    }

    if (!options.stepsPerRev) {
      throw new Error(
        "Stepper requires a `stepsPerRev` number value"
      );
    }

    steppers.set(this.board, steppers.get(this.board) || []);
    this.id = steppers.get(this.board).length;

    if (this.id >= MAXSTEPPERS) {
      throw new Error(
        `Stepper cannot exceed max steppers (${MAXSTEPPERS})`
      );
    }

    // Convert an array of pins to the appropriate named pin
    if (Array.isArray(this.pins)) {
      if (this.pins.length === 2) {
        // Using an array of 2 pins requres a TYPE
        // to disambiguate DRIVER and TWO_WIRE
        if (!options.type) {
          throw new Error(
            "Stepper requires a `type` number value (DRIVER, TWO_WIRE)"
          );
        }
      }

      if (options.type === Stepper.TYPE.DRIVER) {
        this.pins = {
          step: this.pins[0],
          dir: this.pins[1]
        };
      } else {
        this.pins = new MotorPins(this.pins);
      }
    }

    // Attempt to guess the type if none is provided
    if (!options.type) {
      if (this.pins.dir) {
        options.type = Stepper.TYPE.DRIVER;
      } else {
        if (this.pins.motor3) {
          options.type = Stepper.TYPE.FOUR_WIRE;
        } else {
          options.type = Stepper.TYPE.TWO_WIRE;
        }
      }
    }


    // Initial Stepper config params (same for all 3 types)
    params.push(this.id, options.type, options.stepsPerRev);


    if (options.type === Stepper.TYPE.DRIVER) {
      if (typeof this.pins.dir === "undefined" ||
          typeof this.pins.step === "undefined") {
        throw new Error(
          "Stepper.TYPE.DRIVER expects: `pins.dir`, `pins.step`"
        );
      }

      params.push(
        this.pins.dir, this.pins.step
      );
    }

    if (options.type === Stepper.TYPE.TWO_WIRE) {
      if (typeof this.pins.motor1 === "undefined" ||
          typeof this.pins.motor2 === "undefined") {
        throw new Error(
          "Stepper.TYPE.TWO_WIRE expects: `pins.motor1`, `pins.motor2`"
        );
      }

      params.push(
        this.pins.motor1, this.pins.motor2
      );
    }

    if (options.type === Stepper.TYPE.FOUR_WIRE) {
      if (typeof this.pins.motor1 === "undefined" ||
          typeof this.pins.motor2 === "undefined" ||
          typeof this.pins.motor3 === "undefined" ||
          typeof this.pins.motor4 === "undefined") {
        throw new Error(
          "Stepper.TYPE.FOUR_WIRE expects: `pins.motor1`, `pins.motor2`, `pins.motor3`, `pins.motor4`"
        );
      }

      params.push(
        this.pins.motor1, this.pins.motor2, this.pins.motor3, this.pins.motor4
      );
    }

    // Iterate the params and set each pin's mode to MODES.STEPPER
    // Params:
    // [deviceNum, type, stepsPerRev, dirOrMotor1Pin, stepOrMotor2Pin, motor3Pin, motor4Pin]
    // The first 3 are required, the remaining 2-4 will be pins
    params.slice(3).forEach((pin) => {
      this.io.pinMode(pin, this.io.MODES.STEPPER);
    });

    this.io.stepperConfig.apply(this.io, params);

    steppers.get(this.board).push(this);

    state = Step.PROPERTIES.reduce((state, key, i) => (state[key] = typeof options[key] !== "undefined" ? options[key] : Step.DEFAULTS[i], state), {
      isRunning: false,
      type: options.type,
      pins: this.pins
    });

    priv.set(this, state);

    Object.defineProperties(this, {
      type: {
        get() {
          return state.type;
        }
      },

      pins: {
        get() {
          return state.pins;
        }
      }
    });
  }

  /**
   * rpm
   *
   * Gets the rpm value or sets the rpm in revs per minute
   * making an internal conversion to speed in `0.01 * rad/s`
   *
   * @param {Number} rpm Revs per minute
   *
   * NOTE: *rpm* is optional, if missing
   * the method will behave like a getter
   *
   * @return {Stepper} this Chainable method when used as a setter
   */
  rpm(rpm) {
    const state = priv.get(this);

    if (typeof rpm === "undefined") {
      return state.rpm;
    }
    state.rpm = rpm;
    state.speed = Math.round(rpm * TAU * 100 / 60);
    return this;
  }

  /**
   * speed
   *
   * Gets the speed value or sets the speed in `0.01 * rad/s`
   * making an internal conversion to rpm
   *
   * @param {Number} speed Speed given in 0.01 * rad/s
   *
   * NOTE: *speed* is optional, if missing
   * the method will behave like a getter
   *
   * @return {Stepper} this Chainable method when used as a setter
   */
  speed(speed) {
    const state = priv.get(this);

    if (typeof speed === "undefined") {
      return state.speed;
    }
    state.speed = speed;
    state.rpm = Math.round(speed / TAU / 100 * 60);
    return this;
  }

  ccw() {
    return this.direction(0);
  }

  cw() {
    return this.direction(1);
  }

  /**
   * step
   *
   * Move stepper motor a number of steps and call the callback on completion
   *
   * @param {Number} stepsOrOpts Steps to move using current settings for speed, accel, etc.
   * @param {Object} stepsOrOpts Options object containing any of the following:
   *    stepsOrOpts = {
   *      steps:
   *      rpm:
   *      speed:
   *      direction:
   *      accel:
   *      decel:
   *    }
   *
   * NOTE: *steps* is required.
   *
   * @param {Function} callback function(err, complete)
   */
  step(stepsOrOpts, callback) {
    let steps;
    let step;
    let state;
    let params;
    let isValidStep;

    steps = typeof stepsOrOpts === "object" ?
      (stepsOrOpts.steps || 0) : Math.floor(stepsOrOpts);

    step = new Step(this);

    state = priv.get(this);

    params = [];

    isValidStep = true;

    function failback(error) {
      isValidStep = false;
      if (callback) {
        callback(error);
      }
    }

    params.push(steps);

    if (typeof stepsOrOpts === "object") {
      // If an object of property values has been provided,
      // call the correlating method with the value argument.
      Step.PROPERTIES.forEach((key) => {
        if (typeof stepsOrOpts[key] !== "undefined") {
          this[key](stepsOrOpts[key]);
        }
      });
    }

    if (!state.speed) {
      this.rpm(state.rpm);
      step.speed = this.speed();
    }


    // Ensure that the property params are set in the
    // correct order, but without rpm
    Step.PROPERTIES.slice(1).forEach((key) => {
      params.push(step[key] = this[key]());
    });


    if (steps === 0) {
      failback(
        new Error(
          "Must set a number of steps when calling `step()`"
        )
      );
    }

    if (step.direction < 0) {
      failback(
        new Error(
          "Must set a direction before calling `step()`"
        )
      );
    }

    if (isValidStep) {
      state.isRunning = true;

      params.push(complete => {
        state.isRunning = false;
        callback(null, complete);
      });

      step.move.apply(step, params);
    }

    return this;
  }
}

Object.defineProperties(Stepper, {
  TYPE: {
    value: Object.freeze({
      DRIVER: 1,
      TWO_WIRE: 2,
      FOUR_WIRE: 4
    })
  },
  RUNSTATE: {
    value: Object.freeze({
      STOP: 0,
      ACCEL: 1,
      DECEL: 2,
      RUN: 3
    })
  },
  DIRECTION: {
    value: Object.freeze({
      CCW: 0,
      CW: 1
    })
  }
});

["direction", "accel", "decel"].forEach(prop => {
  Stepper.prototype[prop] = function(value) {
    const state = priv.get(this);

    if (typeof value === "undefined") {
      return state[prop];
    }
    state[prop] = value;
    return this;
  };
});


module.exports = Stepper;
