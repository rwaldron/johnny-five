var Board = require("./board");
var events = require("events");
var util = require("util");
var Fn = require("./fn");

var constrain = Fn.constrain;
var fma = Fn.fma;
var int16 = Fn.int16;
var sum = Fn.sum;
var toFixed = Fn.toFixed;

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
        var IMU = require("./imu");
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
  BNO055: {
    initialize: {
      value: function(opts, dataHandler) {
        var IMU = require("./imu");
        var driver = IMU.Drivers.get(this.board, "BNO055", opts);
        var state = priv.get(this);

        // AF p.31, Table 3-17: Accelerometer Unit settings
        state.sensitivity = 100;

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

  // http://www.analog.com/media/en/technical-documentation/data-sheets/ADXL345.pdf
  ADXL345: {
    ADDRESSES: {
      value: [0x53]
    },
    REGISTER: {
      value: {
        // Page 23
        // REGISTER MAP
        //
        POWER: 0x2D,
        // 0x31 49 DATA_FORMAT R/W 00000000 Data format control
        DATA_FORMAT: 0x31,
        // 0x32 50 DATAX0 R 00000000 X-Axis Data 0
        DATAX0: 0x32
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var READLENGTH = 6;
        var address = opts.address || this.ADDRESSES[0];
        var state = priv.get(this);

        opts.address = address;

        this.io.i2cConfig(opts);

        // Standby mode
        this.io.i2cWrite(address, this.REGISTER.POWER, 0);

        // Enable measurements
        this.io.i2cWrite(address, this.REGISTER.POWER, 8);

        /*

          Page 26

          Register 0x31—DATA_FORMAT (Read/Write)

          | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
          | - | - | - | - | - | - | - | - |
          | T | S | I | - | F | J | R     |

          T: SELF_TEST
          S: SPI
          I: INT_INVERT
          -:-
          F: FULL_RES
          J: JUSTIFY
          R: RANGE

          Range notes: https://github.com/rwaldron/johnny-five/issues/1135#issuecomment-219541346

          +/- 16g  0b11
          +/- 8g   0b10
          +/- 4g   0b01
          +/- 2g   0b00


          Start with FULL_RES bit on

          0b00001000 = 0x08 = 8
        */
        var format = 0x08;

        /*
          Determine range

          0b00000000 = 0 = ±2g
          0b00000001 = 1 = ±4g
          0b00000010 = 2 = ±8g
          0b00000011 = 3 = ±16g
        */
        var range = ({ 2: 0, 4: 1, 8: 2, 16: 3 })[opts.range || 2];

        /*
          Page 4
          Sensitivity at             XOUT  YOUT ZOUT
          ±2 g, 10-bit resolution     230   256  282
          ±4 g, 10-bit resolution     115   128  141
          ±8 g, 10-bit resolution      57    64   71
          ±16 g, 10-bit resolution     29    32   35
        */
        state.sensitivity = [{
          x: 230,
          y: 256,
          z: 282
        }, {
          x: 115,
          y: 128,
          z: 141
        }, {
          x: 57,
          y: 64,
          z: 71
        }, {
          x: 29,
          y: 32,
          z: 35
        }][range];


        // Merge the format and range bits to set the DATA_FORMAT
        this.io.i2cWrite(address, this.REGISTER.DATA_FORMAT, format | range);

        this.io.i2cRead(address, this.REGISTER.DATAX0, READLENGTH, function(data) {
          dataHandler({
            x: int16(data[1], data[0]),
            y: int16(data[3], data[2]),
            z: int16(data[5], data[4])
          });
        });
      },
    },
    toGravity: {
      value: function(raw, axis) {
        var state = priv.get(this);
        return raw / state.sensitivity[axis];
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
  MMA7660: {
    ADDRESSES: {
      value: [0x4C]
    },
    REGISTER: {
      value: {
        READREGISTER: 0x00,
        RATE: 0x08,
        MODE: 0x07,
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var READLENGTH = 3;
        var address = opts.address || this.ADDRESSES[0];
        var state = priv.get(this);

        state.sensitivity = 21.33;

        opts.address = address;

        this.io.i2cConfig(opts);

        // http://www.freescale.com.cn/files/sensors/doc/data_sheet/MMA7660FC.pdf?fpsp=1
        //
        // Standby mode
        this.io.i2cWrite(address, this.REGISTER.MODE, 0x00);

        // Sample Rate ()
        this.io.i2cWrite(address, this.REGISTER.RATE, 0x07);

        // Active Mode
        this.io.i2cWrite(address, this.REGISTER.MODE, 0x01);

        this.io.i2cRead(address, this.REGISTER.READREGISTER, READLENGTH, function(data) {
          dataHandler.call(this, {
            // Shift off the sign bits
            // This solution is used in
            // https://github.com/intel-iot-devkit/upm/blob/master/src/mma7660/mma7660.cxx
            x: (data[0] << 2) / 4,
            y: (data[1] << 2) / 4,
            z: (data[2] << 2) / 4,
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
Controllers.TINKERKIT = Controllers.ANALOG;
Controllers.MMA8452Q = Controllers.MMA8452;

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

  Board.Controller.call(this, controller, opts);

  if (!this.toGravity) {
    this.toGravity = opts.toGravity || function(raw) {
      return raw;
    };
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

          state.zeroV[axisIndex] = sum(sensor.calibration) / sensor.calibration.length;
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

        return toFixed(rads * rad2deg, 2);
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

        return toFixed(rads * rad2deg, 2);
      }
    },
    x: {
      get: function() {
        return toFixed(this.toGravity(state.x.value, "x"), 2);
      }
    },
    y: {
      get: function() {
        return toFixed(this.toGravity(state.y.value, "y"), 2);
      }
    },
    z: {
      get: function() {
        return this.hasAxis("z") ?
          toFixed(this.toGravity(state.z.value, "z"), 2) : 0;
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
