var Board = require("../lib/board.js"),
  Emitter = require("events").EventEmitter,
  util = require("util"),
  __ = require("./fn");

var priv = new WeakMap(),
  ESCS = [];

/**
 * ESC
 * @constructor
 *
 * @param {Object} opts Options: pin
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
  if (opts.debug && !this.board.pins.isESC(this.pin)) {
    Board.Pins.Error({
      pin: this.pin,
      type: "PWM",
      via: "ESC",
    });
  }

  priv.set(this, {
    history: history
  });

  // TODO:
  // - Support a user defined range
  //
  this.range = [0, 180];

  // Allow user defined ids, defaults to system ID
  this.id = opts.id || Board.uid();

  // Collect all movement history for this esc
  // history = [
  //   {
  //     timestamp: Date.now(),
  //     speed: speed
  //   }
  // ];

  // Interval/Sweep pointer
  this.interval = null;

  // Create a non-writable "last" property
  // shortcut to access the last esc movement
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
    },
    speed: {
      get: function() {
        return history[history.length - 1].speed;
      }
    }
  });

  // Allow "setup"instructions to come from
  // constructor options properties
  this.startAt = opts.startAt !== undefined ?
    opts.startAt : 0;

  this.to(this.startAt);

  // Push this esc into the private
  // esc instance array.
  ESCS.push(this);
}

util.inherits(ESC, Emitter);

/**
 * to
 *
 * Set the ESC's speed 0-180
 *
 * @param  {Number} speed
 *
 * @return {ESC} instance
 */

ESC.prototype.to = function(speed) {

  speed = __.constrain(speed, 0, 180);

  if (this.interval) {
    return;
  }

  if (this.last && this.last.speed === speed) {
    process.nextTick(this.emit.bind(this, "move:complete"));
    return this;
  }

  var steps = 0;
  var history = priv.get(this).history;

  if (this.last) {

    steps = Math.abs(this.last.speed - speed);

    if (!steps) {
      return this;
    }

    this.interval = setInterval(function() {
      var throttle = this.last.speed;

      if (speed > this.last.speed) {
        throttle++;
      } else {
        throttle--;
      }

      // console.log( "new speed: ", throttle );

      this.io.servoWrite(this.pin, throttle);

      history.push({
        timestamp: Date.now(),
        speed: throttle
      });

      if (steps) {

        // console.log( "steps", steps );

        steps--;

        if (!steps) {
          clearInterval(this.interval);
          this.interval = null;
        }
      }
    }.bind(this), 10);

  } else {

    process.nextTick(
      this.io.servoWrite.bind(this.io, this.pin, speed)
    );

    history.push({
      timestamp: Date.now(),
      speed: speed
    });
  }

  return this;
};

/**
 * min Set ESC to minimum throttle, defaults to 0deg
 * @return {Object} instance
 */

ESC.prototype.min = function() {
  return this.to(this.range[0]);
};

/**
 * max Set ESC to maximum throttle, defaults to 180deg
 * @return {[type]} [description]
 */
ESC.prototype.max = function() {
  return this.to(this.range[1]);
};

/**
 * min Set ESC to minimum throttle, defaults to 0deg
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
  var esc, i, length;

  length = this.length;

  for (i = 0; i < length; i++) {
    esc = this[i];
    callbackFn.call(esc, esc, i);
  }

  return this;
};

/**
 * ESC.Array, center()
 *
 * centers all escs to 90deg
 *
 * eg. array.center();

 * ESC.Array, min()
 *
 * set all escs to the minimum throttle
 * defaults to 0
 *
 * eg. array.min();

 * ESC.Array, max()
 *
 * set all escs to the maximum throttle
 * defaults to 180
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
