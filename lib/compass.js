var Board = require("./board");
var Emitter = require("events").EventEmitter;
var util = require("util");
var Fn = require("./fn");
var int16 = Fn.int16;
var TAU = Fn.TAU;

var priv = new Map();

var Controllers = {

  HMC5883L: {
    REGISTER: {
      value: {
        // Page 11
        // Table 2: Register List
        //
        // Configuration Register A
        CRA: 0x00,
        // Configuration Register B
        // This may change, depending on gauss
        CRB: 0x01,
        // Mode Register
        MODE: 0x02,
        // Data Output X MSB Register
        READ: 0x03,
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);
        var address = opts.address || 0x1E;
        var READLENGTH = 6;

        state.scale = 1;

        Object.assign(state, new Compass.Scale(opts.gauss || 0.88));

        opts.address = address;

        this.io.i2cConfig(opts);

        // Page 18
        // OPERATIONAL EXAMPLES...
        //
        // 1. Write CRA (00) – send 0x3C 0x00 0x70 (8-average, 15 Hz default, normal measurement)
        //
        // Set CRA
        // Page 12
        this.io.i2cWrite(address, this.REGISTER.CRA, 0x70);

        // Set CRB
        // Page 13
        this.io.i2cWrite(address, this.REGISTER.CRB, 0x40);

        // Page 14
        // Measurement: Continuous
        this.io.i2cWrite(address, this.REGISTER.MODE, 0x00);

        this.io.i2cRead(address, this.REGISTER.READ, READLENGTH, function(bytes) {
          dataHandler({
            x: int16(bytes[0], bytes[1]),
            y: int16(bytes[4], bytes[5]),
            z: int16(bytes[2], bytes[3]),
          });
        });
      }
    },
    toScaledHeading: {
      value: function(raw) {
        var state = priv.get(this);

        return ToHeading(raw.x * state.scale, raw.y * state.scale);
      }
    }
  },

  /**
   * HMC6352: 2-Axis Compass Module
   * 0x42
   *
   * http://bildr.org/2011/01/hmc6352/
   */
  HMC6352: {
    REGISTER: {
      value: {
        READ: 0x41
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);
        var address = opts.address || 0x21;
        var READLENGTH = 2;

        state.scale = 1;

        opts.delay = 10;
        opts.address = address;

        this.io.i2cConfig(opts);

        this.io.i2cWrite(address, this.REGISTER.READ);

        // Initialize continuous read
        this.io.i2cRead(address, this.REGISTER.READ, READLENGTH, function(bytes) {
          dataHandler({
            x: (((bytes[0] << 8) + bytes[1]) / 10) | 0,
            y: null,
            z: null,
          });
        });
      }
    },
    toScaledHeading: {
      value: function(raw) {
        var state = priv.get(this);
        return raw.x * state.scale;
      },
    },
  },

  BNO055: {
    initialize: {
      value: function(opts, dataHandler) {
        var IMU = require("./imu");
        var driver = IMU.Drivers.get(this.board, "BNO055", opts);
        var state = priv.get(this);

        // AF p.32, Table 3-19: Magnetometer Unit settings
        state.sensitivity = 16;

        driver.on("data", function(data) {
          dataHandler(data.magnetometer);
        });
      }
    },
    toScaledHeading: {
      value: function(raw) {
        var state = priv.get(this);

        var x = raw.x / state.sensitivity;
        var y = raw.y / state.sensitivity;

        return ToHeading(x, y);
      },
    },
  },

  // http://www.nxp.com/files/sensors/doc/data_sheet/MAG3110.pdf
  MAG3110: {
    REGISTER: {
      value: {
        // Page 15
        // Table 11 Register Address Map
        // DR_STATUS
        STATUS: 0x00,
        // OUT_X_MSB
        READ: 0x01,
        // OFF_X_MSB
        OFFSETS: 0x09,
        // CTRL_REG1
        CTRL_REG1: 0x10,
        // CTRL_REG2
        CTRL_REG2: 0x11,
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);

        // MAG3110 has only one possible address
        var address = 0x0E;
        var isDataPending = false;
        var temp;

        state.isCalibrated = false;
        state.isPreCalibrated = false;
        state.hasEmittedCalibration = false;
        state.measurements = 20;

        state.offsets = {
          x: 0,
          y: 0,
          z: 0,
        };
        state.accum = {
          x: { offset: null, high: 0, low: 0 },
          y: { offset: null, high: 0, low: 0 },
          z: { offset: null, high: 0, low: 0 },
        };
        opts.delay = 2;
        opts.address = address;

        if (opts.offsets) {
          state.isCalibrated = true;
          state.isPreCalibrated = true;

          if (Array.isArray(opts.offsets)) {
            temp = opts.offsets.slice();
            opts.offsets = {
              x: temp[0],
              y: temp[1],
              z: temp[2],
            };
          }

          state.accum.x.low = opts.offsets.x[0];
          state.accum.x.high = opts.offsets.x[1];
          state.accum.x.offset = (state.accum.x.low + state.accum.x.high) / 2;

          state.accum.y.low = opts.offsets.y[0];
          state.accum.y.high = opts.offsets.y[1];
          state.accum.y.offset = (state.accum.y.low + state.accum.y.high) / 2;

          state.accum.z.low = opts.offsets.z[0];
          state.accum.z.high = opts.offsets.z[1];
          state.accum.z.offset = (state.accum.z.low + state.accum.z.high) / 2;
        }

        /*
          Page 14
          4.2.7 MAG3110 Setup Examples

          Continuous measurements with ODR = 80 Hz, OSR = 1

          1. Enable automatic magnetic sensor resets by setting bit AUTO_MRST_EN in CTRL_REG2.
            (CTRL_REG2 = 0x80)
          2. Put MAG3110 in active mode 80 Hz ODR with OSR = 1 by writing 0x01 to CTRL_REG1
            (CTRL_REG1 = 0x01)
          3. At this point it is possible to sync with MAG3110 utilizing INT1 pin or
              using polling of the DR_STATUS register as explained in section 4.2.5.
        */

        this.io.i2cConfig(opts);
        /*
          Page 21
          5.5.2 CTRL_REG2 (0x11)
          Table 33.
          CTRL_REG2 Register

          | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
          |---|---|---|---|---|---|---|---|
          | A |   | R | M |   |   |   |   |

          A: Automatic Magnetic Sensor Reset. Default value: 0.
          R: Data output correction. Default value: 0.
          M: Magnetic Sensor Reset (One-Shot). Default value: 0.

          | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
          |---|---|---|---|---|---|---|---|
          | 1 |   | 0 | 0 |   |   |   |   |

          0b10000000 = 128 = 0x80

          RAW
          0b10100000 = 160 = 0xA0
        */
        this.io.i2cWrite(address, this.REGISTER.CTRL_REG2, 0x80);
        // this.io.i2cWrite(address, this.REGISTER.CTRL_REG2, 0xA0);

        /*
          Page 20
          5.5.1 CTRL_REG1 (0x10)
          Table 30. CTRL_REG1 Register
          | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
          |---|---|---|---|---|---|---|---|
          |DR2|DR1|DR0|OS1|OS0|FR |TM |AC |

          See Table 31. CTRL_REG1 Description for complete descriptions

          (Active mode, 80Hz)

          | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
          |---|---|---|---|---|---|---|---|
          | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |

          0b00000001 = 1 = 0x01
        */
        this.io.i2cWrite(address, this.REGISTER.CTRL_REG1, 0x01);

        var measured = {
          x: 0,
          y: 0,
          z: 0,
        };

        var readCycle = function() {
          this.io.i2cReadOnce(address, this.REGISTER.STATUS, 1, function(data) {
            /*
              Page 16
              5.1.1 DR_STATUS (0x00)

              Table 12
              | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
              |---|---|---|---|---|---|---|---|
              |OVR|ZOW|XOW|YOW|DR |ZDR|YDR|XDR|

              Table 13
              (Contains Complete descriptions)

              OVR (ZYXOW) (X, Y, Z-axis Data Overwrite. Default value: 0.)
                0: No Data overwritten
                1: Previous X, Y, Z has been overwritten

              ZOW, YOW, XOW:
                0: No Data overwritten
                1: Previous X, Y, Z has been overwritten

              DR (ZYXDR) (X or Y or Z-axis new Data Ready. Default value: 0.)
                0: No new data is ready
                1: New full set of data is ready

              ZDR, YDR, XDR:
                0: No new data is ready
                1: New X, Y, Z data is ready

              | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
              |---|---|---|---|---|---|---|---|
              | 0 | 0 | 0 | 0 | 1 | 1 | 1 | 1 |


              0b00001111 = 15 = 0x0F: A complete set of axis data is available

              0b11111111 = 255 = 0xFF: All data is newly written

            */
            if (!isDataPending && (data[0] === 0x0F || data[0] === 0xFF)) {
              isDataPending = true;

              this.io.i2cReadOnce(address, this.REGISTER.READ, 6, function(bytes) {
                var timeout = 0;

                isDataPending = false;

                measured.x = int16(bytes[0], bytes[1]);
                measured.y = int16(bytes[2], bytes[3]);
                measured.z = int16(bytes[4], bytes[5]);

                if (!state.isCalibrated) {

                  if (state.accum.x.offset === null) {
                    state.accum.x.offset = measured.x;
                    state.accum.x.low = measured.x;
                    state.accum.x.high = measured.x;
                  }

                  if (state.accum.y.offset === null) {
                    state.accum.y.offset = measured.y;
                    state.accum.y.low = measured.y;
                    state.accum.y.high = measured.y;
                  }

                  state.accum.x.low = Math.min(state.accum.x.low, measured.x);
                  state.accum.x.high = Math.max(state.accum.x.high, measured.x);
                  state.accum.x.offset = Math.trunc((state.accum.x.low + state.accum.x.high) / 2);

                  state.accum.y.low = Math.min(state.accum.y.low, measured.y);
                  state.accum.y.high = Math.max(state.accum.y.high, measured.y);
                  state.accum.y.offset = Math.trunc((state.accum.y.low + state.accum.y.high) / 2);

                  state.accum.z.low = Math.min(state.accum.z.low, measured.z);
                  state.accum.z.high = Math.max(state.accum.z.high, measured.z);
                  state.accum.z.offset = Math.trunc((state.accum.z.low + state.accum.z.high) / 2);

                  --state.measurements;

                  if (!state.measurements) {
                    state.isCalibrated = true;
                  }
                }

                if (state.isCalibrated) {
                  if (!state.hasEmittedCalibration) {
                    state.hasEmittedCalibration = true;

                    state.offsets.x = state.accum.x.offset;
                    state.offsets.y = state.accum.y.offset;
                    state.offsets.z = state.accum.z.offset;

                    this.io.i2cWrite(address, this.REGISTER.OFFSETS, [
                      state.offsets.x >> 7, (state.offsets.x << 1) & 0xFF,
                      state.offsets.y >> 7, (state.offsets.y << 1) & 0xFF,
                      state.offsets.z >> 7, (state.offsets.z << 1) & 0xFF,
                    ]);

                    this.emit("calibrated", {
                      x: [state.accum.x.low, state.accum.x.high],
                      y: [state.accum.y.low, state.accum.y.high],
                      z: [state.accum.z.low, state.accum.z.high],
                    });
                  }

                  timeout = Math.floor(1000 / 80);

                  dataHandler(measured);
                }

                // MAG3110 is set to read at 80Hz (do this after calibration)
                setTimeout(readCycle, timeout);
              }.bind(this));
            } else {
              readCycle();
            }
          }.bind(this));
        }.bind(this);

        readCycle();
      }
    },
    calibrate: {
      value: function(measurements) {
        var state = priv.get(this);

        state.isCalibrated = false;
        state.measurements = measurements;
      }
    },
    toScaledHeading: {
      value: function(raw) {
        var state = priv.get(this);
        var scale = {
          x: 1 / (state.accum.x.high - state.accum.x.low),
          y: 1 / (state.accum.y.high - state.accum.y.low),
        };

        var heading = Math.atan2(-raw.y * scale.y, raw.x * scale.x);

        if (heading < 0) {
          heading += TAU;
        }

        return Math.trunc(heading * Fn.RAD_TO_DEG);
      },
    },
  },

  /**
   * LSM303C: 6Dof 3-Axis Magnetometer & Accelerometer
   *
   * https://learn.sparkfun.com/tutorials/lsm303c-6dof-hookup-guide
   * https://github.com/sparkfun/LSM303C_6_DOF_IMU_Breakout
   */
  LSM303C: {
    initialize: {
      value: function(opts, dataHandler) {
        var IMU = require("./imu");
        var driver = IMU.Drivers.get(this.board, "LSM303C", opts);

        driver.on("data", function(data) {
          dataHandler(data.magnetometer);
        });
      }
    },
    toScaledHeading: {
      value: function(raw) {
        return ToHeading(raw.x, raw.y);
      },
    },
  },
};


/**
 * Compass
 * @constructor
 *
 * five.Compass();
 *
 * five.Compass({
 *  controller: "HMC5883L",
 *  freq: 50,
 * });
 *
 *
 * Device Shorthands:
 *
 * "HMC5883L": new five.Magnetometer()
 *
 *
 * @param {Object} opts [description]
 *
 */

function Compass(opts) {

  if (!(this instanceof Compass)) {
    return new Compass(opts);
  }

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  var freq = opts.freq || 25;
  var controller = null;
  var raw = {
    x: null,
    y: null,
    z: null,
  };
  var state = {
    x: 0,
    y: 0,
    z: 0,
    scale: 0,
    register: 0,
    heading: 0
  };

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    throw new Error("Compass expects a valid controller");
  }

  Board.Controller.call(this, controller, opts);

  if (!this.toScaledHeading) {
    this.toScaledHeading = opts.toScaledHeading || function(raw) {
      return raw;
    };
  }

  priv.set(this, state);

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      raw = data;
    });
  }

  setInterval(function() {
    if (raw.x === null) {
      return;
    }
    var isChange = false;

    state.x = raw.x;
    state.y = raw.y;
    state.z = raw.z;

    var heading = this.heading;

    if (heading !== state.heading) {
      state.heading = heading;
      isChange = true;
    }

    this.emit("data", {
      heading: state.heading
    });

    if (isChange) {
      this.emit("change", {
        heading: state.heading
      });
    }
  }.bind(this), freq);

  Object.defineProperties(this, {
    /**
     * [read-only] Bearing information
     * @name bearing
     * @property
     * @type Object
     *
     *
        name
        abbr
        low
        mid
        high
        heading
     *
     */

    bearing: {
      get: function() {
        var length = Compass.Points.length;
        var heading = this.heading;
        var point;

        for (var i = 0; i < length; i++) {
          point = Compass.Points[i];

          if (heading >= point.low && heading <= point.high) {
            // Specify fields to return to avoid returning the
            // range array (too much noisy data)
            return {
              name: point.name,
              abbr: point.abbr,
              low: point.low,
              high: point.high,
              heading: heading
            };
          }
        }
      }
    },

    /**
     * [read-only] Raw X/Y/Z
     * @name raw
     * @property
     * @type Object
     *
        x
        y
        z
     */
    raw: {
      get: function() {
        return {
          x: raw.x,
          y: raw.y,
          z: raw.z
        };
      }
    },

    /**
     * [read-only] Heading (azimuth)
     * @name heading
     * @property
     * @type number
     */
    heading: {
      get: function() {
        return this.toScaledHeading(raw);
      }
    }
  });
}


util.inherits(Compass, Emitter);

function ToHeading(x, y) {
  /**
   *
   * Applications of Magnetoresistive Sensors in Navigation Systems
   * by Michael J. Caruso of Honeywell Inc.
   * http://www.ssec.honeywell.com/position-sensors/datasheets/sae.pdf
   *
   *
   * Azimuth (x=0, y<0)   = 90.0 (3)
   * Azimuth (x=0, y>0)   = 270.0
   * Azimuth (x<0)        = 180 - [arcTan(y/x)]*180/PI
   * Azimuth (x>0, y<0)   = - [arcTan(y/x)]*180/PI
   * Azimuth (x>0, y>0)   = 360 - [arcTan(y/x)]*180/PI
   */
  /**
   * http://bildr.org/2012/02/hmc5883l_arduino/
   * @type {[type]}
   * Copyright (C) 2011 Love Electronics (loveelectronics.co.uk)

   This program is free software: you can redistribute it and/or modify it under the terms of the version 3 GNU General Public License as published by the Free Software Foundation.

   This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

   You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.

   */

  var radians = Math.atan2(y, x);

  if (radians < 0) {
    radians += TAU;
  }

  if (radians > TAU) {
    radians -= TAU;
  }

  return radians * Fn.RAD_TO_DEG;
}


/**
 * Compass.scale Set the scale gauss for compass readings
 * @param  {Number} gauss [description]
 * @return {register}       [description]
 *
 * Ported from:
 * http://bildr.org/2012/02/hmc5883l_arduino/
 */

Compass.Scale = function(gauss) {

  if (gauss === 0.88) {
    this.register = 0x00;
    this.scale = 0.73;
  } else if (gauss === 1.3) {
    this.register = 0x01;
    this.scale = 0.92;
  } else if (gauss === 1.9) {
    this.register = 0x02;
    this.scale = 1.22;
  } else if (gauss === 2.5) {
    this.register = 0x03;
    this.scale = 1.52;
  } else if (gauss === 4.0) {
    this.register = 0x04;
    this.scale = 2.27;
  } else if (gauss === 4.7) {
    this.register = 0x05;
    this.scale = 2.56;
  } else if (gauss === 5.6) {
    this.register = 0x06;
    this.scale = 3.03;
  } else if (gauss === 8.1) {
    this.register = 0x07;
    this.scale = 4.35;
  } else {
    this.register = 0x00;
    this.scale = 1;
  }

  // Setting is in the top 3 bits of the register.
  this.register = this.register << 5;
};


/**
 * Compass.Points
 *
 * 32 Point Compass
 * +1 for North
 *
 */

Compass.Points = [{
  name: "North",
  abbr: "N",
  low: 354.38,
  high: 360
}, {
  name: "North",
  abbr: "N",
  low: 0,
  high: 5.62
}, {
  name: "North by East",
  abbr: "NbE",
  low: 5.63,
  high: 16.87
}, {
  name: "North-NorthEast",
  abbr: "NNE",
  low: 16.88,
  high: 28.12
}, {
  name: "NorthEast by North",
  abbr: "NEbN",
  low: 28.13,
  high: 39.37
}, {
  name: "NorthEast",
  abbr: "NE",
  low: 39.38,
  high: 50.62
}, {
  name: "NorthEast by East",
  abbr: "NEbE",
  low: 50.63,
  high: 61.87
}, {
  name: "East-NorthEast",
  abbr: "ENE",
  low: 61.88,
  high: 73.12
}, {
  name: "East by North",
  abbr: "EbN",
  low: 73.13,
  high: 84.37
}, {
  name: "East",
  abbr: "E",
  low: 84.38,
  high: 95.62
}, {
  name: "East by South",
  abbr: "EbS",
  low: 95.63,
  high: 106.87
}, {
  name: "East-SouthEast",
  abbr: "ESE",
  low: 106.88,
  high: 118.12
}, {
  name: "SouthEast by East",
  abbr: "SEbE",
  low: 118.13,
  high: 129.37
}, {
  name: "SouthEast",
  abbr: "SE",
  low: 129.38,
  high: 140.62
}, {
  name: "SouthEast by South",
  abbr: "SEbS",
  low: 140.63,
  high: 151.87
}, {
  name: "South-SouthEast",
  abbr: "SSE",
  low: 151.88,
  high: 163.12
}, {
  name: "South by East",
  abbr: "SbE",
  low: 163.13,
  high: 174.37
}, {
  name: "South",
  abbr: "S",
  low: 174.38,
  high: 185.62
}, {
  name: "South by West",
  abbr: "SbW",
  low: 185.63,
  high: 196.87
}, {
  name: "South-SouthWest",
  abbr: "SSW",
  low: 196.88,
  high: 208.12
}, {
  name: "SouthWest by South",
  abbr: "SWbS",
  low: 208.13,
  high: 219.37
}, {
  name: "SouthWest",
  abbr: "SW",
  low: 219.38,
  high: 230.62
}, {
  name: "SouthWest by West",
  abbr: "SWbW",
  low: 230.63,
  high: 241.87
}, {
  name: "West-SouthWest",
  abbr: "WSW",
  low: 241.88,
  high: 253.12
}, {
  name: "West by South",
  abbr: "WbS",
  low: 253.13,
  high: 264.37
}, {
  name: "West",
  abbr: "W",
  low: 264.38,
  high: 275.62
}, {
  name: "West by North",
  abbr: "WbN",
  low: 275.63,
  high: 286.87
}, {
  name: "West-NorthWest",
  abbr: "WNW",
  low: 286.88,
  high: 298.12
}, {
  name: "NorthWest by West",
  abbr: "NWbW",
  low: 298.13,
  high: 309.37
}, {
  name: "NorthWest",
  abbr: "NW",
  low: 309.38,
  high: 320.62
}, {
  name: "NorthWest by North",
  abbr: "NWbN",
  low: 320.63,
  high: 331.87
}, {
  name: "North-NorthWest",
  abbr: "NNW",
  low: 331.88,
  high: 343.12
}, {
  name: "North by West",
  abbr: "NbW",
  low: 343.13,
  high: 354.37
}];

Object.freeze(Compass.Points);

/**
 * Fires once every N ms, equal to value of `freq`. Defaults to 66ms
 *
 * @event
 * @name read
 * @memberOf Compass
 */


/**
 * Fires when the calculated heading has changed
 *
 * @event
 * @name headingchange
 * @memberOf Compass
 */


/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Compass.Controllers = Controllers;
  Compass.purge = function() {
    priv.clear();
  };
}

module.exports = Compass;
