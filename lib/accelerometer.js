const Board = require("./board");
const Expander = require("./expander");
const Emitter = require("events");
const { constrain, fma, int16, sum, toFixed, RAD_TO_DEG } = require("./fn");

const priv = new Map();
const calibrationSize = 10;

const aX = "x";
const aY = "y";
const aZ = "z";
const axes = [aX, aY, aZ];

function analogInitialize({zeroV, sensitivity}, callback) {
  const state = priv.get(this);
  const dataPoints = {};

  state.zeroV = zeroV || this.DEFAULTS.zeroV;
  state.sensitivity = sensitivity || this.DEFAULTS.sensitivity;

  this.pins.forEach(function(pin, index) {
    this.io.pinMode(pin, this.io.MODES.ANALOG);
    this.io.analogRead(pin, data => {
      const axis = axes[index];
      dataPoints[axis] = data;
      callback(dataPoints);
    });
  }, this);
}

function analogToGravity(value, axis) {
  const state = priv.get(this);
  let zeroV = state.zeroV;

  if (Array.isArray(zeroV) && zeroV.length > 0) {
    const axisIndex = axes.indexOf(axis);
    zeroV = zeroV[axisIndex || 0];
  }

  return (value - zeroV) / state.sensitivity;
}

const Controllers = {
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
  MPU6050: {
    initialize: {
      value(options, callback) {
        const state = priv.get(this);
        state.sensitivity = options.sensitivity || 16384;
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "MPU6050", options)
          .on("data", ({accelerometer}) => callback(accelerometer));
      }
    },
    toGravity: {
      value(value) {
        // Table 6.2 (Accelerometer specifications)
        // Sensitivity for AFS_SEL=0
        // Full scale range +- 2g
        // ADC word length 16 bit 2's complement
        // 16384 LSB/g = 0.000061035 g/LSB = 0.061035156 mg/LSB
        // Returing a decimal part fixed at 3 digits,
        // not sure if this assumption is correct
        // (approximating to 0.061 mg/LSB)
        return toFixed(value / priv.get(this).sensitivity, 3);
      }
    }
  },
  BNO055: {
    initialize: {
      value(options, callback) {
        const state = priv.get(this);
        // Page 31, Table 3-17
        state.sensitivity = 100;
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "BNO055", options)
          .on("data", ({accelerometer}) => callback(accelerometer));
      }
    },
    toGravity: {
      value(value) {
        // Page 31, Table 3-17
        // Assuming that the the `m/s^2` representation is used given that `state.sensitvity = 100`
        // 1m/s^2 = 100LSB -> 1LSB = 0.01m/s^2
        return toFixed(value / priv.get(this).sensitivity, 2);
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
      value(value, axis) {
        // Page 3, Table 1
        // Typical range +- 3.6g
        // Sensitivity: 300mV/g
        // MaxSensitvity: 330mv/g
        return toFixed(analogToGravity.call(this, value, axis), 3);
      }
    }
  },

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
      value(options, callback) {
        const { Drivers } = require("./sip");
        const address = Drivers.addressResolver(this, options);
        const READLENGTH = 6;

        this.io.i2cConfig(options);

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
        const format = 0x08;

        /*
          Determine range

          0b00000000 = 0 = ±2g
          0b00000001 = 1 = ±4g
          0b00000010 = 2 = ±8g
          0b00000011 = 3 = ±16g
        */
        const range = ({
          2: 0,
          4: 1,
          8: 2,
          16: 3
        })[options.range || 2];

        // Merge the format and range bits to set the DATA_FORMAT
        this.io.i2cWrite(address, this.REGISTER.DATA_FORMAT, format | range);

        this.io.i2cRead(address, this.REGISTER.DATAX0, READLENGTH, data => {
          callback({
            x: int16(data[1], data[0]),
            y: int16(data[3], data[2]),
            z: int16(data[5], data[4])
          });
        });
      },
    },
    toGravity: {
      value(value) {
        // Page 4, Table 1
        //
        // Sensitivity
        // All g-ranges, full resolution, 256LSB/g, 0.00390625g/LSB
        return toFixed(value * 0.00390625, 8);
      }
    }
  },
  MMA7361: {
    DEFAULTS: {
      value: {
        zeroV: [372, 372, 287],
        sensitivity: 170
      }
    },
    initialize: {
      value(options, callback) {
        const state = priv.get(this);

        /* istanbul ignore else */
        if (options.sleepPin !== undefined) {
          state.sleepPin = options.sleepPin;
          this.io.pinMode(state.sleepPin, 1);
          this.io.digitalWrite(state.sleepPin, 1);
        }

        analogInitialize.call(this, options, callback);
      }
    },
    toGravity: {
      value(value, axis) {
        // Page 3, Table 2
        //
        // Sensitivity
        // 1.5g, 800mV/g
        // 6g, 221.5mV/g
        return toFixed(analogToGravity.call(this, value, axis), 3);
      }
    },
    enabledChanged: {
      value(value) {
        const state = priv.get(this);

        /* istanbul ignore else */
        if (state.sleepPin !== undefined) {
          this.io.digitalWrite(state.sleepPin, value ? 1 : 0);
        }
      }
    }
  },
  MMA8452: {
    ADDRESSES: {
      value: [0x1D]
    },
    REGISTER: {
      value: {
        // Page 18
        // 6. Register Descriptions
        STATUS: 0x00,
        OUT_X_MSB: 0x01,
        XYZ_DATA_CFG: 0x0E,
        PULSE_CFG: 0x21,
        PULSE_SRC: 0x22,
        PULSE_THSX: 0x23,
        PULSE_THSY: 0x24,
        PULSE_THSZ: 0x25,
        PULSE_TMLT: 0x26,
        PULSE_LTCY: 0x27,
        PULSE_WIND: 0x28,
        CTRL_REG1: 0x2A,
        CTRL_REG4: 0x2E,
        CTRL_REG5: 0x2F,
      }
    },
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const address = Drivers.addressResolver(this, options);
        const state = priv.get(this);

        // TODO: make user definable.
        // 0b000 800Hz
        // 0b001 400Hz
        // 0b010 200Hz
        // 0b011 100Hz
        // 0b100 50Hz
        // 0b101 12Hz
        // 0b110 6Hz

        const rates = [800, 400, 200, 100, 50, 12, 6, ];
        const odr = rates.indexOf(options.odr || 800);
        const scale = options.range || 2;
        const fsr = ({
          2: 0,
          4: 1,
          8: 2
        })[scale];

        options.taps = options.taps || {
          x: false,
          y: false,
          z: true,
        };

        const taps = {
          x: options.taps.x ? 0x08 : 0x80,
          y: options.taps.y ? 0x08 : 0x80,
          z: options.taps.z ? 0x08 : 0x80,
        };

        state.scale = scale;

        const computed = {
          x: null,
          y: null,
          z: null,
        };

        this.io.i2cConfig(
          Object.assign(options, {
            settings: {
              stopTX: false
            }
          })
        );

        if (odr === -1) {
          throw new RangeError("Invalid odr. Expected one of: 800,  400,  200,  100,  50,  12,  6");
        }

        /*
          Initial CTRL_REG1 State

          11000010 = 194 = 0xC2 -> ?
          00000010 = 8 = 0x08
          ^--------- ASLP_RATE1
           ^-------- ASLP_RATE0
            ^------- DR2
             ^------ DR1
              ^----- DR0
               ^---- Noise
                ^--- Fast Read
                 ^-- Standby Mode
        */

        let config = 0x08;

        /*
          Page 5 (AN4076)
          4.0 Setting the Data Rate

          Set ODR

          Shift the odr bits into place.

          Default: 800Hz

          11000010 = 194 = 0xC2 -> ?
          00000010 = 8 = 0x08
            ^^^----- DR2, DR1, DR0: 000
        */
        config |= odr << 3;

        /*
          Enter Standby Mode

          11000010 = 194 = 0xC2 -> ?
                ^--- Fast Read
                 ^-- Standby Mode

          00000010 = 8 = 0x08
                ^--- Fast Read
                 ^-- Standby Mode

        */

        this.io.i2cWriteReg(address, this.REGISTER.CTRL_REG1, config);

        /*
          Set FSR

          Default: ±2g

          00000000 = 0 = 0x00 ()
                ^^----- FS1, FS2
        */
        this.io.i2cWriteReg(address, this.REGISTER.XYZ_DATA_CFG, fsr);

        let temp = 0;

        /*
          Page 10 (AN4072)
          4.2 Registers 0x23 - 0x25 PULSE_THSX, Y, Z
              Pulse Threshold for X, Y and Z Registers

          0x80 = B7 is HIGH
          10000000
          If B7 is HIGH, do not enable
        */
        if (!(taps.x & 0x80)) {
          // 00000011
          temp |= 0x03;
          this.io.i2cWriteReg(address, this.REGISTER.PULSE_THSX, taps.x);
        }

        if (!(taps.y & 0x80)) {
          // 00001100
          temp |= 0x0C;
          this.io.i2cWriteReg(address, this.REGISTER.PULSE_THSY, taps.y);
        }

        if (!(taps.z & 0x80)) {
          // 00110000
          temp |= 0x30;
          this.io.i2cWriteReg(address, this.REGISTER.PULSE_THSZ, taps.z);
        }

        /*
          Page 11, 12, 13 (AN4072)

          Configure Tap Axis'

          Table 1. Register 0x21 PULSE_CFG Register (Read/Write) and Description

          | Tap Enable |  7  |  6  |  5  |  4  |  3  |  2  |  1  |  0  |
          | ---------- | --- | --- | --- | --- | --- | --- | --- | --- |
          |            | DPA | ELE | ZD  | ZS  | YD  | YS  | XD  | XS  |
          | Single     |  0  |  1  |  0  |  1  |  0  |  1  |  0  |  1  |
          | Double     |  0  |  1  |  1  |  0  |  1  |  0  |  1  |  0  |
          | Both       |  0  |  1  |  1  |  1  |  1  |  1  |  1  |  1  |


          In the default case, `temp | 0x40` will be:

          01110000 = 112 = 0x70

          Latch On
          ZD On
          ZS On

        */

        this.io.i2cWriteReg(address, this.REGISTER.PULSE_CFG, temp | 0x40);

        /*
          Set TIME LIMIT for tap detection

          60ms / 800Hz = 60ms / 1.25ms = 48 (counts) = 0x30
          80ms / 800Hz = 80ms / 1.25ms = 64 (counts) = 0x40
        */
        this.io.i2cWriteReg(address, this.REGISTER.PULSE_TMLT, 60 / (1000 / rates[odr]));
        /*
          Set the PULSE LATENCY.

          This is the time that must pass after the first
          tap, but within the PULSE WINDOW for a double tap to register.

          200ms / 800Hz = 200ms / 1.25ms = 160 (counts) = 0xA0
        */
        this.io.i2cWriteReg(address, this.REGISTER.PULSE_LTCY, 200 / (1000 / rates[odr]));

        /*
          Set the PULSE WINDOW.

          This is the maximum interval of time to elapse after the latency
          interval, for which the second pulse must occur for double taps.

          The maximum allowed time:

          800Hz * 255 = 1.25ms * 255 = 318ms
        */
        this.io.i2cWriteReg(address, this.REGISTER.PULSE_WIND, 0xFF);

        /*
          Leave Standby Mode

          11000011 = 195 = 0xC3
          00000011 = 3 = 0x03
                ^--- Fast Read
                 ^-- Standby Mode
        */

        config |= 0x01;

        this.io.i2cWriteReg(address, this.REGISTER.CTRL_REG1, config);


        this.io.i2cRead(address, this.REGISTER.STATUS, 7, data => {
          const status = (data.shift() & 0x08) >>> 3;

          /* istanbul ignore else */
          if (status) {
            // Page 9 (AN4076)
            //
            // 7.0 14-bit, 12-bit or 10-bit Data Streaming and Data Conversions
            computed.x = int16(data[0], data[1]) >> 4;
            computed.y = int16(data[2], data[3]) >> 4;
            computed.z = int16(data[4], data[5]) >> 4;

            callback(computed);
          }
        });

        this.io.i2cRead(address, this.REGISTER.PULSE_SRC, 1, data => {
          const status = data[0];
          const tap = status & 0x7F;

          /* istanbul ignore else */
          if (status & 0x80) {
            this.emit("tap");

            // Single Tap
            /* istanbul ignore else */
            if ((tap >> 2) & 0x01) {
              this.emit("tap:single");

              // Double Tap (must be both S and D bits)
              /* istanbul ignore else */
              if ((tap >> 3) & 0x01) {
                this.emit("tap:double");
              }
            }
          }
        });
      },
    },
    toGravity: {
      value(value) {
        //
        // Paragraph 3.1, page 9
        // Sensitivity
        // 2g, 1024 counts/g, 0.000976562g/count
        // 4g, 512 counts/g, 0.001953125g/count
        // 8g, 256 counts/g, 0.00390625g/count
        return toFixed(value / ((1 << 11) * priv.get(this).scale), 4);
      }
    }
  },
  MMA7660: {
    ADDRESSES: {
      value: [0x4C]
    },
    REGISTER: {
      value: {
        XOUT: 0x00,
        MODE: 0x07,
        SR: 0x08,
      }
    },
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const address = Drivers.addressResolver(this, options);
        const READLENGTH = 3;
        const state = priv.get(this);
        state.sensitivity = 21.33;

        this.io.i2cConfig(options);

        //
        // Standby mode
        this.io.i2cWrite(address, this.REGISTER.MODE, 0x00);

        // Sample Rate ()
        this.io.i2cWrite(address, this.REGISTER.SR, 0x07);

        // Active Mode
        this.io.i2cWrite(address, this.REGISTER.MODE, 0x01);

        this.io.i2cRead(address, this.REGISTER.XOUT, READLENGTH, data => {
          callback({
            // Page. 13
            // D7 D6      D5      D4      D3      D2      D1      D0
            // -- -A XOUT[5] XOUT[4] XOUT[3] XOUT[2] XOUT[1] XOUT[0]
            x: data[0] & 0b00111111,
            y: data[1] & 0b00111111,
            z: data[2] & 0b00111111,
          });
        });
      },
    },
    toGravity: {
      value(value) {
        // Page 28
        return toFixed(value / priv.get(this).sensitivity, 3);
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
      value(options, callback) {
        this.pins = [5, 11, 6];
        analogInitialize.call(this, options, callback);
      }
    },
    toGravity: {
      value(value, axis) {
        return toFixed(analogToGravity.call(this, value, axis), 2);
      }
    }
  },

  LIS3DH: {
    ADDRESSES: {
      value: [0x18]
    },
    REGISTER: {
      value: {
        OUT_X_L: 0x28,
        CTRL_REG1: 0x20,
        CTRL_REG2: 0x21,
        CTRL_REG3: 0x22,
        CTRL_REG4: 0x23,
        CTRL_REG5: 0x24,

        TEMP_CFG_REG: 0x1F,

        CLICK_CFG: 0x38,
        CLICK_SRC: 0x39,
        CLICK_THS: 0x3A,
        TIME_LIMIT: 0x3B,
        TIME_LATENCY: 0x3C,
        TIME_WINDOW: 0x3D,
      }
    },
    initialize: {
      value(options, callback) {
        const state = priv.get(this);
        const address = options.address || 0x18;

        // 2G  = 0b00
        // 4G  = 0b01
        // 8G  = 0b10
        // 16G = 0b11
        let range = ({
          2: 0,
          4: 1,
          8: 2,
          16: 3
        })[options.range || 4];

        /* istanbul ignore if */
        if (range === undefined) {
          range = 1;
        }

        let divider = [
          16380,
          8190,
          4096,
          1365,
        ][range];

        /* istanbul ignore if */
        if (divider === undefined) {
          divider = 1;
        }

        let threshold = [
          80,
          40,
          20,
          10,
        ][range];

        /* istanbul ignore if */
        if (threshold === undefined) {
          threshold = 10;
        }


        state.divider = divider;
        state.expander = Expander.get({
          address,
          controller: this.controller,
          bus: this.bus,
        });

        // TODO: this should come from the expander
        const ctrl4 = 0x88 | (range << 4);

        state.expander.i2cWrite(address, this.REGISTER.CTRL_REG4, ctrl4);

        // Acceleration
        state.expander.i2cReadOnce(address, this.REGISTER.CTRL_REG1, 1, data => {
          let ctrl1 = data[0];

          // Set to 200Hz
          ctrl1 &= ~0xF0;
          ctrl1 |= 6 << 4;

          state.expander.i2cWrite(address, this.REGISTER.CTRL_REG1, ctrl1);

          // Page 21
          // 6.1.1 I2C operation
          // Autoincrement bit set on register (0x80)
          state.expander.i2cRead(address, this.REGISTER.OUT_X_L | 0x80, 6, data => {
            callback({
              x: int16(data[1], data[0]),
              y: int16(data[3], data[2]),
              z: int16(data[5], data[4]),
            });
          });


          // Tap
          // TODO: make this optional (use "newListener"?)
          //
          // See MMA8452 driver for strategy
          //
          // state.expander.i2cReadOnce(address, this.REGISTER.CTRL_REG3, 1, function(data) {
          //   var ctrl3 = data[0];

          //   // Shut off Int 1 Click
          //   ctrl3 &= ~0x80;
          //   ctrl3 |= 6 << 4;

          //   state.expander.i2cWrite(address, this.REGISTER.CTRL_REG1, ctrl3);

          //   // Page 21
          //   // 6.1.1 I2C operation
          //   // Autoincrement bit set on register (0x80)
          //   state.expander.i2cRead(address, this.REGISTER.OUT_X_L | 0x80, 6, function(data) {
          //     callback({
          //       x: int16(data[1], data[0]),
          //       y: int16(data[3], data[2]),
          //       z: int16(data[5], data[4]),
          //     });
          //   });
          // }.bind(this));



          // Page 35
          // 8.3.7 CTRL_REG3 [Interrupt CTRL register] (22h)
          state.expander.i2cWrite(address, this.REGISTER.CTRL_REG3, 0x80);

          // Page 40
          // 9.2.1 Control register 5 (0x24)
          state.expander.i2cWrite(address, this.REGISTER.CTRL_REG5, 0x08);

          // Page 32
          // 8.3.1 TAP_CFG
          //
          // This register is called both CLICK_CFG and TAP_CFG
          //
          // 0b00101010  = 0x2A = 42
          state.expander.i2cWrite(address, this.REGISTER.CLICK_CFG, 0x2A);

          // Page 36
          // 8.4.1 Playing with TAP_TimeLimit
          //
          // ...Offers some guidance. Ultimately I opted to take inspiration
          // from Adafruit's driver and example:
          const timelimit = 10;
          const timelatency = 20;
          const timewindow = 255;

          state.expander.i2cWrite(address, this.REGISTER.CLICK_THS, threshold);
          state.expander.i2cWrite(address, this.REGISTER.TIME_LIMIT, timelimit);
          state.expander.i2cWrite(address, this.REGISTER.TIME_LATENCY, timelatency);
          state.expander.i2cWrite(address, this.REGISTER.TIME_WINDOW, timewindow);

          // Page 33
          // 8.3.2 TAP_SRC (39h)
          let lastEmitTime = null;

          state.expander.i2cRead(address, this.REGISTER.CLICK_SRC, 1, data => {
            const status = data[0];
            const thisEmitTime = Date.now();
            // var tap = status & 0x7F;

            if (lastEmitTime === null) {
              lastEmitTime = thisEmitTime - 101;
            }

            /* istanbul ignore if */
            if (thisEmitTime < (lastEmitTime + 100)) {
              return;
            }

            if (status === 0x00) {
              return;
            }

            /* istanbul ignore if */
            if (!(status & 0x30)) {
              return;
            }

            lastEmitTime = thisEmitTime;

            this.emit("tap");

            if (status & 0x10) {
              this.emit("tap:single");
            }

            if (status & 0x20) {
              // TODO: Figure out if we can determine a
              // combined single + double tap
              this.emit("tap:single");
              this.emit("tap:double");
            }
          });
        });
      },
    },
    toGravity: {
      value(raw) {
        // Table 4, page 10
        return toFixed(raw / priv.get(this).divider, 3);
      },
    },
  },
  LSM303C: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "LSM303C", options)
          .on("data", ({accelerometer}) => callback(accelerometer));
      }
    },
    toGravity: {
      value(raw) {
        return toFixed(raw, 2);
      }
    }
  },
};

// Otherwise known as...
Controllers.TINKERKIT = Controllers.ANALOG;
Controllers.MMA8452Q = Controllers.MMA8452;
Controllers.DEFAULT = Controllers.ANALOG;

function magnitude(x, y, z) {
  let a;

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
 * @param {Object} options [description]
 *
 */

class Accelerometer extends Emitter {
  constructor(options) {
    super();

    const state = {
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
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    if (!this.toGravity) {
      this.toGravity = options.toGravity || (x => x);
    }

    if (!this.enabledChanged) {
      this.enabledChanged = () => {};
    }

    priv.set(this, state);

    /* istanbul ignore else */
    if (typeof this.initialize === "function") {
      this.initialize(options, data => {
        let isChange = false;

        if (!state.enabled) {
          return;
        }

        Object.keys(data).forEach(axis => {
          const value = data[axis];
          const sensor = state[axis];

          if (options.autoCalibrate && sensor.calibration.length < calibrationSize) {
            const axisIndex = axes.indexOf(axis);
            sensor.calibration.push(value);

            if (!Array.isArray(state.zeroV)) {
              state.zeroV = [];
            }

            state.zeroV[axisIndex] = sum(sensor.calibration) / sensor.calibration.length;
            if (axis === aZ) {
              state.zeroV[axisIndex] -= state.sensitivity;
            }
          }

          // The first run needs to prime the "stash"
          // of data values.
          if (sensor.stash.length === 0) {
            for (let i = 0; i < 5; i++) {
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
        });

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
      });
    }

    Object.defineProperties(this, {
      hasAxis: {
        writable: true,
        value(axis) {
          /* istanbul ignore next */
          return state[axis] ? state[axis].stash.length > 0 : false;
        }
      },
      enable: {
        value() {
          state.enabled = true;
          this.enabledChanged(true);
          return this;
        }
      },
      disable: {
        value() {
          state.enabled = false;
          this.enabledChanged(false);
          return this;
        }
      },
      zeroV: {
        get() {
          return state.zeroV;
        }
      },
      /**
       * [read-only] Calculated pitch value
       * @property pitch
       * @type Number
       */
      pitch: {
        get() {
          const x = this.x;
          const y = this.y;
          const z = this.z;
          const rads = this.hasAxis(aZ) ?
            Math.atan2(x, Math.hypot(y, z)) :
            Math.asin(constrain(x, -1, 1));

          return toFixed(rads * RAD_TO_DEG, 2);
        }
      },
      /**
       * [read-only] Calculated roll value
       * @property roll
       * @type Number
       */
      roll: {
        get() {
          const x = this.x;
          const y = this.y;
          const z = this.z;
          const rads = this.hasAxis(aZ) ?
            Math.atan2(y, Math.hypot(x, z)) :
            Math.asin(constrain(y, -1, 1));

          return toFixed(rads * RAD_TO_DEG, 2);
        }
      },
      x: {
        get() {
          return this.toGravity(state.x.value, aX);
        }
      },
      y: {
        get() {
          return this.toGravity(state.y.value, aY);
        }
      },
      z: {
        get() {
          return this.hasAxis(aZ) ?
            this.toGravity(state.z.value, aZ) : 0;
        }
      },
      acceleration: {
        get() {
          return magnitude(
            this.x,
            this.y,
            this.z
          );
        }
      },
      inclination: {
        get() {
          return Math.atan2(this.y, this.x) * RAD_TO_DEG;
        }
      },
      orientation: {
        get() {
          const abs = Math.abs;
          const x = this.x;
          const y = this.y;
          const z = this.hasAxis(aZ) ? this.z : 1;
          const absX = abs(x);
          const absY = abs(y);
          const absZ = abs(z);

          if (absX < absY && absX < absZ) {
            if (x > 0) {
              return 1;
            }
            return -1;
          }
          if (absY < absX && absY < absZ) {
            if (y > 0) {
              return 2;
            }
            return -2;
          }
          if (absZ < absX && absZ < absY) {
            // TODO: figure out how to test this
            /* istanbul ignore else */
            if (z > 0) {
              return 3;
            }
            /* istanbul ignore next */
            return -3;
          }
          return 0;
        }
      }
    });
  }
}

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Accelerometer.Controllers = Controllers;
  Accelerometer.purge = function() {
    priv.clear();
  };
}


module.exports = Accelerometer;
