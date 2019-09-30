const Board = require("./board");
const Collection = require("./mixins/collection");
const Emitter = require("events");
const EVS = require("./evshield");
const Expander = require("./expander.js");
const Fn = require("./fn");
const Sensor = require("./sensor");
const ShiftRegister = require("./shiftregister");

const priv = new Map();
const registers = new Map();

function registerKey(registerOpts) {
  return ["clock", "data", "latch"].reduce((accum, key) => `${accum}.${registerOpts[key]}`, "");
}

function latch(state, bit, on) {
  return on ? state |= (1 << bit) : state &= ~(1 << bit);
}

function updateShiftRegister(motor, dir) {
  const rKey = registerKey(motor.settings.register);
  const register = registers.get(motor.board)[rKey];
  let latchState = register.value;
  const bits = priv.get(motor).bits;
  const forward = dir !== "reverse";

  // There are two ShiftRegister bits which we need to change based on the
  // direction of the motor.  These will be the pins that control the HBridge
  // on the board.  They will get flipped high/low based on the current flow
  // in the HBridge.
  latchState = latch(latchState, bits.a, forward);
  latchState = latch(latchState, bits.b, !forward);

  if (register.value !== latchState) {
    register.send(latchState);
  }
}

const Controllers = {
  DEFAULT: {},
  ShiftRegister: {
    initialize: {
      value({register, bits}) {
        const rKey = registerKey(register);

        if (!bits || bits.a === undefined || bits.b === undefined) {
          throw new Error("ShiftRegister Motors MUST contain HBRIDGE bits {a, b}");
        }

        priv.get(this).bits = bits;

        if (!registers.has(this.board)) {
          registers.set(this.board, {});
        }

        if (!registers.get(this.board)[rKey]) {
          registers.get(this.board)[rKey] = new ShiftRegister({
            board: this.board,
            pins: register
          });
        }

        this.io.pinMode(this.pins.pwm, this.io.MODES.PWM);
      }
    },
    dir: {
      value(dir) {
        this.stop();

        updateShiftRegister(this, dir.name);

        this.direction = dir;

        process.nextTick(() => this.emit(dir.name));

        return this;
      }
    }
  },
  PCA9685: {
    initialize: {
      value({address, pwmRange, frequency}) {

        const state = priv.get(this);

        this.address = address || 0x40;
        this.pwmRange = pwmRange || [0, 4080];
        this.frequency = frequency || 50;

        state.expander = Expander.get({
          address: this.address,
          controller: this.controller,
          bus: this.bus,
          pwmRange: this.pwmRange,
          frequency: this.frequency,
        });

        Object.keys(this.pins).forEach(pinName => {
          this.pins[pinName] = state.expander.normalize(this.pins[pinName]);
        });
      }
    },
    setPWM: {
      writable: true,
      value(pin, speed) {
        priv.get(this).expander.analogWrite(pin, speed);
      }
    },
    setPin: {
      writable: true,
      value(pin, value) {
        priv.get(this).expander.digitalWrite(pin, value);
      }
    },
  },
  PCA9685_Hybrid: {
    initialize: {
      value({address, pwmRange, frequency}) {

        const state = priv.get(this);

        this.address = address || 0x40;
        this.pwmRange = pwmRange || [0, 4080];
        this.frequency = frequency || 50;

        state.expander = Expander.get({
          address: this.address,
          controller: "PCA9685",
          bus: this.bus,
          pwmRange: this.pwmRange,
          frequency: this.frequency,
        });

        this.pins.pwm = state.expander.normalize(this.pins.pwm);

      }
    },
    setPWM: {
      writable: true,
      value(pin, speed) {
        priv.get(this).expander.analogWrite(pin, speed);
      }
    },
  },
  EVS_EV3: {
    initialize: {
      value(options) {
        const state = priv.get(this);

        state.shield = EVS.shieldPort(options.pin);
        state.ev3 = new EVS(Object.assign(options, {
          io: this.io
        }));

        this.settings.pins = {
          pwm: options.pin,
          dir: options.pin,
        };
      }
    },
    setPWM: {
      value(pin, value) {
        const state = priv.get(this);
        const register = state.shield.motor === EVS.M1 ? EVS.SPEED_M1 : EVS.SPEED_M2;
        let speed = Fn.scale(value, 0, 255, 0, 100) | 0;

        if (value === 0) {
          state.ev3.write(state.shield, EVS.COMMAND, EVS.Motor_Reset);
        } else {
          if (!this.direction.value) {
            speed = -speed;
          }

          const data = [
            // 0-100
            speed,
            // Duration (0 is forever)
            0,
            // Command B
            0,
            // Command A
            EVS.CONTROL_SPEED | EVS.CONTROL_GO
          ];

          state.ev3.write(state.shield, register, data);
        }
      }
    },
    setPin: {
      value(pin, value) {
        this.setPWM(this.pin, value);
      }
    },
    validatePins: {
      value() {
        // Check for required pins
        if (typeof this.settings.pin === "undefined") {
          throw new Error("Pin must be defined");
        }
      }
    }
  },

  GROVE_I2C_MOTOR_DRIVER: {
    REGISTER: {
      value: {
        ADDRESS: 0x0F,
      }
    },
    COMMANDS: {
      value: {
        SET_SPEED: 0x82,
        SET_PWM_FREQUENCY: 0x84,
        SET_DIRECTION: 0xAA,
        NOOP: 0x01,
      }
    },

    initialize: {
      value(options) {
        const state = priv.get(this);
        let shared = priv.get("GROVE_I2C_MOTOR_DRIVER");

        if (!shared) {
          shared = {
            direction: {
              A: 0x01,
              B: 0x01,
            },
            speed: {
              A: 0,
              B: 0,
            }
          };

          priv.set("GROVE_I2C_MOTOR_DRIVER", shared);
        }

        state.shared = shared;
        state.pin = options.pin.toUpperCase();

        this.settings.pins = {
          pwm: options.pin,
          dir: options.pin,
        };

        this.address = options.address || this.REGISTER.ADDRESS;

        options.address = this.address;

        this.io.i2cConfig(options);
      }
    },
    setPWM: {
      value(pin, value) {
        const state = priv.get(this);
        const speed = Board.constrain(value, 0, 255) | 0;

        state.shared.speed[state.pin] = speed;

        this.io.i2cWrite(this.address, [
          this.COMMANDS.SET_SPEED,
          state.shared.speed.A,
          state.shared.speed.B,
        ]);
      }
    },
    setPin: {
      value(pin, value) {
        const state = priv.get(this);

        // DIR_CCW = 0x02
        // DIR_CW  = 0x01
        state.shared.direction[state.pin] = value ? 0x01 : 0x02;

        const a = state.shared.direction.A & 0x03;
        const b = state.shared.direction.B & 0x03;
        const direction = (b << 2) | a;

        this.io.i2cWrite(this.address, [
          this.COMMANDS.SET_DIRECTION,
          direction,
          this.COMMANDS.NOOP,
        ]);
      }
    },
    validatePins: {
      value() {
        // Check for required pins
        if (typeof this.settings.pin === "undefined") {
          throw new Error("Pin must be defined");
        }
      }
    }
  }
};

// Aliases
//
// NXT motors have the exact same control commands as EV3 motors
Controllers.EVS_NXT = Controllers.EVS_EV3;

const Devices = {
  NONDIRECTIONAL: {
    pins: {
      get() {
        if (this.settings.pin) {
          return {
            pwm: this.settings.pin
          };
        } else {
          return this.settings.pins || {};
        }
      }
    },
    dir: {
      writable: true,
      configurable: true,
      value(speed) {
        speed = speed || this.speed();
        return this;
      }
    },
    resume: {
      value() {
        const speed = this.speed();
        this.speed({
          speed
        });
        return this;
      }
    }
  },
  DIRECTIONAL: {
    pins: {
      get() {
        if (Array.isArray(this.settings.pins)) {
          return {
            pwm: this.settings.pins[0],
            dir: this.settings.pins[1]
          };
        } else {
          return this.settings.pins;
        }
      }
    },
    dir: {
      writable: true,
      configurable: true,
      value(dir) {

        this.stop();

        this.setPin(this.pins.dir, dir.value);
        this.direction = dir;

        process.nextTick(() => this.emit(dir.name));

        return this;
      }
    }
  },
  CDIR: {
    pins: {
      get() {
        if (Array.isArray(this.settings.pins)) {
          return {
            pwm: this.settings.pins[0],
            dir: this.settings.pins[1],
            cdir: this.settings.pins[2]
          };
        } else {
          return this.settings.pins;
        }
      }
    },
    dir: {
      value(dir) {

        this.stop();
        this.direction = dir;

        this.setPin(this.pins.cdir, 1 ^ dir.value);
        this.setPin(this.pins.dir, dir.value);

        process.nextTick(() => this.emit(dir.name));

        return this;
      }
    },
    brake: {
      value(duration) {

        this.speed({
          speed: 0,
          saveSpeed: false
        });
        this.setPin(this.pins.dir, 1, 127);
        this.setPin(this.pins.cdir, 1, 128, 127);
        this.speed({
          speed: 255,
          saveSpeed: false,
          braking: true
        });

        process.nextTick(() => this.emit("brake"));

        if (duration) {
          this.board.wait(duration, () => this.stop());
        }

        return this;
      }
    }
  }
};

/**
 * Motor
 * @constructor
 *
 * @param {Object} options Options: pin|pins{pwm, dir[, cdir]}, device, controller, current
 * @param {Number} pin A single pin for basic
 * @param {Array} pins A two or three digit array of pins [pwm, dir]|[pwm, dir, cdir]
 *
 *
 * Initializing "Hobby Motors"
 *
 *    new five.Motor(9);
 *
 * ...is the same as...
 *
 *    new five.Motor({
 *      pin: 9
 *    });
 *
 *
 * Initializing 2 pin, Bi-Directional DC Motors:
 *
 *    new five.Motor([ 3, 12 ]);
 *
 * ...is the same as...
 *
 *    new five.Motor({
 *      pins: [ 3, 12 ]
 *    });
 *
 * ...is the same as...
 *
 *    new five.Motor({
 *      pins: {
 *        pwm: 3,
 *        dir: 12
 *      }
 *    });
 *
 *
 * Initializing 3 pin, I2C PCA9685 Motor Controllers:
 * i.e. The Adafruit Motor Shield V2
 *
 *    new five.Motor({
 *      pins: [ 8, 9, 10 ],
 *      controller: "PCA9685",
 *      address: 0x60
 *    });
 *
 *
 * Initializing 3 pin, Bi-Directional DC Motors:
 *
 *    new five.Motor([ 3, 12, 11 ]);
 *
 * ...is the same as...
 *
 *    new five.Motor({
 *      pins: [ 3, 12, 11 ]
 *    });
 *
 * ...is the same as...
 *
 *    new five.Motor({
 *      pins: {
 *        pwm: 3,
 *        dir: 12,
 *        cdir: 11
 *      }
 *    });
 *
 *
 * Initializing Bi-Directional DC Motors with brake:
 *
 *    new five.Motor({
 *      pins: {
 *        pwm: 3,
 *        dir: 12,
 *        brake: 11
 *      }
 *    });
 *
 *
 * Initializing Bi-Directional DC Motors with current sensing pins:
 * See Sensor.js for details on options
 *
 *    new five.Motor({
 *      pins: [3, 12],
 *      current: {
 *        pin: "A0",
 *        freq: 250,
 *        range: [0, 2000]
 *      }
 *    });
 *
 *
 * Initializing Bi-Directional DC Motors with inverted speed for reverse:
 * Most likely used for non-commercial H-Bridge controllers
 *
 *    new five.Motor({
 *      pins: [3, 12],
 *      invertPWM: true
 *    });
 *
 */

class Motor extends Emitter {
  constructor(options) {
    super();

    var device, controller, state;

    Board.Component.call(
      this, options = Board.Options(options)
    );

    this.settings = options;

    // Derive device based on pins passed
    if (typeof this.settings.device === "undefined") {
      this.settings.device = "DIRECTIONAL";

      if (typeof this.settings.pins === "undefined" && typeof this.settings.register !== "object") {
        this.settings.device = "NONDIRECTIONAL";
      }

      if (this.settings.pins) {
        if (Array.isArray(this.settings.pins)) {
          this.settings.device = ["NONDIRECTIONAL", "DIRECTIONAL", "CDIR"][this.settings.pins.length - 1];
        } else {
          if (typeof this.settings.pins.dir === "undefined") {
            this.settings.device = "NONDIRECTIONAL";
          } else {
            this.settings.device = "DIRECTIONAL";
          }
          if (typeof this.settings.pins.cdir !== "undefined") {
            this.settings.device = "CDIR";
          }
        }
      }
    }

    if (typeof this.settings.controller === "string" &&
        (this.settings.controller.startsWith("EVS") ||
          this.settings.controller.startsWith("GROVE_I2C"))) {
        this.settings.device = "DIRECTIONAL";
    }

    // Allow users to pass in custom device types
    device = typeof this.settings.device === "string" ?
      Devices[this.settings.device] : this.settings.device;

    this.threshold = typeof this.settings.threshold !== "undefined" ?
      this.settings.threshold : 30;

    this.invertPWM = typeof this.settings.invertPWM !== "undefined" ?
      this.settings.invertPWM : false;

    Object.defineProperties(this, device);

    if (this.settings.register) {
      this.settings.controller = "ShiftRegister";
    }

    /**
     * Note: Controller decorates the device. Used for adding
     * special controllers (i.e. PCA9685)
     **/
    if (this.settings.controller) {
      controller = typeof this.settings.controller === "string" ?
        Controllers[this.settings.controller] : this.settings.controller;

      Board.Controller.call(this, Controllers, options);
    }

    // current just wraps a Sensor
    if (this.settings.current) {
      this.settings.current.board = this.board;
      this.current = new Sensor(this.settings.current);
    }

    // Create a "state" entry for privately
    // storing the state of the motor
    state = {
      isOn: false,
      currentSpeed: typeof this.settings.speed !== "undefined" ?
        this.settings.speed : 128,
      braking: false,
      enabled: false
    };

    priv.set(this, state);

    Object.defineProperties(this, {
      // Calculated, read-only motor on/off state
      // true|false
      isOn: {
        get: function() {
          return state.isOn;
        }
      },
      currentSpeed: {
        get: function() {
          return state.currentSpeed;
        }
      },
      braking: {
        get: function() {
          return state.braking;
        }
      },
      enabled: {
        get: function() {
          return state.enabled;
        }
      }
    });

    // We need to store and initialize the state of the dir pin(s)
    this.direction = {
      value: 1
    };

    if (this.initialize) {
      this.initialize(options);
    }

    this.validatePins();
    this.enable();
    this.dir(this.direction);
  }
}

Motor.prototype.initialize = function() {
  this.io.pinMode(this.pins.pwm, this.io.MODES.PWM);

  ["dir", "cdir", "brake", "enable"].forEach(pin => {
    if (typeof this.pins[pin] !== "undefined") {
      this.io.pinMode(this.pins[pin], this.io.MODES.OUTPUT);
    }
  });
};

Motor.prototype.setPin = function(pin, value) {
  this.io.digitalWrite(pin, value);
};

Motor.prototype.setPWM = function(pin, value) {
  this.io.analogWrite(pin, Fn.map(value, 0, 255, 0, this.board.RESOLUTION.PWM));
};

Motor.prototype.speed = function(options) {
  var state = priv.get(this);

  if (typeof options === "undefined") {
    return state.currentSpeed;
  } else {

    if (typeof options === "number") {
      options = {
        speed: options
      };
    }

    options.speed = Board.constrain(options.speed, 0, 255);

    options.saveSpeed = typeof options.saveSpeed !== "undefined" ?
      options.saveSpeed : true;

    if (options.speed < this.threshold) {
      options.speed = 0;
    }

    state.isOn = options.speed === 0 ? false : true;

    if (options.saveSpeed) {
      state.currentSpeed = options.speed;
    }

    if (options.braking) {
      state.braking = true;
    }

    if (this.invertPWM && this.direction.value === 1) {
      options.speed ^= 0xff;
    }

    this.setPWM(this.pins.pwm, options.speed);

    return this;
  }

};

// start a motor - essentially just switch it on like a normal motor
Motor.prototype.start = function(speed) {
  // Send a signal to turn on the motor and run at given speed in whatever
  // direction is currently set.
  if (this.pins.brake && this.braking) {
    this.setPin(this.pins.brake, 0);
  }

  // get current speed if nothing provided.
  speed = typeof speed !== "undefined" ?
    speed : this.speed();

  this.speed({
    speed: speed,
    braking: false
  });

  // "start" event is fired when the motor is started
  if (speed > 0) {
    process.nextTick(() => this.emit("start"));
  }

  return this;
};

Motor.prototype.stop = function() {
  this.speed({
    speed: 0,
    saveSpeed: false
  });
  process.nextTick(() => this.emit("stop"));

  return this;
};

Motor.prototype.brake = function(duration) {
  if (typeof this.pins.brake === "undefined") {
    if (this.board.io.name !== "Mock") {
      console.log("Non-braking motor type");
    }
    this.stop();
  } else {
    this.setPin(this.pins.brake, 1);
    this.setPin(this.pins.dir, 1);
    this.speed({
      speed: 255,
      saveSpeed: false,
      braking: true
    });
    process.nextTick(() => this.emit("brake"));

    if (duration) {
      var motor = this;
      this.board.wait(duration, function() {
        motor.resume();
      });
    }
  }

  return this;
};

Motor.prototype.release = function() {
  this.resume();
  process.nextTick(() => this.emit("release"));

  return this;
};

Motor.prototype.resume = function() {
  var speed = this.speed();
  this.dir(this.direction);
  this.start(speed);

  return this;
};

Motor.prototype.enable = function() {
  var state = priv.get(this);
  if (typeof this.pins.enable !== "undefined" && !state.enabled) {
    this.setPin(this.pins.enable, 1);
    state.enabled = true;
  }
};

Motor.prototype.disable = function() {
  var state = priv.get(this);
  if (typeof this.pins.enable !== "undefined" && state.enabled) {
    this.setPin(this.pins.enable, 0);
    state.enabled = false;
  }
};

// Check for required pins
Motor.prototype.validatePins = function() {

  if (typeof this.pins.pwm === "undefined") {
    throw new Error("PWM pin must be defined");
  }

  if (typeof this.pins.dir === "undefined" && this.settings.device !== "NONDIRECTIONAL") {
    throw new Error("DIR pin must be defined");
  }

  if (this.settings.device === "CDIR" && typeof this.pins.cdir === "undefined") {
    throw new Error("CDIR pin must be defined for three wire motors");
  }
};

[
  /**
   * forward Turn the Motor in its forward direction
   * fwd Turn the Motor in its forward direction
   *
   * @param  {Number} 0-255, 0 is stopped, 255 is fastest
   * @return {Object} this
   */
  {
    name: "forward",
    abbr: "fwd",
    value: 1
  },
  /**
   * reverse Turn the Motor in its reverse direction
   * rev Turn the Motor in its reverse direction
   *
   * @param  {Number} 0-255, 0 is stopped, 255 is fastest
   * @return {Object} this
   */
  {
    name: "reverse",
    abbr: "rev",
    value: 0
  }
].forEach(dir => {
  Motor.prototype[dir.name] = Motor.prototype[dir.abbr] = function(speed) {
    this.dir(dir);
    this.start(speed);
    return this;
  };
});

Motor.SHIELD_CONFIGS = {
  ADAFRUIT_V1: {
    M1: {
      pins: {
        pwm: 11
      },
      register: {
        data: 8,
        clock: 4,
        latch: 12
      },
      bits: {
        a: 2,
        b: 3
      }
    },
    M2: {
      pins: {
        pwm: 3
      },
      register: {
        data: 8,
        clock: 4,
        latch: 12
      },
      bits: {
        a: 1,
        b: 4
      }
    },
    M3: {
      pins: {
        pwm: 6
      },
      register: {
        data: 8,
        clock: 4,
        latch: 12
      },
      bits: {
        a: 5,
        b: 7
      }
    },
    M4: {
      pins: {
        pwm: 5
      },
      register: {
        data: 8,
        clock: 4,
        latch: 12
      },
      bits: {
        a: 0,
        b: 6
      }
    }
  },
  ADAFRUIT_V2: {
    M1: {
      pins: {
        pwm: 8,
        dir: 9,
        cdir: 10
      },
      address: 0x60,
      controller: "PCA9685"
    },
    M2: {
      pins: {
        pwm: 13,
        dir: 12,
        cdir: 11
      },
      address: 0x60,
      controller: "PCA9685"
    },
    M3: {
      pins: {
        pwm: 2,
        dir: 3,
        cdir: 4
      },
      address: 0x60,
      controller: "PCA9685"
    },
    M4: {
      pins: {
        pwm: 7,
        dir: 6,
        cdir: 5
      },
      address: 0x60,
      controller: "PCA9685"
    }
  },
  SEEED_STUDIO: {
    A: {
      pins: {
        pwm: 9,
        dir: 8,
        cdir: 11
      }
    },
    B: {
      pins: {
        pwm: 10,
        dir: 12,
        cdir: 13
      }
    }
  },
  FREETRONICS_HBRIDGE: {
    A: {
      pins: {
        pwm: 6,
        dir: 4,
        cdir: 7
      }
    },
    B: {
      pins: {
        pwm: 5,
        dir: 3,
        cdir: 2
      }
    }
  },
  ARDUINO_MOTOR_SHIELD_R3_1: {
    A: {
      pins: {
        pwm: 3,
        dir: 12
      }
    },
    B: {
      pins: {
        pwm: 11,
        dir: 13
      }
    }
  },
  ARDUINO_MOTOR_SHIELD_R3_2: {
    A: {
      pins: {
        pwm: 3,
        dir: 12,
        brake: 9
      }
    },
    B: {
      pins: {
        pwm: 11,
        dir: 13,
        brake: 8
      }
    }
  },
  ARDUINO_MOTOR_SHIELD_R3_3: {
    A: {
      pins: {
        pwm: 3,
        dir: 12,
        brake: 9,
        current: "A0"
      }
    },
    B: {
      pins: {
        pwm: 11,
        dir: 13,
        brake: 8,
        current: "A1"
      }
    }
  },
  DF_ROBOT: {
    A: {
      pins: {
        pwm: 6,
        dir: 7
      }
    },
    B: {
      pins: {
        pwm: 5,
        dir: 4
      }
    }
  },
  NKC_ELECTRONICS_KIT: {
    A: {
      pins: {
        pwm: 9,
        dir: 12
      }
    },
    B: {
      pins: {
        pwm: 10,
        dir: 13
      }
    }
  },
  RUGGED_CIRCUITS: {
    A: {
      pins: {
        pwm: 3,
        dir: 12
      }
    },
    B: {
      pins: {
        pwm: 11,
        dir: 13
      }
    }
  },
  SPARKFUN_ARDUMOTO: {
    A: {
      pins: {
        pwm: 3,
        dir: 12
      }
    },
    B: {
      pins: {
        pwm: 11,
        dir: 13
      }
    }
  },
  POLOLU_DRV8835_SHIELD: {
    M1: {
      pins: {
        pwm: 9,
        dir: 7
      }
    },
    M2: {
      pins: {
        pwm: 10,
        dir: 8
      }
    }
  },
  POLOLU_VNH5019_SHIELD: {
    M1: {
      pins: {
        pwm: 9,
        dir: 2,
        cdir: 4,
        enable: 6
      }
    },
    M2: {
      pins: {
        pwm: 10,
        dir: 7,
        cdir: 8,
        enable: 12
      }
    }
  },
  MICRO_MAGICIAN_V2: {
    A: {
      pins: {
        pwm: 6,
        dir: 8
      },
      invertPWM: true
    },
    B: {
      pins: {
        pwm: 5,
        dir: 7
      },
      invertPWM: true
    }
  },
  SPARKFUN_LUDUS: {
    A: {
      pins: {
        pwm: 3,
        dir: 4,
        cdir: 5
      }
    },
    B: {
      pins: {
        pwm: 6,
        dir: 7,
        cdir: 8
      }
    }
  },
  SPARKFUN_DUAL_HBRIDGE_EDISON_BLOCK: {
    A: {
      pins: {
        pwm: 20,
        dir: 33,
        cdir: 46,
        enable: 47
      }
    },
    B: {
      pins: {
        pwm: 14,
        dir: 48,
        cdir: 36,
        enable: 47
      }
    }
  },
  PICAR_V: {
    A: {
      controller: "PCA9685_Hybrid",
      pins: {
        pwm: 4,
        dir: "GPIO17"
      }
    },
    B: {
      controller: "PCA9685_Hybrid",
      pins: {
        pwm: 5,
        dir: "GPIO27"
      }
    }
  }
};

/**
 * Motors()
 * new Motors()
 */
class Motors extends Collection {
  constructor(numsOrObjects) {
    super(numsOrObjects);
  }
  get type() {
    return Motor;
  }
}

/*
 * Motors, forward(speed)/fwd(speed)
 *
 * eg. array.forward(speed);

 * Motors, reverse(speed)/rev(speed)
 *
 * eg. array.reverse(speed);

 * Motors, start(speed)
 *
 * eg. array.start(speed);

 * Motors, stop()
 *
 * eg. array.stop();

 * Motors, brake()
 *
 * eg. array.brake();

 * Motors, release()
 *
 * eg. array.release();
 */

Collection.installMethodForwarding(
  Motors.prototype, Motor.prototype
);

Motor.Collection = Motors;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Motor.Controllers = Controllers;
  Motor.purge = function() {
    priv.clear();
    registers.clear();
  };
}

module.exports = Motor;
