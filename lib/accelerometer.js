var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  __ = require("../lib/fn.js"),
  sum = __.sum,
  scale = __.scale,
  fma = __.fma,
  constrain = __.constrain,
  int16 = __.ToInt16FromTwoBytes;

var priv = new Map();
var rad2deg = 180 / Math.PI;
var axes = ["x", "y", "z"];

var Controllers = {
  ANALOG: {
    DEFAULTS: {
      value: {
        zeroV: 478,
        sensitivity: 96
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var pins = opts.pins || [],
          state = priv.get(this),
          dataPoints = {};

        state.zeroV = opts.zeroV || this.DEFAULTS.zeroV;
        state.sensitivity = opts.sensitivity || this.DEFAULTS.sensitivity;

        pins.forEach(function(pin, index) {
          this.io.pinMode(pin, this.io.MODES.ANALOG);
          this.io.analogRead(pin, function(data) {
            var axis = axes[index];
            dataPoints[axis] = data;
            dataHandler(dataPoints);
          }.bind(this));
        }, this);
      }
    },
    toGravity: {
      value: function(raw) {
        var state = priv.get(this);
        return (raw - state.zeroV) / state.sensitivity;
      }
    }
  },
  // http://www.invensense.com/mems/gyro/mpu6050.html
  MPU6050: {
    initialize: {
      value: function(opts, dataHandler) {
        var IMU = require("../lib/imu");
        var driver = IMU.Drivers.get(this.board, "MPU6050", opts);
        var state = priv.get(this);

        state.sensitivity = opts.sensitivity || 16384;

        driver.on("data", function(err, data) {
          dataHandler.call(this, data.accelerometer);
        }.bind(this));
      }
    },
    toGravity: {
      value: function(raw) {
        var state = priv.get(this);
        return raw / state.sensitivity;
      }
    }
  },
  ADXL345: {
    // http://www.analog.com/en/mems-sensors/mems-inertial-sensors/adxl345/products/product.html
    // http://www.i2cdevlib.com/devices/adxl345#source

    ADDRESSES: {
      value: [0x53]
    },
    COMMANDS: {
      value: {
        POWER: 0x2D,
        RANGE: 0x31,
        READREGISTER: 0x32
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var READLENGTH = 6;
        var io = this.board.io;
        var freq = opts.freq || 100;
        var address = opts.address || this.ADDRESSES[0];
        var state = priv.get(this);

        // Sensitivity:
        //
        // (ADXL345_MG2G_MULTIPLIER * SENSORS_GRAVITY_STANDARD) = (0.004 * 9.80665) = 0.0390625
        //
        // Reference:
        // https://github.com/adafruit/Adafruit_Sensor/blob/master/Adafruit_Sensor.h#L34-L37
        // https://github.com/adafruit/Adafruit_ADXL345/blob/master/Adafruit_ADXL345_U.h#L73
        // https://github.com/adafruit/Adafruit_ADXL345/blob/master/Adafruit_ADXL345_U.cpp#L298-L309
        //
        // Invert for parity with other controllers
        //
        // (1 / 0.0390625) * (1 / 9.8)
        //
        // OR
        //
        // (1 / ADXL345_MG2G_MULTIPLIER) = (1 / 0.004)
        //
        // OR
        //
        // 250
        //
        state.sensitivity = opts.sensitivity || 250;

        io.i2cConfig();

        // Standby mode
        io.i2cWrite(address, this.COMMANDS.POWER, 0);

        // Enable measurements
        io.i2cWrite(address, this.COMMANDS.POWER, 8);

        // Set range (this is 2G range, should be user defined?)
        io.i2cWrite(address, this.COMMANDS.RANGE, 8);

        io.i2cRead(address, this.COMMANDS.READREGISTER, READLENGTH, function(data) {
          dataHandler.call(this, {
            x: int16(data[1], data[0]),
            y: int16(data[3], data[2]),
            z: int16(data[5], data[4])
          });
        }.bind(this));
      },
    },
    toGravity: {
      value: function(raw) {
        var state = priv.get(this);
        return raw / state.sensitivity;
      }
    }
  }
};

// Otherwise known as...
Controllers["MPU-6050"] = Controllers.MPU6050;
Controllers["TINKERKIT"] = Controllers.ANALOG;
Controllers["ADXL335"] = {
  DEFAULTS: {
    value: {
      zeroV: 330,
      sensitivity: 66.5
    }
  },
  initialize: Controllers.ANALOG.initialize,
  toGravity: Controllers.ANALOG.toGravity
};

function ToPrecision(val, precision) {
  return +(val).toPrecision(precision);
}

function magnitude(x, y, z) {
  var a;

  a = x * x;
  a = fma(y, y, a);
  a = fma(z, z, a);

  return Math.sqrt(a);
}

/**
 * Accelerometer
 * @constructor
 *
 * five.Accelerometer([ x, y[, z] ]);
 *
 * five.Accelerometer({
 *   pins: [ x, y[, z] ]
 *   zeroV: ...
 *   sensitivity: ...
 * });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Accelerometer(opts) {
  if (!(this instanceof Accelerometer)) {
    return new Accelerometer(opts);
  }

  var controller = null;
  var err = null;

  var state = {
    x: {
      value: 0,
      previous: 0,
      stash: [],
      orientation: null,
      inclination: null,
      acceleration: null,
    },
    y: {
      value: 0,
      previous: 0,
      stash: [],
      orientation: null,
      inclination: null,
      acceleration: null,
    },
    z: {
      value: 0,
      previous: 0,
      stash: [],
      orientation: null,
      inclination: null,
      acceleration: null,
    }
  };

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    controller = Controllers["ANALOG"];
  }

  Object.defineProperties(this, controller);

  if (!this.toGravity) {
    this.toGravity = opts.toGravity || function(raw) { return raw; };
  }

  priv.set(this, state);

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      var isChange = false;

      Object.keys(data).forEach(function(axis) {
        var value = data[axis];
        var sensor = state[axis];

        // The first run needs to prime the "stash"
        // of data values.
        if (sensor.stash.length === 0) {
          for (var i = 0; i < 5; i++) {
            sensor.stash[i] = value;
          }
        }

        sensor.previous = sensor.value;
        sensor.stash.shift();
        sensor.stash.push(value);

        sensor.value = (sum(sensor.stash) / 5) | 0;

        if (this.acceleration !== sensor.acceleration) {
          sensor.acceleration = this.acceleration;
          isChange = true;
          this.emit("acceleration", sensor.acceleration);
        }

        if (this.orientation !== sensor.orientation) {
          sensor.orientation = this.orientation;
          isChange = true;
          this.emit("orientation", sensor.orientation);
        }

        if (this.inclination !== sensor.inclination) {
          sensor.inclination = this.inclination;
          isChange = true;
          this.emit("inclination", sensor.inclination);
        }
      }, this);

      this.emit("data", {
        x: state.x.value,
        y: state.y.value,
        z: state.z.value
      });

      if (isChange) {
        this.emit("change", {
          x: this.x,
          y: this.y,
          z: this.z
        });
      }
    }.bind(this));
  }

  Object.defineProperties(this, {
    hasAxis: {
      value: function(axis) {
        return state[axis] ? state[axis].stash.length > 0 : false;
      }
    },
    /**
     * [read-only] Calculated pitch value
     * @property pitch
     * @type Number
     */
    pitch: {
      get: function() {
        var x, y, z, rads;

        x = this.x;
        y = this.y;
        z = this.z;


        rads = this.hasAxis("z") ?
          Math.atan2(x, Math.hypot(y, z)) :
          Math.asin(constrain(x, -1, 1));

        return ToPrecision(rads * rad2deg, 2);
      }
    },
    /**
     * [read-only] Calculated roll value
     * @property roll
     * @type Number
     */
    roll: {
      get: function() {
        var x, y, z, rads;

        x = this.x;
        y = this.y;
        z = this.z;

        rads = this.hasAxis("z") ?
          Math.atan2(y, Math.hypot(x, z)) :
          Math.asin(constrain(y, -1, 1));

        return ToPrecision(rads * rad2deg, 2);
      }
    },
    x: {
      get: function() {
        return ToPrecision(this.toGravity(state.x.value), 2);
      }
    },
    y: {
      get: function() {
        return ToPrecision(this.toGravity(state.y.value), 2);
      }
    },
    z: {
      get: function() {
        return this.hasAxis("z") ?
          ToPrecision(this.toGravity(state.z.value), 2) : 0;
      }
    },
    acceleration: {
      get: function() {
        return magnitude(
          this.x,
          this.y,
          this.z
        );
      }
    },
    inclination: {
      get: function() {
        return Math.atan2(this.y, this.x) * rad2deg;
      }
    },
    orientation: {
      get: function() {
        var abs = Math.abs;
        var x = this.x;
        var y = this.y;
        var z = this.hasAxis(z) ? this.z : 1;
        var xAbs = abs(x);
        var yAbs = abs(y);
        var zAbs = abs(z);

        if (xAbs < yAbs && xAbs < zAbs) {
          if (x > 0) {
            return 1;
          }
          return -1;
        }
        if (yAbs < xAbs && yAbs < zAbs) {
          if (y > 0) {
            return 2;
          }
          return -2;
        }
        if (zAbs < xAbs && zAbs < yAbs) {
          if (z > 0) {
            return 3;
          }
          return -3;
        }
        return 0;
      }
    }
  });
}


util.inherits(Accelerometer, events.EventEmitter);

module.exports = Accelerometer;
