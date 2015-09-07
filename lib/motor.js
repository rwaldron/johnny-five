var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Board = require("../lib/board");
var EVS = require("../lib/evshield");
var __ = require("../lib/fn");
var events = require("events");
var util = require("util");
var Collection = require("../lib/mixins/collection");
var Sensor = require("../lib/sensor");
var ShiftRegister = require("../lib/shiftregister");
var nanosleep = require("../lib/sleep").nano;

var priv = new Map();
var registers = new Map();

function registerKey(registerOpts) {
  return Object.keys(registerOpts).sort().reduce(function(accum, key) {
    accum = accum + "." + registerOpts[key];
    return accum;
  }, "");
}

function latch(state, bit, on) {
  return on ? state |= (1 << bit) : state &= ~(1 << bit);
}

function updateShiftRegister(motor, dir) {
  var rKey = registerKey(motor.opts.register),
      register = registers.get(motor.board)[rKey],
      latchState = register.value,
      bits = priv.get(motor).bits,
      forward = dir !== "reverse";

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

var Controllers = {
  ShiftRegister: {
    initialize: {
      value: function (opts) {
        var rKey = registerKey(opts.register);

        if (!opts.bits || opts.bits.a === undefined || opts.bits.b === undefined) {
          throw new Error("ShiftRegister Motors MUST contain HBRIDGE bits {a, b}");
        }

        priv.get(this).bits = opts.bits;

        if (!registers.has(this.board)) {
          registers.set(this.board, {});
        }

        if (!registers.get(this.board)[rKey]) {
          registers.get(this.board)[rKey] = new ShiftRegister({
            board: this.board,
            pins: opts.register
          });
        }

        this.io.pinMode(this.pins.pwm, this.io.MODES.PWM);
      }
    },
    dir: {
      value: function(speed, dir) {
        this.stop();

        updateShiftRegister(this, dir.name);

        this.direction = dir;

        process.nextTick(this.emit.bind(this, dir.name));

        return this;
      }
    }
  },
  PCA9685: {
    REGISTER: {
      value: {
        PCA9685_MODE1: 0x0,
        PCA9685_PRESCALE: 0xFE,
        LED0_ON_L: 0x6
      }
    },
    address: {
      get: function() {
        return this.opts.address;
      }
    },
    setPWM: {
      value: function(pin, off, on) {
        if (typeof on === "undefined") {
          on = 0;
        }
        on *= 16;
        off *= 16;
        this.io.i2cWrite(this.opts.address, [this.REGISTER.LED0_ON_L + 4 * (pin), on, on >> 8, off, off >> 8]);
      }
    },
    setPin: {
      value: function(pin, value, duty, phaseShift) {
        var on = 0;

        if (value !== 0) {
          value = 255;
        }

        if (typeof duty !== "undefined") {
          value = duty;
        }

        if (typeof phaseShift !== "undefined") {
          on = phaseShift;
          value = value + on;
        }

        this.setPWM(pin, value, on);

      }
    },
    initialize: {
      value: function() {

        if (!this.board.Drivers[this.opts.address]) {
          this.io.i2cConfig(this.opts);
          this.board.Drivers[this.opts.address] = {
            initialized: false
          };

          // Reset
          this.io.i2cWrite(this.opts.address, [this.REGISTER.PCA9685_MODE1, 0x0]);
          // Sleep
          this.io.i2cWrite(this.opts.address, [this.REGISTER.PCA9685_MODE1, 0x10]);
          // Set prescalar
          this.io.i2cWrite(this.opts.address, [this.REGISTER.PCA9685_PRESCALE, 0x3]);
          // Wake up
          this.io.i2cWrite(this.opts.address, [this.REGISTER.PCA9685_MODE1, 0x0]);
          // Wait 5 nanoseconds for restart
          nanosleep(5);
          // Auto-increment
          this.io.i2cWrite(this.opts.address, [this.REGISTER.PCA9685_MODE1, 0xa1]);

          // Reset all PWM values
          for (var i = 0; i < 16; i++) {
            this.setPWM(i, 0, 0);
          }

          this.board.Drivers[this.opts.address].initialized = true;
        }
      }
    }
  },
  EVS_EV3: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.shield = EVS.shieldPort(opts.pin);
        state.ev3 = new EVS(Object.assign(opts, { io: this.io }));

        this.opts.pins = {
          pwm: opts.pin,
          dir: opts.pin,
        };
      }
    },
    setPWM: {
      value: function(pin, value) {
        var state = priv.get(this);

        var register = state.shield.motor === EVS.M1 ? EVS.SPEED_M1 : EVS.SPEED_M2;
        var speed = __.scale(value, 0, 255, 0, 100) | 0;

        if (value === 0) {
          state.ev3.write(state.shield, EVS.COMMAND, EVS.Motor_Reset);
        } else {
          if (!this.direction.value) {
            speed = -speed;
          }

          var data = [
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
      value: function(pin, value) {
        this.setPWM(this.pin, value);
      }
    },
  },
};

// Aliases
//
// NXT motors have the exact same control commands as EV3 motors
Controllers.EVS_NXT = Controllers.EVS_EV3;

var Devices = {
  NONDIRECTIONAL: {
    pins: {
      get: function() {
        return {
          pwm: this.opts.pin
        };
      }
    },
    dir: {
      value: function(speed) {
        speed = speed || this.speed();
        return this;
      }
    },
    resume: {
      value: function() {
        var speed = this.speed();
        this.speed({
          speed: speed
        });
        return this;
      }
    }
  },
  DIRECTIONAL: {
    pins: {
      get: function() {
        if (Array.isArray(this.opts.pins)) {
          return {
            pwm: this.opts.pins[0],
            dir: this.opts.pins[1]
          };
        } else {
          return this.opts.pins;
        }
      }
    },
    dir: {
      configurable: true,
      value: function(speed, dir) {

        speed = speed || this.speed();

        this.stop();

        this.setPin(this.pins.dir, dir.value);
        this.direction = dir;

        process.nextTick(this.emit.bind(this, dir.name));

        return this;
      }
    }
  },
  CDIR: {
    pins: {
      get: function() {
        if (Array.isArray(this.opts.pins)) {
          return {
            pwm: this.opts.pins[0],
            dir: this.opts.pins[1],
            cdir: this.opts.pins[2]
          };
        } else {
          return this.opts.pins;
        }
      }
    },
    dir: {
      value: function(speed, dir) {

        if (typeof speed === "undefined") {
          speed = this.speed();
        }

        this.stop();
        this.direction = dir;

        this.setPin(this.pins.cdir, 1 ^ dir.value);
        this.setPin(this.pins.dir, dir.value);

        process.nextTick(this.emit.bind(this, dir.name));

        return this;
      }
    },
    brake: {
      value: function(duration) {

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
        process.nextTick(this.emit.bind(this, "brake"));

        if (duration) {
          var motor = this;
          this.board.wait(duration, function() {
            motor.stop();
          });
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
 * @param {Object} opts Options: pin|pins{pwm, dir[, cdir]}, device, controller, current
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

function Motor(opts) {

  var device, controller, state;

  if (!(this instanceof Motor)) {
    return new Motor(opts);
  }

  Board.Component.call(
    this, this.opts = Board.Options(opts)
  );

  controller = opts.controller || null;

  // Derive device based on pins passed
  if (typeof this.opts.device === "undefined") {

    this.opts.device = (typeof this.opts.pins === "undefined" && typeof this.opts.register !== "object") ?
      "NONDIRECTIONAL" : "DIRECTIONAL";

    if (this.opts.pins && (this.opts.pins.cdir || this.opts.pins.length > 2)) {
      this.opts.device = "CDIR";
    }

    if (typeof controller === "string" && controller.startsWith("EVS")) {
      this.opts.device = "DIRECTIONAL";
    }
  }

  // Allow users to pass in custom device types
  device = typeof this.opts.device === "string" ?
    Devices[this.opts.device] : this.opts.device;

  this.threshold = typeof this.opts.threshold !== "undefined" ?
    this.opts.threshold : 30;

  this.invertPWM = typeof this.opts.invertPWM !== "undefined" ?
    this.opts.invertPWM : false;

  Object.defineProperties(this, device);

  if (this.opts.register) {
    this.opts.controller = "ShiftRegister";
  }

  /**
   * Note: Controller decorates the device. Used for adding
   * special controllers (i.e. PCA9685)
   **/
  if (this.opts.controller) {
    controller = typeof this.opts.controller === "string" ?
      Controllers[this.opts.controller] : this.opts.controller;

    Object.defineProperties(this, controller);
  }

  // current just wraps a Sensor
  if (this.opts.current) {
    this.opts.current.board = this.board;
    this.current = new Sensor(this.opts.current);
  }

  // Create a "state" entry for privately
  // storing the state of the motor
  state = {
    isOn: false,
    currentSpeed: typeof this.opts.speed !== "undefined" ?
      this.opts.speed : 128,
    braking: false
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
    }
  });

  // We need to store and initialize the state of the dir pin(s)
  this.direction = {
    value: 1
  };

  if (this.initialize) {
    this.initialize(opts);
  }

  this.dir(0, this.direction);
}

util.inherits(Motor, events.EventEmitter);

Motor.prototype.initialize = function() {
  this.io.pinMode(this.pins.pwm, this.io.MODES.PWM);

  ["dir", "cdir", "brake"].forEach(function(pin) {
    if (this.pins[pin]) {
      this.io.pinMode(this.pins[pin], this.io.MODES.OUTPUT);
    }
  }, this);

};

Motor.prototype.setPin = function(pin, value) {
  this.io.digitalWrite(pin, value);
};

Motor.prototype.setPWM = function(pin, value) {
  this.io.analogWrite(pin, value);
};

Motor.prototype.speed = function(opts) {
  var state = priv.get(this);

  if (typeof opts === "undefined") {
    return this.currentSpeed;
  } else {

    if (typeof opts === "number") {
      opts = {
        speed: opts
      };
    }

    opts.speed = Board.constrain(opts.speed, 0, 255);

    opts.saveSpeed = typeof opts.saveSpeed !== "undefined" ?
      opts.saveSpeed : true;

    if (opts.speed < this.threshold) {
      opts.speed = 0;
    }

    state.isOn = opts.speed === 0 ? false : true;

    if (opts.saveSpeed) {
      state.currentSpeed = opts.speed;
    }

    if (opts.braking) {
      state.braking = true;
    }

    if (this.invertPWM && this.direction.value === 1) {
      opts.speed ^= 0xff;
    }

    this.setPWM(this.pins.pwm, opts.speed);

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
    process.nextTick(this.emit.bind(this, "start"));
  }

  return this;
};

Motor.prototype.stop = function() {
  this.speed({
    speed: 0,
    saveSpeed: false
  });
  process.nextTick(this.emit.bind(this, "stop"));

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
    process.nextTick(this.emit.bind(this, "brake"));

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
  process.nextTick(this.emit.bind(this, "release"));

  return this;
};

Motor.prototype.resume = function() {
  var speed = this.speed();
  this.dir(speed, this.direction);
  this.start(speed);

  return this;
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
].forEach(function(dir) {
  var method = function(speed) {
    this.dir(speed, dir);
    this.start(speed);
    return this;
  };

  Motor.prototype[dir.name] = Motor.prototype[dir.abbr] = method;
});

Motor.SHIELD_CONFIGS = {
  ADAFRUIT_V1: {
    M1: {
      pins: { pwm: 11 },
      register: { data: 8, clock: 4, latch: 12 },
      bits: { a: 2, b: 3 }
    },
    M2: {
      pins: { pwm: 3 },
      register: { data: 8, clock: 4, latch: 12 },
      bits: { a: 1, b: 4 }
    },
    M3: {
      pins: { pwm: 6 },
      register: { data: 8, clock: 4, latch: 12 },
      bits: { a: 5, b: 7 }
    },
    M4: {
      pins: { pwm: 5 },
      register: { data: 8, clock: 4, latch: 12 },
      bits: { a: 0, b: 6 }
    }
  },
  ADAFRUIT_V2: {
    M1: {
      pins: { pwm: 8, dir: 9, cdir: 10 },
      address: 0x60,
      controller: "PCA9685"
    },
    M2: {
      pins: { pwm: 13, dir: 12, cdir: 11 },
      address: 0x60,
      controller: "PCA9685"
    },
    M3: {
      pins: { pwm: 2, dir: 3, cdir: 4 },
      address: 0x60,
      controller: "PCA9685"
    },
    M4: {
      pins: { pwm: 7, dir: 6, cdir: 5 },
      address: 0x60,
      controller: "PCA9685"
    }
  },
  SEEED_STUDIO: {
    A: {
      pins: { pwm:9, dir:8, cdir: 11 }
    },
    B: {
      pins: { pwm:10, dir:12, cdir: 13 }
    }
  },
  FREETRONICS_HBRIDGE: {
    A: {
      pins: { pwm: 6, dir: 4, cdir: 7 }
    },
    B: {
      pins: { pwm: 5, dir: 3, cdir: 2 }
    }
  },
  ARDUINO_MOTOR_SHIELD_R3_1: {
    A: {
      pins: { pwm: 3, dir: 12 }
    },
    B: {
      pins: { pwm: 11, dir: 13 }
    }
  },
  ARDUINO_MOTOR_SHIELD_R3_2: {
    A: {
      pins: { pwm: 3, dir: 12, brake: 9 }
    },
    B: {
      pins: { pwm: 11, dir: 13, brake: 8 }
    }
  },
  ARDUINO_MOTOR_SHIELD_R3_3: {
    A: {
      pins: { pwm: 3, dir: 12, brake: 9, current: "A0" }
    },
    B: {
      pins: { pwm: 11, dir: 13, brake: 8, current: "A1" }
    }
  },
  DF_ROBOT: {
    A: {
      pins: { pwm: 6, dir: 7 }
    },
    B: {
      pins: { pwm: 5, dir: 4 }
    }
  },
  NKC_ELECTRONICS_KIT: {
    A: {
      pins: { pwm: 9, dir: 12 }
    },
    B: {
      pins: { pwm: 10, dir: 13 }
    }
  },
  RUGGED_CIRCUITS: {
    A: {
      pins: { pwm: 3, dir: 12 }
    },
    B: {
      pins: { pwm: 11, dir: 13 }
    }
  },
  SPARKFUN_ARDUMOTO: {
    A: {
      pins: { pwm: 3, dir: 12 }
    },
    B: {
      pins: { pwm: 11, dir: 13 }
    }
  },
  POLOLU_DRV8835_SHIELD: {
    M1: {
      pins: { pwm: 9, dir: 7 }
    },
    M2: {
      pins: { pwm: 10, dir: 8 }
    }
  },
  MICRO_MAGICIAN_V2: {
    A : {
      pins: { pwm: 6, dir: 8 },
      invertPWM: true
    },
    B: {
      pins: { pwm: 5, dir: 7 },
      invertPWM: true
    }
  },
  SPARKFUN_LUDUS: {
    A: {
      pins: { pwm: 3, dir: 4, cdir: 5 }
    },
    B: {
      pins: { pwm: 6, dir: 7, cdir: 8 }
    }
  },
};


/**
 * Motors()
 * new Motors()
 *
 * Constructs an Array-like instance of all servos
 */
function Motors(numsOrObjects) {
  if (!(this instanceof Motors)) {
    return new Motors(numsOrObjects);
  }

  Object.defineProperty(this, "type", {
    value: Motor
  });

  Collection.call(this, numsOrObjects);
}

Motors.prototype = Object.create(Collection.prototype, {
  constructor: {
    value: Motors
  }
});


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

Object.keys(Motor.prototype).forEach(function(method) {
  // Create Motors wrappers for each method listed.
  // This will allow us control over all Motor instances
  // simultaneously.
  Motors.prototype[method] = function() {
    var length = this.length;

    for (var i = 0; i < length; i++) {
      this[i][method].apply(this[i], arguments);
    }
    return this;
  };
});


if (IS_TEST_MODE) {
  Motor.purge = function() {
    priv.clear();
    registers.clear();
  };
}

// Assign Motors Collection class as static "method" of Motor.
Motor.Array = Motors;

module.exports = Motor;

// References
// http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM
