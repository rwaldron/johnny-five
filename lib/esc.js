var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Board = require("../lib/board");
var Pins = Board.Pins;
var Emitter = require("events").EventEmitter;
var util = require("util");
var __ = require("./fn");
var nanosleep = require("../lib/sleep.js").nano;

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
        this.address = opts.address || 0x40;
        this.pwmRange = opts.pwmRange || [544, 2400];

        if (!this.board.Drivers[this.address]) {
          this.io.i2cConfig();
          this.board.Drivers[this.address] = {
            initialized: false
          };

          // Reset
          this.io.i2cWriteReg(this.address, this.COMMANDS.PCA9685_MODE1, 0x00);
          // Sleep
          this.io.i2cWriteReg(this.address, this.COMMANDS.PCA9685_MODE1, 0x10);
          // Set prescalar
          this.io.i2cWriteReg(this.address, this.COMMANDS.PCA9685_PRESCALE, 0x70);
          // Wake up
          this.io.i2cWriteReg(this.address, this.COMMANDS.PCA9685_MODE1, 0x00);
          // Wait 5 nanoseconds for restart
          nanosleep(5);
          // Auto-increment
          this.io.i2cWriteReg(this.address, this.COMMANDS.PCA9685_MODE1, 0xa1);

          this.board.Drivers[this.address].initialized = true;
        }
      }
    },
    write: {
      writable: true,
      value: function(pin, degrees) {
        var on = 0;
        var off = __.map(degrees, 0, 180, this.pwmRange[0] / 4, this.pwmRange[1] / 4);

        this.io.i2cWrite(this.address, [this.COMMANDS.LED0_ON_L + 4 * pin, on, on >> 8, off, off >> 8]);
      }
    }
  },
  DEFAULT: {
    initialize: {
      value: function(opts) {

        // When in debug mode, if pin is not a PWM pin, emit an error
        if (opts.debug && !this.board.pins.isServo(this.pin)) {
          Board.Pins.Error({
            pin: this.pin,
            type: "PWM",
            via: "Servo",
          });
        }

        this.io.servoConfig(this.pin, this.pwmRange[0], this.pwmRange[1]);
      }
    },
    write: {
      writable: true,
      value: function(pin, degrees) {
        this.io.servoWrite(pin, degrees);
      }
    }
  }
};

var Devices = {
  FORWARD: {
    deviceName: {
      get: function() {
        return "FORWARD";
      }
    },
    dir: {
      value: function(speed, dir) {
        if (dir.name === "forward") {
          return this.speed(speed);
        }
      }
    }
  },
  FORWARD_REVERSE: {
    deviceName: {
      get: function() {
        return "FORWARD_REVERSE";
      }
    },
    dir: {
      value: function(speed, dir) {
        if (dir.name === "forward") {
          return this.speed(__.fscale(speed, 0, 100, this.neutral, this.range[1]));
        } else {
          return this.speed(__.fscale(speed, 0, 100, this.neutral, this.range[0]));
        }
      }
    }
  },
  FORWARD_BRAKE_REVERSE: {
    deviceName: {
      get: function() {
        return "FORWARD_BRAKE_REVERSE";
      }
    },
    dir: {
      value: function(speed, dir) {

        /*
          As far as I can tell, this isn't possible.

          To enable reverse, the brakes must first be applied,
          but it's not nearly as simple as it sounds since there
          appears to be a timing factor that differs across
          speed controllers.
         */

        if (dir.name === "forward") {
          this.speed(__.fscale(speed, 0, 100, this.neutral, this.range[1]));
        } else {
          this.speed(__.fscale(speed, 0, 100, this.neutral, this.range[0]));
        }
      }
    }
  }
};

/**
 * ESC
 * @constructor
 *
 * @param {Object} opts Options: pin, range
 * @param {Number} pin  Pin number
 */

function ESC(opts) {
  if (!(this instanceof ESC)) {
    return new ESC(opts);
  }

  var pinValue;
  var device;
  var controller;
  var state = {
    // All speed history for this ESC
    // history = [
    //   {
    //     timestamp: Date.now(),
    //     speed: speed
    //   }
    // ];
    history: [],
    value: 0
  };

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  priv.set(this, state);

  this.id = opts.id || Board.uid();
  this.startAt = typeof opts.startAt !== "undefined" ? opts.startAt : null;
  this.neutral = opts.neutral;
  this.range = opts.range || [0, 100];
  this.pwmRange = opts.pwmRange || [544, 2400];
  this.interval = null;

  // StandardFirmata on Arduino allows controlling
  // servos from analog pins.
  // If we're currently operating with an Arduino
  // and the user has provided an analog pin name
  // (eg. "A0", "A5" etc.), parse out the numeric
  // value and capture the fully qualified analog
  // pin number.
  if (typeof opts.controller === "undefined" && Pins.isFirmata(this)) {
    if (typeof pinValue === "string" && pinValue[0] === "A") {
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

  // Allow users to pass in custom device types
  device = typeof opts.device === "string" ?
    Devices[opts.device] : opts.device;

  if (!device) {
    device = Devices.FORWARD;
  }

  /**
   * Used for adding special controllers (i.e. PCA9685)
   **/
  controller = typeof opts.controller === "string" ?
    Controllers[opts.controller] : opts.controller;

  if (!controller) {
    controller = Controllers.DEFAULT;
  }

  Object.defineProperties(this, Object.assign({}, device, controller, {
    value: {
      get: function() {
        return state.value;
      }
    },
    history: {
      get: function() {
        return state.history.slice(-5);
      }
    },
    last: {
      get: function() {
        return state.history[state.history.length - 1] || { last: null };
      }
    }
  }));

  this.initialize(opts);

  if (this.deviceName !== "FORWARD") {
    if (Number.isNaN(+this.neutral)) {
      throw new Error("Directional speed controllers require a neutral point from 0-100 (number)");
    }

    this.startAt = this.neutral;
  }

  // Match either null or undefined, but not 0
  if (this.startAt !== null && this.startAt !== undefined) {
    this.speed(this.startAt);
  }
}

util.inherits(ESC, Emitter);

/**
 * speed
 *
 * Set the ESC's speed
 *
 * @param  {Float} speed 0...100 (full range)
 *
 * @return {ESC} instance
 */

ESC.prototype.speed = function(speed) {
  var state = priv.get(this);
  var history = state.history;
  var noInterval = false;
  var steps = 0;
  var lspeed, hspeed;

  speed = __.constrain(speed, this.range[0], this.range[1]);

  if (this.interval) {
    // Bail out if speed is the same as whatever was
    // last _provided_
    if (this.value === speed) {
      return this;
    } else {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  state.value = speed;

  // This is the very first speed command being received.
  // Safe to assume that the ESC and Brushless motor are
  // not yet moving.
  if (history.length === 0) {
    noInterval = true;
  }

  // Bail out if speed is the same as whatever was
  // last _written_

  if (this.last.speed === speed) {
    return this;
  }

  lspeed = this.last.speed;
  hspeed = speed;
  steps = Math.ceil(Math.abs(lspeed - hspeed));

  if (!steps || steps === 1) {
    noInterval = true;
  }

  if (noInterval) {
    this.write(this.pin, __.fscale(speed, 0, 100, 0, 180));

    history.push({
      timestamp: Date.now(),
      speed: speed
    });
    return this;
  }

  var throttle = lspeed;

  this.interval = setInterval(function() {

    if (hspeed > throttle) {
      throttle++;
    } else {
      throttle--;
    }

    this.write(this.pin, (throttle * 180 / 100));

    history.push({
      timestamp: Date.now(),
      speed: throttle
    });

    if (steps) {
      steps--;

      if (!steps) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }
  }.bind(this), 1);

  return this;
};


/**
 * brake Stop the ESC by hitting the brakes ;)
 * @return {Object} instance
 */
ESC.prototype.brake = function() {
  var state = priv.get(this);
  var speed = this.neutral || 0;

  this.speed(speed);

  state.history.push({
    timestamp: Date.now(),
    speed: speed
  });

  return this;
};

[
  /**
   * forward Set forward speed
   * fwd Set forward speed
   *
   * @param  {Number} 0-100, 0 is stopped, 100 is fastest
   * @return {Object} this
   */
  {
    name: "forward",
    abbr: "fwd",
    value: 1
  },
  /**
   * reverse Set revese speed
   * rev Set revese speed
   *
   * @param  {Number} 0-100, 0 is stopped, 100 is fastest
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
    return this;
  };

  ESC.prototype[dir.name] = ESC.prototype[dir.abbr] = method;
});


/**
 * stop Stop the ESC
 * @return {Object} instance
 */
ESC.prototype.stop = function() {
  var state = priv.get(this);
  var history = state.history;
  var speed = this.type === "bidirectional" ? this.neutral : 0;

  this.write(this.pin, __.fscale(speed, 0, 100, 0, 180));

  history.push({
    timestamp: Date.now(),
    speed: speed
  });

  return this;
};

/**
 * ESC.Array()
 * new ESC.Array()
 *
 * Constructs an Array-like instance of all escs
 */
ESC.Array = function(numsOrObjects) {
  if (!(this instanceof ESC.Array)) {
    return new ESC.Array(numsOrObjects);
  }

  var items = [];

  if (numsOrObjects) {
    while (numsOrObjects.length) {
      var numOrObject = numsOrObjects.shift();
      if (!(numOrObject instanceof ESC)) {
        numOrObject = new ESC(numOrObject);
      }
      items.push(numOrObject);
    }
  } else {
    items = items.concat(Array.from(priv.keys()));
  }

  this.length = items.length;

  items.forEach(function(item, index) {
    this[index] = item;
  }, this);
};

/**
 * each Execute callbackFn for each active esc instance
 *
 * eg.
 * array.each(function( esc, index ) {
 *  `this` refers to the current esc instance
 * });
 *
 * @param  {[type]} callbackFn [description]
 * @return {[type]}            [description]
 */
ESC.Array.prototype.each = function(callbackFn) {
  var length = this.length;

  for (var i = 0; i < length; i++) {
    callbackFn.call(this[i], this[i], i);
  }

  return this;
};

/**
 *
 * ESC.Array, speed(0-100%)
 *
 * set all escs to the specified speed from 0-100%
 *
 * eg. array.min();

 * ESC.Array, min()
 *
 * set all escs to the minimum throttle
 *
 * eg. array.min();

 * ESC.Array, max()
 *
 * set all escs to the maximum throttle
 *
 * eg. array.max();

 * ESC.Array, stop()
 *
 * stop all escs
 *
 * eg. array.stop();
 */

Object.keys(ESC.prototype).forEach(function(method) {
  // Create ESC.Array wrappers for each method listed.
  // This will allow us control over all ESC instances
  // simultaneously.
  ESC.Array.prototype[method] = function() {
    var length = this.length;

    for (var i = 0; i < length; i++) {
      this[i][method].apply(this[i], arguments);
    }
    return this;
  };
});

if (IS_TEST_MODE) {
  ESC.purge = function() {
    priv.clear();
  };
}

module.exports = ESC;
