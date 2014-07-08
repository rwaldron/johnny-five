var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  Sensor = require("../lib/sensor.js");

var priv = new Map();

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
      value: function() {
        console.log("Non-directional motor type");
        return this;
      }
    },
    brake: {
      value: function() {
        this.speed({speed: 0, saveState: false});
        this.emit("brake", null, new Date());
      }
    },
    release: {
      value: function() {
        this.start();
        this.emit("release", null, new Date());
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
      value: function(motor, speed, dir) {

        speed = speed || this.speed();

        this.stop();

        this.io.digitalWrite(this.pins.dir, dir.value);
        this.direction = dir.value;
        this.start(speed);

        this.emit(dir.name, null, new Date());

        return this;
      }
    },
    brake: {
      value: function(duration) {

        if (typeof this.pins.brake === "undefined") {
          this.stop();
          return this;
        }

        this.io.digitalWrite(this.pins.brake, 1);
        this.io.digitalWrite(this.pins.dir, 1);
        this.speed({speed: 255, saveState: false});
        this.emit("brake", null, new Date());

        if (duration) {
          var motor = this;
          this.board.wait(duration, function() {
            motor.stop();
          });
        }

        return this;
      }
    },
    release: {
      value: function() {

        if (this.pins.brake) {
          this.io.digitalWrite(this.pins.brake, 0);
          this.io.digitalWrite(this.pins.dir, this.direction);

          var speed = this.speed();

          this.speed(speed);
          this.emit("release", null, new Date());
        }

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
      value: function(motor, speed, dir) {

        speed = speed || this.speed();

        this.stop();
        this.direction = dir.value;

        this.io.digitalWrite(this.pins.cdir, 1 ^ dir.value);
        this.io.digitalWrite(this.pins.dir, dir.value);

        this.start(speed);

        this.emit(dir.name, null, new Date());

        return this;
      }
    },
    brake: {
      value: function(duration) {

        this.speed({speed:255, saveState: false});
        this.io.digitalWrite(this.pins.dir, 1);
        this.io.digitalWrite(this.pins.cdir, 1);
        this.emit("brake", null, new Date());

        if (duration) {
          var motor = this;
          this.board.wait(duration, function() {
            motor.stop();
          });
        }

        return this;
      }
    },
    release: {
      value: function() {

        var speed = this.speed();
        this.speed(speed);

        this.io.digitalWrite(this.pins.dir, this.direction);
        this.io.digitalWrite(this.pins.cdir, 1 ^ this.direction);
        this.emit("release", null, new Date());

        return this;
      }
    }
  }
};


/**
 * Motor
 * @constructor
 *
 * @param {Object} opts Options: pin|pins{pwm, dir[, cdir]}, device, interface, current
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

  if (!(this instanceof Motor)) {
    return new Motor(opts);
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, this.opts = Board.Options(opts)
  );

  /* Note: Interface overrides device
   * To the user we present both "device" and "interface"
   * params to map logically to real-world things.
   * "Devices" are motors and "interfaces" are controllers.
   * Here in the the library we are not concerned with
   * this distinction.
   */
  if (this.opts.interface) {
    this.opts.device = this.opts.interface;
  }

  // Derive device based on pins passed
  if (typeof this.opts.device === "undefined") {

    this.opts.device = typeof this.opts.pins === "undefined" ?
      "NONDIRECTIONAL" : "DIRECTIONAL";

    if (this.opts.pins && (this.opts.pins.cdir || this.opts.pins.length > 2)) {
      this.opts.device = "CDIR";
    }

  }

  // Allow users to pass in custom device types
  var device = typeof this.opts.device === "string" ?
    Devices[this.opts.device] : this.opts.device;

  this.threshold = typeof this.opts.threshold !== "undefined" ?
    this.opts.threshold : 30;

  this.invertPWM = typeof this.opts.invertPWM !== "undefined" ?
    this.opts.invertPWM : false;

  // We need to store the state of the dir pin for release()
  this.direction = 0;

  Object.defineProperties(this, device);

  // Set the PWM pin to PWM mode
  this.io.pinMode(this.pins.pwm, this.io.MODES.PWM);

  ["dir", "cdir", "brake"].forEach(function(pin) {
    if (this.pins[pin]) {
      this.io.pinMode(this.pins[pin], this.io.MODES.OUTPUT);
    }
  }, this);

  // current just wraps a Sensor
  if (this.opts.current) {
    this.opts.current.board = this.board;
    this.current = new Sensor(this.opts.current);
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
    }
  });


  // Create a "state" entry for privately
  // storing the state of the motor
  priv.set(this, {
    isOn: false,
    currentSpeed: typeof this.opts.speed !== "undefined" ?
      this.opts.speed : 128
  });

}

util.inherits(Motor, events.EventEmitter);

Motor.prototype.speed = function(opts) {

  if (typeof opts === 'undefined') {
    return this.currentSpeed;
  } else {

    if (typeof opts === 'number') {
      opts = {
        speed: opts
      };
    }

    opts.speed = Board.constrain(opts.speed, 0, 255);

    opts.saveState = typeof opts.saveState !== "undefined" ?
      opts.saveState : true;

    if (opts.speed < this.threshold) {
      opts.speed = 0;
    }

    if (opts.saveState) {
      // Update stored values
      priv.set(this, {
        isOn: opts.speed === 0 ?
          false : true,
        currentSpeed: opts.speed
      });
    }

    if (this.invertPWM && this.direction === 1) {
      opts.speed ^= 0xff;
    }
    this.io.analogWrite(this.pins.pwm, opts.speed);

    return this;
  }

};

// start a motor - essentially just switch it on like a normal motor
Motor.prototype.start = function(speed) {
  // Send a signal to turn on the motor and run at given speed in whatever
  // direction is currently set.

  if (this.pins.brake) {
    this.io.digitalWrite(this.pins.brake, 0);
  }

  // get current speed if nothing provided.
  speed = typeof speed !== 'undefined' ?
    speed : this.speed();

  this.speed(speed);

  // "start" event is fired when the motor is started
  if (speed > 0) {
    this.emit("start", null, new Date());
  }

  return this;
};

Motor.prototype.stop = function() {

  this.speed(0);

  this.release();

  // "stop" event is fired when the motor is stopped
  this.emit("stop", null, new Date());

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
    this.dir(this, speed, dir);
    return this;
  };


  Motor.prototype[dir.name] = Motor.prototype[dir.abbr] = method;
});

module.exports = Motor;

// References
// http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM
