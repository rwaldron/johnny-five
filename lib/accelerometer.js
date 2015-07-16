var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  __ = require("../lib/fn.js"),
  sum = __.sum,
  fma = __.fma,
  constrain = __.constrain,
  int16 = __.int16;

var priv = new Map();
var rad2deg = 180 / Math.PI;
var calibrationSize = 10;
var axes = ["x", "y", "z"];

function analogInitialize(opts, dataHandler) {
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

function analogToGravity(raw, axis) {
  var state = priv.get(this);
  var zeroV = state.zeroV;

  if (Array.isArray(zeroV) && zeroV.length > 0) {
    var axisIndex = axes.indexOf(axis);
    zeroV = zeroV[axisIndex || 0];
  }

  return (raw - zeroV) / state.sensitivity;
}

var Controllers = {
  ANALOG: {
    DEFAULTS: {
      value: {
        zeroV: 478,
        sensitivity: 96
      }
    },
    initialize: {
      value: analogInitialize
    },
    toGravity: {
      value: analogToGravity
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

        driver.on("data", function(data) {
          dataHandler(data.accelerometer);
        });
      }
    },
    toGravity: {
      value: function(raw) {
        var state = priv.get(this);
        return raw / state.sensitivity;
      }
    }
  },
  ADXL335: {
    DEFAULTS: {
      value: {
        zeroV: 330,
        sensitivity: 66.5
      }
    },
    initialize: {
      value: analogInitialize
    },
    toGravity: {
      value: analogToGravity
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

        this.io.i2cConfig(opts);

        // Standby mode
        this.io.i2cWrite(address, this.COMMANDS.POWER, 0);

        // Enable measurements
        this.io.i2cWrite(address, this.COMMANDS.POWER, 8);

        // Set range (this is 2G range, should be user defined?)
        this.io.i2cWrite(address, this.COMMANDS.RANGE, 8);

        this.io.i2cRead(address, this.COMMANDS.READREGISTER, READLENGTH, function(data) {
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
  },
  MMA7361: {
    DEFAULTS: {
      value: {
        zeroV: [336, 372, 287],
        sensitivity: 170
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);

        if (opts.sleepPin !== undefined) {
          state.sleepPin = opts.sleepPin;
          this.board.pinMode(state.sleepPin, 1);
          this.board.digitalWrite(state.sleepPin, 1);
        }

        analogInitialize.call(this, opts, dataHandler);
      }
    },
    toGravity: {
      value: analogToGravity
    },
    enabledChanged: {
      value: function(value) {
        var state = priv.get(this);

        if (state.sleepPin !== undefined) {
          this.board.digitalWrite(state.sleepPin, value ? 1 : 0);
        }
      }
    }
  },
  ESPLORA: {
    DEFAULTS: {
      value: {
        zeroV: [320, 330, 310],
        sensitivity: 170
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        opts.pins = [5, 11, 6];
        analogInitialize.call(this, opts, dataHandler);
      }
    },
    toGravity: {
      value: analogToGravity
    }
  }
};

// Otherwise known as...
Controllers["MPU-6050"] = Controllers.MPU6050;
Controllers["TINKERKIT"] = Controllers.ANALOG;

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

  var state = {
    enabled: true,
    x: {
      value: 0,
      previous: 0,
      stash: [],
      orientation: null,
      inclination: null,
      acceleration: null,
      calibration: []
    },
    y: {
      value: 0,
      previous: 0,
      stash: [],
      orientation: null,
      inclination: null,
      acceleration: null,
      calibration: []
    },
    z: {
      value: 0,
      previous: 0,
      stash: [],
      orientation: null,
      inclination: null,
      acceleration: null,
      calibration: []
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

  if (!this.enabledChanged) {
    this.enabledChanged = function() {};
  }

  priv.set(this, state);

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      var isChange = false;

      if (!state.enabled) {
        return;
      }

      Object.keys(data).forEach(function(axis) {
        var value = data[axis];
        var sensor = state[axis];

        if (opts.autoCalibrate && sensor.calibration.length < calibrationSize) {
          var axisIndex = axes.indexOf(axis);
          sensor.calibration.push(value);

          if (!Array.isArray(state.zeroV)) {
            state.zeroV = [];
          }

          state.zeroV[axisIndex] = __.sum(sensor.calibration) / sensor.calibration.length;
          if (axis === "z") {
            state.zeroV[axisIndex] -= state.sensitivity;
          }
        }

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
    enable: {
      value: function() {
        state.enabled = true;
        this.enabledChanged(true);
        return this;
      }
    },
    disable: {
      value: function() {
        state.enabled = false;
        this.enabledChanged(false);
        return this;
      }
    },
    zeroV: {
      get: function() {
        return state.zeroV;
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
        return ToPrecision(this.toGravity(state.x.value, "x"), 2);
      }
    },
    y: {
      get: function() {
        return ToPrecision(this.toGravity(state.y.value, "y"), 2);
      }
    },
    z: {
      get: function() {
        return this.hasAxis("z") ?
          ToPrecision(this.toGravity(state.z.value, "z"), 2) : 0;
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
