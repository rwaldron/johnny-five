const Board = require("./board");
const Expander = require("./expander");
const Pins = Board.Pins;
const Collection = require("./mixins/collection");
const {scale, fscale, constrain} = require("./fn");

const priv = new Map();


const Controllers = {
  PCA9685: {
    initialize: {
      value: function(options) {
        const state = priv.get(this);

        this.address = options.address || 0x40;
        this.pwmRange = options.pwmRange || [1000, 2000];
        this.frequency = options.frequency || 50;

        state.expander = Expander.get({
          address: this.address,
          controller: this.controller,
          bus: this.bus,
          pwmRange: this.pwmRange,
          frequency: this.frequency,
        });

        this.pin = state.expander.normalize(options.pin);
      }
    },
    update: {
      writable: true,
      value: function(us) {
        const state = priv.get(this);
        state.expander.servoWrite(this.pin, us);
      }
    }
  },
  DEFAULT: {
    initialize: {
      value: function(options) {

        // When in debug mode, if pin is not a PWM pin, emit an error
        if (options.debug && !this.board.pins.isServo(this.pin)) {
          Board.Pins.Error({
            pin: this.pin,
            type: "PWM",
            via: "Servo",
          });
        }

        this.io.servoConfig(this.pin, this.pwmRange[0], this.pwmRange[1]);
      }
    },
    update: {
      writable: true,
      value: function(us) {
        this.io.servoWrite(this.pin, us);
      }
    }
  }
};

const FORWARD = "FORWARD";
const FORWARD_REVERSE = "FORWARD_REVERSE";
const FORWARD_BRAKE_REVERSE = "FORWARD_BRAKE_REVERSE";

const Devices = {
  [FORWARD]: {
    device: {
      value: FORWARD
    },
  },
  [FORWARD_REVERSE]: {
    device: {
      value: FORWARD_REVERSE
    },
  },
  [FORWARD_BRAKE_REVERSE]: {
    device: {
      value: FORWARD_BRAKE_REVERSE
    },
  }
};

/**
 * ESC
 * @constructor
 *
 * @param {Object} options Options: pin, range
 * @param {Number} pin  Pin number
 */

class ESC {
  constructor(options) {
    if (!(this instanceof ESC)) {
      return new ESC(options);
    }

    Board.Component.call(
      this, options = Board.Options(options)
    );

    // StandardFirmata on Arduino allows controlling
    // servos from analog pins.
    // If we're currently operating with an Arduino
    // and the user has provided an analog pin name
    // (eg. "A0", "A5" etc.), parse out the numeric
    // value and capture the fully qualified analog
    // pin number.
    let pinValue;

    if (typeof options.controller === "undefined" && Pins.isFirmata(this)) {
      if (typeof pinValue === "string" && (pinValue.length > 1 && pinValue[0] === "A")) {
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

    Object.defineProperties(this, (options.device && Devices[options.device]) || Devices.FORWARD);

    this.pwmRange = options.pwmRange || [1000, 2000];
    this.neutral = options.neutral;

    priv.set(this, {});

    this.initialize(options);

    const [ low, high ] = this.pwmRange;

    if (typeof this.neutral !== "undefined" && this.neutral <= 100) {
      this.neutral = scale(this.neutral, 0, 100, low, high);
    }

    if (typeof this.neutral === "undefined") {
      this.neutral = (low + high) / 2;
    }

    // Enforce pwm range on neutral point
    this.neutral = constrain(this.neutral, low, high);

    if (this.device === FORWARD_REVERSE &&
        this.neutral === low) {
      throw new Error("Bidirectional (FORWARD_REVERSE) speed controllers require a non-zero neutral point");
    }

    if (this.device === FORWARD) {
      this.neutral = low;
    }

    this.throttle(this.neutral);
  }
  /**
   * throttle(percent)
   *
   * Throttle the ESC's speed by setting the 0%.
   *
   * @param  {Percent} throttle
   * @return {ESC} instance
   *
   *
   * throttle(usec)
   *
   * Throttle the ESC's speed by setting the usec pulse.
   *
   * @param  {Integer} throttle usec in range.
   * @return {ESC} instance
   */
  throttle(value) {

    // It's a %, so convert to usec
    if (value > 0 && value <= 100) {
      if (this.device !== "FORWARD") {
        throw new Error("Bidirectional (FORWARD_REVERSE, FORWARD_*_REVERSE) speed controllers require a pulse in usec");
      }
      value = fscale(value, 0, 100, this.pwmRange[0], this.pwmRange[1]);
    }

    this.update(constrain(value, this.pwmRange[0], this.pwmRange[1]));
    return this;
  }

  /**
   * brake Stop the ESC by hitting the brakes ;)
   * @return {Object} instance
   */
  brake() {
    this.update(this.neutral);
    return this;
  }
}

/**
 * new ESC.Collection()
 *
 * Constructs an ESC Collection instance containing ESC instances
 */
class ESCs extends Collection {
  constructor(numsOrObjects) {
    super(numsOrObjects);
  }
  get type() {
    return ESC;
  }
}

Collection.installMethodForwarding(
  ESCs.prototype, ESC.prototype
);

// Assign ESCs Collection class as static "method" of ESC.
ESC.Collection = ESCs;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  ESC.Controllers = Controllers;
  ESC.purge = function() {
    priv.clear();
  };
}

module.exports = ESC;
