var Board = require("../lib/board.js"),
  Emitter = require("events").EventEmitter,
  util = require("util"),
  __ = require("./fn");

var priv = new Map(),
  ESCS = [];

/**
 * ESC
 * @constructor
 *
 * @param {Object} opts Options: pin, range, pwmRange
 * @param {Number} pin  Pin number
 */

function ESC(opts) {
  if (!(this instanceof ESC)) {
    return new ESC(opts);
  }

  var history = [];

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  // Set the pin to SERVO (OUTPUT) mode
  this.mode = this.io.MODES.SERVO;
  this.io.pinMode(this.pin, this.mode);

  // When in debug mode, if pin is not a PWM pin, emit an error
  if (opts.debug && !this.board.pins.isPWM(this.pin)) {
    Board.Pins.Error({
      pin: this.pin,
      type: "PWM",
      via: "ESC",
    });
  }

  priv.set(this, {
    // All speed history for this ESC
    // history = [
    //   {
    //     timestamp: Date.now(),
    //     speed: speed
    //   }
    // ];
    history: history
  });

  this.interval = null;
  this.value = 0;

  this.startAt = opts.startAt !== undefined ?
    opts.startAt : 0;

  this.range = opts.range || [0, 100];

  if (opts.pwmRange) {
    this.range = [
      __.scale(opts.pwmRange[0], 600, 2400, 0, 100) | 0,
      __.scale(opts.pwmRange[1], 600, 2400, 0, 100) | 0
    ];
  }

  // Allow user defined ids, defaults to system ID
  this.id = opts.id || Board.uid();

  Object.defineProperties(this, {
    history: {
      get: function() {
        return history.slice(-5);
      }
    },
    last: {
      get: function() {
        return history[history.length - 1];
      }
    }
  });

  this.speed(this.startAt);

  // Push this esc into the private
  // esc instance array.
  ESCS.push(this);
}

util.inherits(ESC, Emitter);

/**
 * speed
 *
 * Set the ESC's speed
 *
 * @param  {Float} speed 0...1
 *
 * @return {ESC} instance
 */

ESC.prototype.speed = function(speed) {
  var state = priv.get(this);
  var history = state.history;
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

  // This is the very first speed command being received.
  // Safe to assume that the ESC and Brushless motor are
  // not yet moving.
  if (history.length === 0) {
    history.push({
      timestamp: Date.now(),
      speed: 0
    });
  }

  // Bail out if speed is the same as whatever was
  // last _written_
  if (this.last.speed === speed) {
    return this;
  }

  this.value = speed;

  lspeed = this.last.speed;
  hspeed = speed;
  steps = Math.round(Math.abs(lspeed - hspeed));

  if (!steps) {
    return this;
  }

  this.interval = setInterval(function() {
    var lspeed = this.last.speed;
    var throttle = lspeed;
    var send;

    if (hspeed > throttle) {
      throttle++;
    } else {
      throttle--;
    }

    this.io.servoWrite(
      this.pin, (throttle * 180 / 100) | 0
    );

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
 * min Set ESC to minimum throttle
 * @return {Object} instance
 */

ESC.prototype.min = function() {
  return this.speed(this.range[0]);
};

/**
 * max Set ESC to maximum throttle
 * @return {[type]} [description]
 */
ESC.prototype.max = function() {
  return this.speed(this.range[1]);
};

/**
 * stop Stop the ESC
 * @return {Object} instance
 */
ESC.prototype.stop = ESC.prototype.min;

/**
 * ESC.Array()
 * new ESC.Array()
 *
 * Constructs an Array-like instance of all escs
 */
ESC.Array = function(pins) {
  if (!(this instanceof ESC.Array)) {
    return new ESC.Array(pins);
  }

  var escs = [];
  var pinOrESC;

  if (pins) {
    while (pins.length) {
      pinOrESC = pins.shift();
      escs.push(
        typeof pinOrESC === "number" ?
        new ESC(pinOrESC) : pinOrESC
      );
    }
  } else {
    escs = ESCS.slice();
  }

  escs.forEach(function(esc, index) {
    this[index] = esc;
  }, this);

  this.length = escs.length;
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
  for (var i = 0; i < this.length; i++) {
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
    var args = [].slice.call(arguments);

    this.each(function(esc) {
      ESC.prototype[method].apply(esc, args);
    });

    return this;
  };
});

module.exports = ESC;
