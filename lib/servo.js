var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  __ = require("../lib/fn.js");

// Sensor instance private data
var priv = new Map(),
  SERVOS = [];

/**
 * Servo
 * @constructor
 *
 * @param {Object} opts Options: pin, type, id, range
 */

function Servo(opts) {
  if (!(this instanceof Servo)) {
    return new Servo(opts);
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
  if (opts.debug && !this.board.pins.isServo(this.pin)) {
    Board.Pins.Error({
      pin: this.pin,
      type: "PWM",
      via: "Servo",
    });
  }

  // Servo instance properties
  this.range = opts.range || [0, 180];

  this.fps = opts.fps || 100;

  if (opts.pwmRange) {
    this.range = [
      __.scale(opts.pwmRange[0], 600, 2400, 0, 180),
      __.scale(opts.pwmRange[1], 600, 2400, 0, 180)
    ];
  }

  priv.set(this, {
    history: history
  });

  // Allow user defined ids, defaults to system ID
  this.id = opts.id || Board.uid();

  // Invert the value of all servoWrite operations
  // eg. 80 => 100, 90 => 90, 0 => 180
  this.isInverted = opts.isInverted || false;

  // The type of servo determines certain alternate
  // behaviours in the API
  this.type = opts.type || "standard";

  // Specification config
  this.specs = opts.specs || {
    speed: Servo.Continuous.speeds["@5.0V"]
  };

  // Collect all movement history for this servo
  // history = [
  //   {
  //     timestamp: Date.now(),
  //     degrees: degrees
  //   }
  // ];

  // Interval/Sweep pointer
  this.interval = null;

  this.value = 0;

  // Create a non-writable "last" property
  // shortcut to access the last servo movement
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
    position: {
      get: function() {
        return history[history.length - 1].degrees;
      }
    }
  });

  // Allow "setup"instructions to come from
  // constructor options properties
  this.startAt = 90;

  // If "startAt" is defined and center is falsy
  // set servo to min or max degrees
  if (opts.startAt !== undefined) {
    this.startAt = opts.startAt;

    if (!opts.center) {
      this.to(opts.startAt);
    }
  }



  // If "center" true set servo to 90deg
  if (opts.center) {
    this.center();
  }

  // Push this servo into the private
  // servo instance array.
  SERVOS.push(this);
}

util.inherits(Servo, events.EventEmitter);

/**
 * to
 *
 * Set the servo horn's position to given degree over time.
 *
 * @param  {Number} degrees   Degrees to turn servo to.
 * @param  {Number} time      Time to spend in motion.
 * @param  {Number} rate      The rate of the motion transiton
 *
 * @return {Servo} instance
 */

Servo.prototype.to = function(degrees, time, rate) {

  // Servo is restricted to integers
  degrees |= 0;

  // Enforce limited range of motion
  degrees = Board.constrain(degrees, this.range[0], this.range[1]);

  this.value = degrees;

  var last, distance, percent;
  var isReverse = false;
  var history = priv.get(this).history;

  if (this.isInverted) {
    degrees = Board.map(
      degrees,
      this.range[0], this.range[1],
      this.range[1], this.range[0]
    );
  }

  // If same degrees, emit "move:complete" and return immediately.
  if (this.last && this.last.degrees === degrees) {
    process.nextTick(this.emit.bind(this, "move:complete"));
    // this.emit("move:complete");
    return this;
  }

  if (typeof time !== "undefined") {

    // If rate is not passed, calculate based on time and fps
    rate = rate || Math.ceil(time / 1000) * this.fps;

    last = this.last && this.last.degrees || 0;
    distance = Math.abs(last - degrees);
    percent = 0;

    // If steps are limited by Servo resolution
    if (distance < rate) {
      rate = distance;
    }

    if (this.interval) {
      clearInterval(this.interval);
    }

    if (degrees < last) {
      isReverse = true;
    }

    this.interval = setInterval(function() {
      var delta = ++percent * (distance / rate);

      if (isReverse) {
        delta *= -1;
      }

      this.io.servoWrite(this.pin, last + delta);

      history.push({
        timestamp: Date.now(),
        degrees: last + delta
      });

      if (percent === rate) {
        this.emit("move:complete");
        clearInterval(this.interval);
      }
    }.bind(this), time / rate);

  } else {

    this.io.servoWrite(this.pin, degrees);

    history.push({
      timestamp: Date.now(),
      degrees: degrees
    });
  }

  // return this instance
  return this;
};

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

Servo.prototype.step = function(degrees, time) {
  return this.to(this.last.degrees + degrees, time);
};

/**
 * move Alias for Servo.prototype.to
 */
Servo.prototype.move = function(degrees, time) {
  console.warn("Servo.prototype.move has been renamed to Servo.prototype.to");

  return this.to(degrees, time);
};

/**
 * min Set Servo to minimum degrees, defaults to 0deg
 * @return {Object} instance
 */

Servo.prototype.min = function() {
  return this.to(this.range[0]);
};

/**
 * max Set Servo to maximum degrees, defaults to 180deg
 * @return {[type]} [description]
 */
Servo.prototype.max = function() {
  return this.to(this.range[1]);
};

/**
 * center Set Servo to centerpoint, defaults to 90deg
 * @return {[type]} [description]
 */
Servo.prototype.center = function() {
  return this.to(Math.abs((this.range[0] + this.range[1]) / 2));
};

/**
 * sweep Sweep the servo between min and max or provided range
 * @param  {Array} range constrain sweep to range
 *
 * @param {Object} options Set range or interval.
 *
 * @return {[type]} [description]
 */
Servo.prototype.sweep = function(opts) {
  var degrees,
    range = this.range,
    interval = 100,
    step = 10;

  opts = opts || {};

  // If opts is an array, then assume a range was passed
  //
  //  - This implies:
  //    - an interval of 100ms.
  //    - a step of 10 degrees
  //
  if (Array.isArray(opts)) {
    range = opts;
  } else {

    // Otherwise, opts is an object.
    //
    //  - Check for:
    //    - a range, if present use it, otherwise
    //      use the servo's range property.
    //    - an interval, if present use it, otherwise
    //      use the default interval.
    //    - a step, if present use it, otherwise
    //      use the default step
    //
    range = opts.range || range;
    interval = opts.interval || interval;
    step = opts.step || step;
  }

  degrees = range[0];

  // If the last recorded movement was not range[0]deg
  // move the servo to range[0]deg
  if (this.last && this.last.degrees !== degrees) {
    this.to(degrees);
  }

  if (this.interval) {
    clearInterval(this.interval);
  }

  this.interval = setInterval(function() {
    var abs;

    if (degrees >= range[1] || degrees < range[0]) {
      if (degrees >= range[1]) {
        this.emit("sweep:half");
      }

      step *= -1;
    }

    if (degrees === range[0]) {
      if (step !== (abs = Math.abs(step))) {
        this.emit("sweep:full");
        step = abs;
      }
    }

    degrees += step;

    this.to(degrees);
  }.bind(this), interval);

  return this;
};

/**
 * stop Stop a moving servo
 * @return {[type]} [description]
 */
Servo.prototype.stop = function() {
  if (this.type === "continuous") {
    this.to(90);
  } else {
    clearInterval(this.interval);
  }

  return this;
};


/** Speeds for continuous rotation
 *
 * Mock directions: A, B
 *
 * 0 Full speed A
 * 89 Slowest speed A
 * 90 Stopped
 * 91 Slowest speed B
 * 180 Fastest speed B
 *
 *
 **/


/**
 * Degrees to Pulse lengths in ms
 * Servo.pulse = {
 *   lengths: {
 *     0: 1,
 *     90: 1,
 *     180: 2
 *   },
 *   width: 2 / 180
 * };
 *
 **/


[{
  apis: ["clockWise", "cw"],
  args: [0, 1, 91, 180]
}, {
  apis: ["counterClockwise", "ccw"],
  args: [0, 1, 89, 0]
}].forEach(function(setup) {
  var args = setup.args.slice();

  setup.apis.forEach(function(api) {
    Servo.prototype[api] = function(rate) {
      var copy = args.slice();
      rate = rate === undefined ? 1 : rate;

      if (this.type !== "continuous") {
        this.board.error(
          "Servo",
          "Servo.prototype." + api + " is only available for continuous servos"
        );
      }
      copy.unshift(rate);
      return this.to(__.scale.apply(null, copy) | 0);
    };
  });
});


/**
 *
 * Static API
 *
 *
 */

Servo.Continuous = function(pinOrOpts) {
  var opts = {};

  if (typeof pinOrOpts === "object") {
    __.extend(opts, pinOrOpts);
  } else {
    opts.pin = pinOrOpts;
  }

  opts.type = "continuous";

  return new Servo(opts);
};

Servo.Continuous.speeds = {
  // seconds to travel 60 degrees
  "@4.8V": 0.23,
  "@5.0V": 0.17,
  "@6.0V": 0.18
};

/**
 * Servo.Array()
 * new Servo.Array()
 *
 * Constructs an Array-like instance of all servos
 */
Servo.Array = function(pins) {
  if (!(this instanceof Servo.Array)) {
    return new Servo.Array(pins);
  }

  var servos = [];
  var pinOrServo;

  if (pins) {
    while (pins.length) {
      pinOrServo = pins.shift();
      servos.push(
        typeof pinOrServo === "number" ?
        new Servo(pinOrServo) : pinOrServo
      );
    }
  } else {
    servos = SERVOS.slice();
  }

  servos.forEach(function(servo, index) {
    this[index] = servo;
  }, this);

  this.length = servos.length;
};

/**
 * each Execute callbackFn for each active servo instance
 *
 * eg.
 * array.each(function( servo, index ) {
 *  `this` refers to the current servo instance
 * });
 *
 * @param  {[type]} callbackFn [description]
 * @return {[type]}            [description]
 */
Servo.Array.prototype.each = function(callbackFn) {
  var servo, i, length;

  length = this.length;

  for (i = 0; i < length; i++) {
    servo = this[i];
    callbackFn.call(servo, servo, i);
  }

  return this;
};

/**
 * Servo.Array, center()
 *
 * centers all servos to 90deg
 *
 * eg. array.center();

 * Servo.Array, min()
 *
 * set all servos to the minimum degrees
 * defaults to 0
 *
 * eg. array.min();

 * Servo.Array, max()
 *
 * set all servos to the maximum degrees
 * defaults to 180
 *
 * eg. array.max();

 * Servo.Array, stop()
 *
 * stop all servos
 *
 * eg. array.stop();
 */

Object.keys(Servo.prototype).forEach(function(method) {
  // Create Servo.Array wrappers for each method listed.
  // This will allow us control over all Servo instances
  // simultaneously.
  Servo.Array.prototype[method] = function() {
    var args = [].slice.call(arguments);

    this.each(function(servo) {
      Servo.prototype[method].apply(servo, args);
    });

    return this;
  };
});






// Alias
// TODO: Deprecate and REMOVE
Servo.prototype.write = Servo.prototype.move;


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
