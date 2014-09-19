var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  Sensor = require("../lib/sensor.js");

var priv = new Map();

function nanosleep(ns) {
  var start = process.hrtime();
  while (process.hrtime() < start + ns) {}
}

var Controllers = {
  PCA9685: {
    COMMANDS: {
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
      value: function( pin, off, on) {
        if (typeof on === "undefined") {
          on = 0;
        }
        on *= 16;
        off *= 16;
        this.io.sendI2CWriteRequest(this.opts.address, [ this.COMMANDS.LED0_ON_L + 4 * (pin), on, on>>8, off, off>>8] );
      }
    },
    setPin: {
      value: function( pin, value, duty, phaseShift ) {
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
      value: function(opts) {

        if (!Board.Drivers) {
          Board.Drivers = {};
        }

        if (!Board.Drivers[this.opts.address]) {
          this.io.sendI2CConfig();
          Board.Drivers[this.opts.address] = {
            initialized: false
          };

          this.io.sendI2CWriteRequest(this.opts.address, [this.COMMANDS.PCA9685_MODE1, 0x0] ); // Reset
          this.io.sendI2CWriteRequest(this.opts.address, [this.COMMANDS.PCA9685_MODE1, 0x10] ); // Sleep
          this.io.sendI2CWriteRequest(this.opts.address, [this.COMMANDS.PCA9685_PRESCALE, 0x3] ); // Set prescalar
          this.io.sendI2CWriteRequest(this.opts.address, [this.COMMANDS.PCA9685_MODE1, 0x0] ); // Wake up
          nanosleep(5); // Wait 5 nanoseconds for restart
          this.io.sendI2CWriteRequest(this.opts.address, [this.COMMANDS.PCA9685_MODE1, 0xa1] ); // Auto-increment

          // Reset all PWM values
          for (var i=0; i<16; i++) {
            this.setPWM(i, 0, 0);
          }

          Board.Drivers[this.opts.address] = {
            initialized: true
          };
        }
      }
    }
  }
};

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
      value: function(speed, dir) {
        speed = speed || this.speed();
        return this;
      }
    },
    resume: {
      value: function() {
        var speed = this.speed();
        this.speed({speed: speed});
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
      value: function(speed, dir) {

        speed = speed || this.speed();

        this.stop();

        this.setPin( this.pins.dir, dir.value );
        this.direction = dir;

        this.emit(dir.name, null, new Date());

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

        this.setPin( this.pins.cdir, 1 ^ dir.value );
        this.setPin( this.pins.dir, dir.value );

        this.emit(dir.name, null, new Date());

        return this;
      }
    },
    brake: {
      value: function(duration) {

        this.speed({speed:0, saveSpeed: false});
        this.setPin( this.pins.dir, 1, 127 );
        this.setPin( this.pins.cdir, 1, 128, 127 );
        this.speed({speed:255, saveSpeed: false, braking: true});
        this.emit("brake", null, new Date());

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

  var device, controller;

  if (!(this instanceof Motor)) {
    return new Motor(opts);
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, this.opts = Board.Options(opts)
  );

  // Derive device based on pins passed
  if (typeof this.opts.device === "undefined") {

    this.opts.device = typeof this.opts.pins === "undefined" ?
      "NONDIRECTIONAL" : "DIRECTIONAL";

    if (this.opts.pins && (this.opts.pins.cdir || this.opts.pins.length > 2)) {
      this.opts.device = "CDIR";
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

  if (this.initialize) {
    this.initialize( opts );
  }

  Object.defineProperties(this, {
    // Calculated, read-only motor on/off state
    // true|false
    isOn: {
      get: function() {
        return priv.get(this).isOn;
      }
    },
    currentSpeed: {
      get: function() {
        return priv.get(this).currentSpeed;
      }
    },
    braking: {
      get: function() {
        return priv.get(this).braking;
      }
    }
  });

  // Create a "state" entry for privately
  // storing the state of the motor
  priv.set(this, {
    isOn: false,
    currentSpeed: typeof this.opts.speed !== "undefined" ?
      this.opts.speed : 128,
    braking: false
  });

  // We need to store and initialize the state of the dir pin(s)
  this.direction = { value: 1 };
  this.dir( 0, this.direction);

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
  this.io.digitalWrite( pin, value );
};

Motor.prototype.setPWM = function(pin, value) {
  this.io.analogWrite(pin, value);
};

Motor.prototype.speed = function(opts) {

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

    var state = priv.get(this);

    state.isOn = opts.speed === 0 ? false : true;

    if (opts.saveSpeed) {
      state.currentSpeed = opts.speed;
    }

    if (opts.braking) {
      state.braking = true;
    }

    priv.set(this, state);

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
    this.setPin( this.pins.brake, 0 );
  }

  // get current speed if nothing provided.
  speed = typeof speed !== "undefined" ?
    speed : this.speed();

  this.speed({ speed: speed, braking: false });

  // "start" event is fired when the motor is started
  if (speed > 0) {
    this.emit("start", null, new Date());
  }

  return this;
};

Motor.prototype.stop = function() {
  this.speed({ speed: 0, saveSpeed: false });
  this.emit("stop", null, new Date());

  return this;
};

Motor.prototype.brake = function(duration) {
  if (typeof this.pins.brake === "undefined") {
    if (this.board.io.name !== "Mock") {
      console.log("Non-braking motor type");
    }
    this.stop();
  } else {
    this.setPin( this.pins.brake, 1 );
    this.setPin( this.pins.dir, 1 );
    this.speed({speed: 255, saveSpeed: false, braking: true});
    this.emit("brake", null, new Date());

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
  this.emit("release", null, new Date());

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
    this.start( speed );
    return this;
  };


  Motor.prototype[dir.name] = Motor.prototype[dir.abbr] = method;
});

module.exports = Motor;

// References
// http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM
