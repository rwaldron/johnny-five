var Board = require("./board"),
  events = require("events"),
  util = require("util"),
  __ = require("./fn"),
  sum = __.sum;

var priv = new Map();
var axes = ["x", "y", "z"];

function ToFixed(val, digits) {
  return +(val).toFixed(digits);
}

var Controllers = {
  ANALOG: {
    initialize: {
      value: function(opts, dataHandler) {
        var pins = opts.pins || [],
          sensitivity, resolution,
          state = priv.get(this),
          dataPoints = {};

        if (opts.sensitivity === undefined) {
          throw new Error("Expected a Sensitivity");
        }

        // 4.88mV / (0.167mV/dps * 2)
        // 0.67 = 4X
        // 0.167 = 1X
        sensitivity = opts.sensitivity;
        resolution = opts.resolution || 4.88;
        state.K = resolution / sensitivity;

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
    toNormal: {
      value: function(raw) {
        return raw >> 2;
      }
    },
    toDegreesPerSecond: {
      value: function(raw, rawCenter) {
        var normal = this.toNormal(raw);
        var center = this.toNormal(rawCenter);
        var state = priv.get(this);

        return ((normal - center) * state.K) | 0;
      }
    }
  },
  // http://www.invensense.com/mems/gyro/mpu6050.html
  // Default to the +- 250 which has a 131 LSB/dps
  MPU6050: {
    initialize: {
      value: function(opts, dataHandler) {
        var IMU = require("./imu");
        var state = priv.get(this),
          driver = IMU.Drivers.get(this.board, "MPU6050", opts);

        state.sensitivity = opts.sensitivity || 131;

        driver.on("data", function(data) {
          dataHandler(data.gyro);
        });
      }
    },
    toNormal: {
      value: function(raw) {
        return (raw >> 11) + 127;
      }
    },
    toDegreesPerSecond: {
      value: function(raw, rawCenter) {
        var state = priv.get(this);

        return (raw - rawCenter) / state.sensitivity;
      }
    }
  },
  BNO055: {
    initialize: {
      value: function(opts, dataHandler) {
        var IMU = require("./imu");
        var state = priv.get(this),
          driver = IMU.Drivers.get(this.board, "BNO055", opts);

        // AF p.14, OUTPUT SIGNAL GYROSCOPE, set this to 16 as according to AF.51 the default for the unit register
        // is degrees. and there may be a bug in the Ada fruit code as it has the setting to radians disabled
        // but the sensitivity / scale set to 900 which is used for radian reps
        state.sensitivity = 16;

        driver.on("data", function(data) {
          dataHandler(data.gyro);
        });
      }
    },
    toNormal: {
      value: function(raw) {
        return raw;
      }
    },
    toDegreesPerSecond: {
      value: function(raw) {
        var state = priv.get(this);
        return raw / state.sensitivity;
      }
    }
  },
};

// Otherwise known as...
Controllers["MPU-6050"] = Controllers.MPU6050;

function Gyro(opts) {
  if (!(this instanceof Gyro)) {
    return new Gyro(opts);
  }

  var controller = null;
  var isCalibrated = false;
  var sampleSize = 100;

  var state = {
    x: {
      angle: 0,
      value: 0,
      previous: 0,
      calibration: [],
      stash: [0, 0, 0, 0, 0],
      center: 0,
      hasValue: false
    },
    y: {
      angle: 0,
      value: 0,
      previous: 0,
      calibration: [],
      stash: [0, 0, 0, 0, 0],
      center: 0,
      hasValue: false
    },
    z: {
      angle: 0,
      value: 0,
      previous: 0,
      calibration: [],
      stash: [0, 0, 0, 0, 0],
      center: 0,
      hasValue: false
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
    controller = Controllers.ANALOG;
  }

  Board.Controller.call(this, controller, opts);

  if (!this.toNormal) {
    this.toNormal = opts.toNormal || function(raw) {
      return raw;
    };
  }

  if (!this.toDegreesPerSecond) {
    this.toDegreesPerSecond = opts.toDegreesPerSecond || function(raw) {
      return raw;
    };
  }

  priv.set(this, state);

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      var isChange = false;

      Object.keys(data).forEach(function(axis) {
        var value = data[axis];
        var sensor = state[axis];

        sensor.previous = sensor.value;
        sensor.stash.shift();
        sensor.stash.push(value);
        sensor.hasValue = true;
        sensor.value = (sum(sensor.stash) / 5) | 0;

        if (!isCalibrated &&
          (state.x.calibration.length === sampleSize &&
            state.y.calibration.length === sampleSize &&
            (this.z === undefined || state.z.calibration.length === sampleSize))) {

          isCalibrated = true;
          state.x.center = (sum(state.x.calibration) / sampleSize) | 0;
          state.y.center = (sum(state.y.calibration) / sampleSize) | 0;
          state.z.center = (sum(state.z.calibration) / sampleSize) | 0;

          state.x.calibration.length = 0;
          state.y.calibration.length = 0;
          state.z.calibration.length = 0;
        } else {
          if (sensor.calibration.length < sampleSize) {
            sensor.calibration.push(value);
          }
        }

        if (sensor.previous !== sensor.value) {
          isChange = true;
        }
      }, this);

      if (isCalibrated) {
        state.x.angle += this.rate.x / 100;
        state.y.angle += this.rate.y / 100;
        state.z.angle += this.rate.z / 100;

        this.emit("data", {
          x: this.x,
          y: this.y,
          z: this.z
        });

        if (isChange) {
          this.emit("change", {
            x: this.x,
            y: this.y,
            z: this.z
          });
        }
      }
    }.bind(this));
  }

  Object.defineProperties(this, {
    isCalibrated: {
      get: function() {
        return isCalibrated;
      },
      set: function(value) {
        if (typeof value === "boolean") {
          isCalibrated = value;
        }
      }
    },
    pitch: {
      get: function() {
        return {
          rate: ToFixed(this.rate.y, 2),
          angle: ToFixed(state.y.angle, 2)
        };
      }
    },
    roll: {
      get: function() {
        return {
          rate: ToFixed(this.rate.x, 2),
          angle: ToFixed(state.x.angle, 2)
        };
      }
    },
    yaw: {
      get: function() {
        return {
          rate: this.z !== undefined ? ToFixed(this.rate.z, 2) : 0,
          angle: this.z !== undefined ? ToFixed(state.z.angle, 2) : 0
        };
      }
    },
    x: {
      get: function() {
        return ToFixed(this.toNormal(state.x.value), 4);
      }
    },
    y: {
      get: function() {
        return ToFixed(this.toNormal(state.y.value), 4);
      }
    },
    z: {
      get: function() {
        return state.z.hasValue ? ToFixed(this.toNormal(state.z.value), 4) : undefined;
      }
    },
    rate: {
      get: function() {
        var x = this.toDegreesPerSecond(state.x.value, state.x.center);
        var y = this.toDegreesPerSecond(state.y.value, state.y.center);
        var z = state.z.hasValue ?
          this.toDegreesPerSecond(state.z.value, state.z.center) : 0;

        return {
          x: ToFixed(x, 2),
          y: ToFixed(y, 2),
          z: ToFixed(z, 2)
        };
      }
    }
  });
}

Object.defineProperties(Gyro, {
  TK_4X: {
    value: 0.67
  },
  TK_1X: {
    value: 0.167
  }
});


util.inherits(Gyro, events.EventEmitter);

Gyro.prototype.recalibrate = function() {
  this.isCalibrated = false;
};

module.exports = Gyro;
