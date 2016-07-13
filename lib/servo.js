var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Board = require("./board");
var Pins = Board.Pins;
var Expander = require("./expander");
var Emitter = require("events").EventEmitter;
var util = require("util");
var Collection = require("./mixins/collection");
var Fn = require("./fn");
var Animation = require("./animation");

// Servo instance private data
var priv = new Map();

var Controllers = {
  PCA9685: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        this.address = opts.address || 0x40;
        this.pwmRange = opts.pwmRange || [450, 1850];
        this.frequency = opts.frequency || 50;

        state.expander = Expander.get({
          address: this.address,
          controller: this.controller,
          bus: this.bus,
          pwmRange: this.pwmRange,
          frequency: this.frequency,
        });

        this.pin = state.expander.normalize(opts.pin);
      }
    },
    servoWrite: {
      writable: true,
      value: function(pin, degrees) {
        var state = priv.get(this);
        state.expander.servoWrite(pin, degrees);
      }
    }
  },
  Standard: {
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

        if (Array.isArray(opts.pwmRange)) {
          this.io.servoConfig(this.pin, opts.pwmRange[0], opts.pwmRange[1]);
        } else {
          this.io.pinMode(this.pin, this.mode);
        }
      }
    },
    servoWrite: {
      value: function(pin, degrees) {
        // Servo is restricted to integers
        degrees |= 0;

        // If same degrees return immediately.
        if (this.last && this.last.degrees === degrees) {
          return this;
        }

        this.io.servoWrite(this.pin, degrees);
      }
    }
  }
};

/**
 * Servo
 * @constructor
 *
 * @param {Object} opts Options: pin, type, id, range
 */

function Servo(opts) {
  var history = [];
  var pinValue;
  var controller;

  if (!(this instanceof Servo)) {
    return new Servo(opts);
  }

  pinValue = typeof opts === "object" ? opts.pin : opts;

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  this.range = opts.range || [0, 180];
  this.deadband = opts.deadband || [90, 90];
  this.fps = opts.fps || 100;
  this.offset = opts.offset || 0;
  this.mode = this.io.MODES.SERVO;
  this.interval = null;
  this.value = null;

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


  // The type of servo determines certain alternate
  // behaviours in the API
  this.type = opts.type || "standard";

  // Invert the value of all servoWrite operations
  // eg. 80 => 100, 90 => 90, 0 => 180
  if (opts.isInverted) {
    console.warn("The 'isInverted' property has been renamed 'invert'");
  }
  this.invert = opts.isInverted || opts.invert || false;

  // Specification config
  this.specs = opts.specs || {
    speed: Servo.Continuous.speeds["@5.0V"]
  };

  // Allow "setup"instructions to come from
  // constructor options properties
  this.startAt = 90;

  // Collect all movement history for this servo
  // history = [
  //   {
  //     timestamp: Date.now(),
  //     degrees: degrees
  //   }
  // ];

  priv.set(this, {
    history: history
  });


  /**
   * Used for adding special controllers (i.e. PCA9685)
   **/
  controller = typeof opts.controller === "string" ?
    Controllers[opts.controller] : Controllers.Standard;

  Object.defineProperties(this, Object.assign({}, controller, {
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
        return history.length ? history[history.length - 1].degrees : -1;
      }
    }
  }));

  this.initialize(opts);


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

  if (opts.type === "continuous") {
    this.stop();
  }

}

util.inherits(Servo, Emitter);


/**
 * to
 *
 * Set the servo horn's position to given degree over time.
 *
 * @param  {Number} degrees   Degrees to turn servo to.
 * @param  {Number} time      Time to spend in motion.
 * @param  {Number} rate      The rate of the motion transiton
 *
 * - or -
 *
 * @param {Object} an Animation() segment config object
 *
 * @return {Servo} instance
 */

Servo.prototype.to = function(degrees, time, rate) {

  var options = {};
  var state = priv.get(this);

  if (typeof degrees === "object") {

    options = {
      duration: degrees.duration || degrees.interval || 1000,
      cuePoints: [0, 1.0],
      keyFrames: [null, {
        degrees: typeof degrees.degrees === "number" ? degrees.degrees : this.startAt
      }],
      oncomplete: function() {
        process.nextTick(this.emit.bind(this, "move:complete"));
      }.bind(this)
    };

    Object.assign(options, degrees);

    state.isRunning = true;
    state.animation = state.animation || new Animation(this);
    state.animation.enqueue(options);

  } else {

    var target = degrees;

    // Enforce limited range of motion
    degrees = Fn.constrain(degrees, this.range[0], this.range[1]);
    degrees += this.offset;

    this.value = degrees;

    if (this.invert) {
      degrees = Fn.map(
        degrees,
        0, 180,
        180, 0
      );
    }

    if (typeof time !== "undefined") {

      options = {
        duration: time,
        keyFrames: [null, {
          degrees: degrees
        }],
        fps: rate || this.fps
      };

      this.to(options);

    } else {
      this.servoWrite(this.pin, degrees);

      if (state.history.length > 5) {
        state.history.shift();
      }

      state.history.push({
        timestamp: Date.now(),
        degrees: degrees,
        target: target
      });
    }
  }

  // return this instance
  return this;
};


/**
 * Animation.normalize
 *
 * @param [number || object] keyFrames An array of step values or a keyFrame objects
 */

Servo.prototype[Animation.normalize] = function(keyFrames) {

  var last = this.last ? this.last.target : this.startAt;

  // If user passes null as the first element in keyFrames use current position
  if (keyFrames[0] === null) {
    keyFrames[0] = {
      value: last
    };
  }

  // There are a couple of properties that are device type sepcific
  // that we need to convert to something generic
  keyFrames.forEach(function(keyFrame) {
    if (typeof keyFrame.degrees !== "undefined") {
      keyFrame.value = keyFrame.degrees;
    }
    if (typeof keyFrame.copyDegrees !== "undefined") {
      keyFrame.copyValue = keyFrame.copyDegrees;
    }
  });

  return keyFrames;

};

/**
 * Animation.render
 *
 * @position [number] value to set the servo to
 */

Servo.prototype[Animation.render] = function(position) {
  return this.to(position[0]);
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
  return this.to(this.last.target + degrees, time);
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
 * @param  {Number} time      Time to spend in motion.
 * @param  {Number} rate      The rate of the motion transiton
 * @return {Object} instance
 */

Servo.prototype.min = function(time, rate) {
  return this.to(this.range[0], time, rate);
};

/**
 * max Set Servo to maximum degrees, defaults to 180deg
 * @param  {Number} time      Time to spend in motion.
 * @param  {Number} rate      The rate of the motion transiton
 * @return {[type]} [description]
 */
Servo.prototype.max = function(time, rate) {
  return this.to(this.range[1], time, rate);
};

/**
 * center Set Servo to centerpoint, defaults to 90deg
 * @param  {Number} time      Time to spend in motion.
 * @param  {Number} rate      The rate of the motion transiton
 * @return {[type]} [description]
 */
Servo.prototype.center = function(time, rate) {
  return this.to(Math.abs((this.range[0] + this.range[1]) / 2), time, rate);
};

/**
 * home Return Servo to startAt position
 */
Servo.prototype.home = function() {
  return this.to(this.startAt);
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

  var options = {
    keyFrames: [{
      degrees: this.range[0]
    }, {
      degrees: this.range[1]
    }],
    metronomic: true,
    loop: true,
    easing: "inOutSine"
  };

  // If opts is an array, then assume a range was passed
  if (Array.isArray(opts)) {
    options.keyFrames = rangeToKeyFrames(opts);
  } else {
    if (typeof opts === "object" && opts !== null) {
      Object.assign(options, opts);
      if (Array.isArray(options.range)) {
        options.keyFrames = rangeToKeyFrames(options.range);
      }
    }
  }

  return this.to(options);
};

function rangeToKeyFrames(range) {
  return range.map(function(degrees) {
    return { degrees: degrees };
  });
}

/**
 * stop Stop a moving servo
 * @return {[type]} [description]
 */
Servo.prototype.stop = function() {
  var state = priv.get(this);

  if (state.animation) {
    state.animation.stop();
  }

  if (this.type === "continuous") {
    this.to(
      this.deadband.reduce(function(a, b) {
        return Math.round((a + b) / 2);
      })
    );
  } else {
    clearInterval(this.interval);
  }

  return this;
};

//
["clockWise", "cw", "counterClockwise", "ccw"].forEach(function(api) {
  Servo.prototype[api] = function(rate) {
    var range;
    rate = rate === undefined ? 1 : rate;
    if (this.type !== "continuous") {
      this.board.error(
        "Servo",
        "Servo.prototype." + api + " is only available for continuous servos"
      );
    }
    if (api === "cw" || api === "clockWise") {
      range = [rate, 0, 1, this.deadband[1] + 1, this.range[1]];
    } else {
      range = [rate, 0, 1, this.deadband[0] - 1, this.range[0]];
    }
    return this.to(Fn.scale.apply(null, range) | 0);
  };
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
    Object.assign(opts, pinOrOpts);
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
 * Servos()
 * new Servos()
 */
function Servos(numsOrObjects) {
  if (!(this instanceof Servos)) {
    return new Servos(numsOrObjects);
  }

  Object.defineProperty(this, "type", {
    value: Servo
  });

  Collection.call(this, numsOrObjects);
}

Servos.prototype = Object.create(Collection.prototype, {
  constructor: {
    value: Servos
  }
});


/*
 * Servos, center()
 *
 * centers all servos to 90deg
 *
 * eg. array.center();

 * Servos, min()
 *
 * set all servos to the minimum degrees
 * defaults to 0
 *
 * eg. array.min();

 * Servos, max()
 *
 * set all servos to the maximum degrees
 * defaults to 180
 *
 * eg. array.max();

 * Servos, stop()
 *
 * stop all servos
 *
 * eg. array.stop();
 */

Collection.installMethodForwarding(
  Servos.prototype, Servo.prototype
);


/**
 * Animation.normalize
 *
 * @param [number || object] keyFrames An array of step values or a keyFrame objects
 */

Servos.prototype[Animation.normalize] = function(keyFrameSet) {

  keyFrameSet.forEach(function(keyFrames, index) {

    if (keyFrames !== null) {
      var servo = this[index];

      // If servo is a servoArray then user servo[0] for default values
      if (servo instanceof Servos) {
        servo = servo[0];
      }

      var last = servo.last ? servo.last.target : servo.startAt;

      // If the first keyFrameSet is null use the current position
      if (keyFrames[0] === null) {
        keyFrames[0] = {
          value: last
        };
      }

      if (Array.isArray(keyFrames)) {
        if (keyFrames[0] === null) {
          keyFrameSet[index][0] = {
            value: last
          };
        }
      }

      keyFrames.forEach(function(keyFrame) {
        if (keyFrame != null && typeof keyFrame.degrees !== "undefined") {
          keyFrame.value = keyFrame.degrees;
        }
        if (keyFrame != null && typeof keyFrame.copyDegrees !== "undefined") {
          keyFrame.copyValue = keyFrame.copyDegrees;
        }
      });

    }

  }, this);

  return keyFrameSet;

};

/**
 * Animation.render
 *
 * @position [number] array of values to set the servos to
 */

Servos.prototype[Animation.render] = function(position) {
  this.each(function(servo, i) {
    servo.to(position[i]);
  });
  return this;
};


// Assign Servos Collection class as static "method" of Servo.
// TODO: Eliminate .Array for 1.0.0
Servo.Array = Servos;
Servo.Collection = Servos;

// Alias
// TODO: Deprecate and REMOVE
Servo.prototype.write = Servo.prototype.move;

/* istanbul ignore else */
if (IS_TEST_MODE) {
  Servo.purge = function() {
    priv.clear();
  };
}

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
