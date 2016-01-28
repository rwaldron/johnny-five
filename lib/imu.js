var Board = require("./board");
var Emitter = require("events").EventEmitter;
var util = require("util");
var __ = require("./fn");
var Accelerometer = require("./accelerometer");
var Altimeter = require("./altimeter");
var Barometer = require("./barometer");
var Compass = require("./compass");
var Hygrometer = require("./hygrometer");
var Thermometer = require("./thermometer");
var Orientation = require("./orientation")
var Gyro = require("./gyro");
var int16 = __.int16;
var uint16 = __.uint16;
var uint24 = __.uint24;

var priv = new Map();
var activeDrivers = new Map();

var Drivers = {
  // Based on the AdaFruit Arduino driver
  // https://github.com/adafruit/Adafruit_HTU21DF_Library
  // https://www.adafruit.com/products/1899
  HTU21D: {
    ADDRESSES: {
      value: [0x40]
    },
    REGISTER: {
      value: {
        HUMIDITY: 0xE5,
        TEMPERATURE: 0xE3,
      }
    },
    initialize: {
      value: function(board, opts) {
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];

        opts.address = address;

        // The "no hold" measurement requires waiting
        // _at least_ 22ms between register write and
        // register read. Delay is measured in μs:
        // 22ms = 22000μs; recommend 50ms = 50000μs
        opts.delay = 50000;

        io.i2cConfig(opts);

        // http://cdn.sparkfun.com/datasheets/BreakoutBoards/HTU21D.pdf
        var computed = {
          temperature: null,
          humidity: null,
        };

        // Despite the registers being back to back, the HTU21D
        // does not like when 5 bytes are requested, so we put
        // the two data sources on their own read channels.
        io.i2cRead(address, this.REGISTER.TEMPERATURE, 2, function(data) {
          computed.temperature = int16(data[0], data[1]);
          this.emit("data", computed);
        }.bind(this));

        io.i2cRead(address, this.REGISTER.HUMIDITY, 3, function(data) {
          computed.humidity = int16(data[0], data[1]);
          this.emit("data", computed);
        }.bind(this));
      }
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers["HTU21D"].ADDRESSES.value[0];
        return "htu-s1d-" + address;
      }
    }
  },
  // Based on the example code from
  // http://playground.arduino.cc/Main/MPU-6050
  // http://www.invensense.com/mems/gyro/mpu6050.html
  MPU6050: {
    ADDRESSES: {
      value: [0x68, 0x69]
    },
    REGISTER: {
      value: {
        SETUP: [0x6B, 0x00], // += 250
        READ: 0x3B
      }
    },
    initialize: {
      value: function(board, opts) {
        var READLENGTH = 14;
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];

        opts.address = address;

        var computed = {
          accelerometer: {},
          temperature: {},
          gyro: {}
        };

        io.i2cConfig(opts);
        io.i2cWrite(address, this.REGISTER.SETUP);

        io.i2cRead(address, this.REGISTER.READ, READLENGTH, function(data) {
          computed.accelerometer = {
            x: int16(data[0], data[1]),
            y: int16(data[2], data[3]),
            z: int16(data[4], data[5])
          };

          computed.temperature = int16(data[6], data[7]);

          computed.gyro = {
            x: int16(data[8], data[9]),
            y: int16(data[10], data[11]),
            z: int16(data[12], data[13])
          };

          this.emit("data", computed);
        }.bind(this));
      },
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers["MPU6050"].ADDRESSES.value[0];
        return "mpu-6050-" + address;
      }
    }
  },
  BNO055: {
    ADDRESSES: {
      value: [0x28, 0x29]
    },
    REGISTER: {
      value: {
        //
        // 4.2.1 Register map Page 0
        //
        READ: {
          /*
            All motion data is in the following order:
            X LSB
            X MSB
            Y LSB
            Y MSB
            Z LSB
            Z MSB

            The quarternion data is WXYZ
            W LSB
            W MSB
            X LSB
            X MSB
            Y LSB
            Y MSB
            Z LSB
            Z MSB

           */

          // m/s^2 by default
          ACCEL: 0x08, // X LSB

          // ? by default
          MAG: 0x0E, // X LSB

          // dps by default
          GYRO: 0x14, // X LSB

          //euler angles - degrees
          EULER:  0x1A, // heading LSB

          //quarternion
          QUARTERNION: 0x20, // W LSB

          // °C by default
          TEMP: 0x34,


        },

        LENGTH: {
          ACCEL: 6,
          MAG: 6,
          GYRO: 6,
          EULER: 6,
          QUARTERNION: 8,
          TEMP: 1,
        },

        OPR_MODE_ADDR: 0X3D,
        OPR_MODES: {
          CONFIG: 0x00,
          ACCONLY: 0x01,
          MAGONLY: 0x02,
          GYRONLY: 0x03,
          ACCMAG: 0x04,
          ACCGYRO: 0x05,
          MAGGYRO: 0x06,
          AMG: 0x07,
          IMUPLUS: 0x08,
          COMPASS: 0x09,
          M4G: 0x0A,
          NDOF_FMC_OFF: 0x0B,
          NDOF: 0x0C,
        },

        PWR_MODE_ADDR: 0x3E,
        PWR_MODES: {
          NORMAL: 0x00,
          LOW: 0x01,
          SUSPEND: 0x02,
        },

        PAGE_ID_ADDR: 0x07,
        PAGE_STATES: {
          ZERO: 0x00,
        },

        CALIBRATION: 0x35,
        SYS_TRIGGER: 0x3F,

        UNIT_SEL_ADDR: 0x3B,

        AXIS_MAP_CONFIG_ADDR: 0X41,
        AXIS_MAP_SIGN_ADDR: 0X42,
      }
    },
    initialize: {
      value: function(board, opts) {
        // Datasheet references:
        //
        // QS: https://ae-bst.resource.bosch.com/media/products/dokumente/bno055/BST-BNO055-AN007-00_Quick_Start_Guide.pdf
        //
        // AF: https://www.adafruit.com/datasheets/BST_BNO055_DS000_12.pdf
        //
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];

        opts.address = address;

        var computed = {
          accelerometer: {
            x: null,
            y: null,
            z: null,
          },
          gyro: {
            x: null,
            y: null,
            z: null,
          },
          magnetometer: {
            x: null,
            y: null,
            z: null,
          },
          orientation: {
            euler: {
              heading: null,
              roll: null,
              pitch: null,
            },
            quarternion: {
              w: null,
              x: null,
              y: null,
              z: null,
            },
          },
          temperature: null,
          calibration: null,
        };

        // var calibrated = {
        //   accelerometer: false,
        //   gyro: false,
        //   magnetometer: false,
        //   temperature: true,
        // };

        io.i2cConfig(opts);

        // Put chip into CONFIG operation mode
        io.i2cWriteReg(address, this.REGISTER.OPR_MODE_ADDR, this.REGISTER.OPR_MODES.CONFIG);

        // Set register page to 0
        io.i2cWriteReg(address, this.REGISTER.PAGE_ID_ADDR, this.REGISTER.PAGE_STATES.ZERO);

        // AF p.70, 4.3.63 SYS_TRIGGER
        //
        // RST_SYS (Set to reset system)
        //
        // B7 B6 B5 B4 B3 B2 B1 B0
        //  0  0  1  0  0  0  0  0
        //
        io.i2cWriteReg(address, this.REGISTER.SYS_TRIGGER, 0x20);

        var por = new Promise(function(resolve) {
          setTimeout(function() {

            // Normal power mode
            io.i2cWriteReg(address, this.REGISTER.PWR_MODE_ADDR, this.REGISTER.PWR_MODES.NORMAL);

            // AF p.70, 4.3.63 SYS_TRIGGER
            //
            // CLK_SEL:
            //
            // B7 B6 B5 B4 B3 B2 B1 B0
            //  0  0  0  0  0  0  0  0
            //
            //io.i2cWriteReg(address, this.REGISTER.SYS_TRIGGER, 0x00);
            // do we want to enable an external crystal??
            io.i2cWriteReg(address, this.REGISTER.SYS_TRIGGER, opts.enableExternalCrystal ?  0x80 : 0x00);

            //AF p.24 3.4, Axis remap
            //
            // AXIS_MAP_CONFIG:
            //
            // B7 B6 B5 B4 B3 B2 B1 B0
            //  0  0  0  0  0  0  0  0
            //  -  -  z  z  y  y  x  x
            //
            // x axis = 00, y axis = 01, z axis = 10
            //
            // see also the defaults starting on AF p.50
            //
            var axisMap = opts.axisMap || 0x24;
            io.i2cWriteReg(address, this.REGISTER.AXIS_MAP_CONFIG_ADDR, axisMap);

            //AF p.24 3.4, Axis remap
            //
            // AXIS_MAP_CONFIG:
            //
            // B7 B6 B5 B4 B3 B2 B1 B0
            //  0  0  0  0  0  0  0  0
            //  -  -  -  -  -  x  y  z
            //
            // 0 = positive, 1 = negative
            //
            var axisSign = opts.axisSign || 0x00;
            io.i2cWriteReg(address, this.REGISTER.AXIS_MAP_SIGN_ADDR, axisSign);


            // Set operational mode to "nine degrees of freedom"
            setTimeout(function() {
              io.i2cWriteReg(address, this.REGISTER.OPR_MODE_ADDR, this.REGISTER.OPR_MODES.NDOF);
              resolve();
            }.bind(this), 10);

          // OPERATING CONDITIONS BNO055
          // AF p.13, 1.2, OPERATING CONDITIONS BNO055
          // From reset to config mode
          }.bind(this), 650);
        }.bind(this));

        por.then(function() {
          return new Promise(function(resolve) {
            var readCalibration = function() {
              io.i2cReadOnce(address, this.REGISTER.CALIBRATION, 1, function(data) {
                var state = data[0];
                var s = (state >> 6) & 0x03;
                var g = (state >> 4) & 0x03;
                var a = (state >> 2) & 0x03;
                var m = (state >> 0) & 0x03;

                //grab the calibration
                computed.calibration = state;

                // TODO: remove this once calibration event is supported?
                console.log("-------------------------");
                console.log(state);
                console.log("s: ", s);
                console.log("g: ", g);
                console.log("a: ", a);
                console.log("m: ", m);

                if (state === 0xFF) {
                // change this so that we wait for the system
                // to be ready, not each component.
                // as per adafruit example suggestions
                // wonder if the calibration should be checked here, or where we are consuming?
                //if (3 === s) {
                  resolve();
                } else {
                  readCalibration();
                }
              });
            }.bind(this);

            readCalibration();
          }.bind(this));
        }.bind(this)).then(function() {

          // Temperature requires no calibration, begin reading immediately
          // here we read out temp, and the calibration state since they are back to back
          // and the device can, has been observed to go out of calibration and we may want to check
          io.i2cRead(address, this.REGISTER.READ.TEMP, 2, function(data) {
            computed.temperature = data[0];
            computed.calibration = data[1];
            this.emit("data", computed);
          }.bind(this));


          // ACCEL, MAG and GYRO are 6 bytes each => 18 bytes total

          // if we are in NDOF modes we can also include euler and quarternions
          // this adds 8 bytes for quarternions and 6 for euler
          // so we end up with 18 + 6 + 8 = 32

          io.i2cRead(address, this.REGISTER.READ.ACCEL, 32, function(data) {

            // console.log(data);
            computed.accelerometer = {
              x: int16(data[1], data[0]),
              y: int16(data[3], data[2]),
              z: int16(data[5], data[4])
            };

            computed.magnetometer = {
              x: int16(data[7], data[6]),
              y: int16(data[9], data[8]),
              z: int16(data[11], data[10])
            };

            computed.gyro = {
              x: int16(data[13], data[12]),
              y: int16(data[15], data[14]),
              z: int16(data[17], data[16])
            };

            computed.orientation.euler = {
              heading: int16(data[19], data[18]),
              roll: int16(data[21], data[20]),
              pitch: int16(data[23], data[22])
            };

            //scaled quarternion - unitless
            computed.orientation.quarternion = {
              w: int16(data[25], data[24]),
              x: int16(data[27], data[26]),
              y: int16(data[29], data[28]),
              z: int16(data[31], data[30])
            };



            this.emit("data", computed);
          }.bind(this));
        }.bind(this));
      },
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers["BNO055"].ADDRESSES.value[0];
        return "bno055-" + address;
      }
    }
  },
  MPL115A2: {
    ADDRESSES: {
      value: [0x60]
    },
    REGISTER: {
      value: {
        COEFFICIENTS: 0x04,
        READ: 0x00,
        STARTCONVERSION: 0x12,
      }
    },
    initialize: {
      value: function(board, opts) {
        var READLENGTH = 4;
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];

        opts.address = address;

        var cof = {
          a0: null,
          b1: null,
          b2: null,
          c12: null
        };

        io.i2cConfig(opts);

        var pCoefficients = new Promise(function(resolve) {
          io.i2cReadOnce(address, this.REGISTER.COEFFICIENTS, 8, function(data) {
            var A0 = int16(data[0], data[1]);
            var B1 = int16(data[2], data[3]);
            var B2 = int16(data[4], data[5]);
            var C12 = int16(data[6], data[7]) >> 2;

            // Source:
            // https://github.com/adafruit/Adafruit_MPL115A2
            // a0 is the pressure offset coefficient
            // b1 is the pressure sensitivity coefficient
            // b2 is the temperature coefficient of offset (TCO)
            // c12 is the temperature coefficient of sensitivity (TCS)
            cof.a0 = A0 / 8;
            cof.b1 = B1 / 8192;
            cof.b2 = B2 / 16384;
            cof.c12 = C12 / 4194304;

            resolve();
          }.bind(this));
        }.bind(this));

        pCoefficients.then(function() {
          io.i2cWrite(address, [this.REGISTER.STARTCONVERSION, 0x00]);

          io.i2cRead(address, this.REGISTER.READ, READLENGTH, function(data) {
            var padc = uint16(data[0], data[1]) >> 6;
            var tadc = uint16(data[2], data[3]) >> 6;

            var pressure = cof.a0 + (cof.b1 + cof.c12 * tadc) * padc + cof.b2 * tadc;
            var temperature = tadc;

            this.emit("data", {
              pressure: pressure,
              temperature: temperature,
            });
          }.bind(this));
        }.bind(this));
      }
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers["MPL115A2"].ADDRESSES.value[0];
        return "mpl115a2-" + address;
      }
    }
  },
  // Based off of the AdaFruit Arduino library for this chip
  // https://github.com/adafruit/Adafruit_MPL3115A2_Library
  MPL3115A2: {
    ADDRESSES: {
      value: [0x60]
    },
    REGISTER: {
      value: {
        STATUS: 0x00,
        PRESSURE_MSB: 0x01,
        DATA_CONFIG: 0x13,
        BAR_IN_MSB: 0x14,
        BAR_IN_LSB: 0x15,
        CONTROL: 0x26,
      }
    },
    MASK: {
      value: {
        STATUS: {
          PRESSURE_DATA_READ: 0x04
        },
        CONTROL: {
          SBYB: 0x01,
          OS128: 0x38,
          ALTIMETER: 0x80,
          PRESSURE: 0x00
        },
        DATA_CONFIG: {
          TDEFE: 0x01,
          PDEFE: 0x02,
          DREM: 0x04
        }
      }
    },
    initialize: {
      value: function(board, opts) {
        var READLENGTH = 6;
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];
        var elevation = null;
        var offset = 0;
        var isPressure = false;

        opts.address = address;

        // See http://www.henrylahr.com/?p=99 for implementation approach
        //
        var altNow = 0;
        var computed = {
          pressure: 0,
          altitude: 0,
          temperature: 0
        };

        if (typeof opts.elevation !== "undefined") {
          elevation = opts.elevation;
        }

        if (elevation !== null && elevation <= 0) {
          offset = Math.abs(elevation) + 1;
          elevation = 1;
        }

        var waitForReady = function(next) {
          io.i2cReadOnce(address, this.REGISTER.STATUS, 1, function(data) {
            if (data[0] & this.MASK.STATUS.PRESSURE_DATA_READ) {
              next();
            } else {
              setTimeout(function() {
                waitForReady(next);
              }, 100);
            }
          }.bind(this));
        }.bind(this);

        var readValues = function() {
          var modeMask = isPressure ? this.MASK.CONTROL.PRESSURE : this.MASK.CONTROL.ALTIMETER;
          var mode = this.MASK.CONTROL.SBYB | this.MASK.CONTROL.OS128 | modeMask;

          io.i2cWrite(address, this.REGISTER.CONTROL, mode);

          waitForReady(function() {
            io.i2cReadOnce(address, this.REGISTER.PRESSURE_MSB, READLENGTH, function(data) {
              var value = uint24(data[1], data[2], data[3]) >> 4;
              var temperature = uint16(data[4], data[5]) >> 4;
              var altVal;

              computed.temperature = temperature;

              if (isPressure) {
                computed.pressure = value;
                this.emit("data", computed);
              } else {
                var m = data[1];
                var c = data[2];
                var l = data[3];
                var fl = (l >> 4) / 16;

                altVal = (m << 8 | c) + fl;
                altNow = (altNow * 3 + altVal) / 4;

                computed.altitude = altNow - offset;
              }

              isPressure = !isPressure;

              readValues();
            }.bind(this));
          }.bind(this));
        }.bind(this);

        var reads = [];
        var calibrate = function() {
          // Clear Oversampling and OST
          io.i2cWrite(address, this.REGISTER.CONTROL, 0x3B);
          io.i2cWrite(address, this.REGISTER.CONTROL, 0x39);

          setTimeout(function() {
            io.i2cReadOnce(address, this.REGISTER.PRESSURE_MSB, READLENGTH, function(data) {
              var m = data[1];
              var c = data[2];
              var l = data[3];
              var fl = (l >> 4) / 4;

              reads.push((m << 10 | c << 2) + fl);

              if (reads.length === 4) {
                var curpress = (reads[0] + reads[1] + reads[2] + reads[3]) / 4;
                var seapress = curpress / Math.pow(1 - elevation * 0.0000225577, 5.255877);

                // Update Barometric input for Altitude
                io.i2cWrite(address, this.REGISTER.BAR_IN_MSB, (seapress / 2) >> 8);
                io.i2cWrite(address, this.REGISTER.BAR_IN_LSB, (seapress / 2) & 0xFF);

                // Get into Altitude mode
                // One shot & OST bit
                io.i2cWrite(address, this.REGISTER.CONTROL, 0xBB);
                io.i2cWrite(address, this.REGISTER.CONTROL, 0xB9);

                setTimeout(function() {
                  io.i2cReadOnce(address, this.REGISTER.PRESSURE_MSB, READLENGTH, function(data) {
                    var m = data[1];
                    var c = data[2];
                    var l = data[3];
                    var fl = (l >> 4) / 16;

                    altNow = (m << 8 | c) + fl;

                    readValues(false);
                  });
                }.bind(this), 550);

              } else {
                calibrate();
              }
            }.bind(this));
          }.bind(this), 500);
        }.bind(this);

        io.i2cConfig(opts);

        // configure the chip
        // Set Altitude Offset.
        io.i2cWriteReg(address, 0x2D, 0x00);

        io.i2cWriteReg(address, this.REGISTER.BAR_IN_MSB, 0);
        io.i2cWriteReg(address, this.REGISTER.BAR_IN_LSB, 0);

        io.i2cWriteReg(address, this.REGISTER.DATA_CONFIG,
          this.MASK.DATA_CONFIG.TDEFE |
          this.MASK.DATA_CONFIG.PDEFE |
          this.MASK.DATA_CONFIG.DREM);

        if (elevation !== null) {
          calibrate();
        } else {
          readValues();
        }
      }
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers["MPL3115A2"].ADDRESSES.value[0];
        return "mpl3115a2-" + address;
      }
    }
  },
  BMP180: {
    ADDRESSES: {
      value: [0x77]
    },
    REGISTER: {
      value: {
        COEFFICIENTS: 0xAA,
        READ: 0x00,
        READ_START: 0xF4,
        READ_RESULT: 0xF6,
      }
    },
    initialize: {
      value: function(board, opts) {
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];

        opts.address = address;

        /**
         * http://www.adafruit.com/datasheets/BST-BMP180-DS000-09.pdf
         * Table 1: Operating conditions, output signal and mechanical characteristics
         *
         * Pressure Conversion Delay (ms)
         *
         * [
         *   5,   LOW
         *   8,   STANDARD
         *   14,  HIGH
         *   26,  ULTRA
         *  ]
         */

        var mode = opts.mode || 3;
        var kpDelay = [ 5, 8, 14, 26 ][ mode ];
        var oss = __.constrain(mode, 0, 3);

        var cof = {
          a1: null,
          a2: null,
          a3: null,
          a4: null,
          a5: null,
          a6: null,
          b1: null,
          b2: null,
          b5: null,
          mb: null,
          mc: null,
          md: null,
        };

        io.i2cConfig(opts);

        var pCoefficients = new Promise(function(resolve) {
          io.i2cReadOnce(address, this.REGISTER.COEFFICIENTS, 22, function(data) {
            // http://www.adafruit.com/datasheets/BST-BMP180-DS000-09.pdf
            // Pages 11, 15
            // 3.3 Measurement of pressure and temperature
            // 3.5 Calculating pressure and temperature
            cof.a1 = int16(data[0], data[1]);
            cof.a2 = int16(data[2], data[3]);
            cof.a3 = int16(data[4], data[5]);
            cof.a4 = uint16(data[6], data[7]);
            cof.a5 = uint16(data[8], data[9]);
            cof.a6 = uint16(data[10], data[11]);
            cof.b1 = int16(data[12], data[13]);
            cof.b2 = int16(data[14], data[15]);
            cof.mb = int16(data[16], data[17]);
            cof.mc = int16(data[18], data[19]);
            cof.md = int16(data[20], data[21]);

            resolve();
          });
        }.bind(this));

        pCoefficients.then(function() {
          var computed = {
            pressure: null,
            temperature: null,
          };

          var cycle = 0;

          // http://www.adafruit.com/datasheets/BST-BMP180-DS000-09.pdf
          // Pages 11, 15
          // 3.3 Measurement of pressure and temperature
          // 3.5 Calculating pressure and temperature
          var readCycle = function() {

            // cycle 0: temperature
            // cycle 1: pressure

            var isTemperatureCycle = cycle === 0;
            var component = isTemperatureCycle ? 0x2E : 0x34 + (oss << 6);
            var numBytes = isTemperatureCycle ? 2 : 3;
            var delay = isTemperatureCycle ? 5 : kpDelay;


            io.i2cWriteReg(address, this.REGISTER.READ_START, component);

            // Once the READ_START register is set,
            // delay the READ_RESULT request based on the
            // mode value provided by the user, or default.
            setTimeout(function() {
              io.i2cReadOnce(address, this.REGISTER.READ_RESULT, numBytes, function(data) {
                var compensated, uncompensated;
                var x1, x2, x3, b3, b4, b6, b7, b6s, bx;

                if (isTemperatureCycle) {
                  // TEMPERATURE
                  uncompensated = int16(data[0], data[1]);

                  // Compute the true temperature
                  x1 = ((uncompensated - cof.a6) * cof.a5) >> 15;
                  x2 = ((cof.mc << 11) / (x1 + cof.md)) >> 0;

                  // Compute b5, which is used by the pressure cycle
                  cof.b5 = (x1 + x2) | 0;

                  // Steps of 0.1°C
                  computed.temperature = ((cof.b5 + 8) >> 4) / 10;
                } else {
                  // PRESSURE
                  uncompensated = uint24(data[0], data[1], data[2]) >> (8 - oss);

                  b6 = cof.b5 - 4000;
                  b6s = b6 * b6;
                  bx = b6s >> 12;

                  // Intermediary x1 & x2 to calculate x3 for b3
                  x1 = (cof.b2 * bx) >> 11;
                  x2 = (cof.a2 * b6) >> 11;
                  x3 = x1 + x2;
                  b3 = ((((cof.a1 * 4 + x3) << oss) + 2) / 4) >> 0;

                  // Intermediary x1 & x2 to calculate x3 for b4
                  x1 = (cof.a3 * b6) >> 13;
                  x2 = (cof.b1 * bx) >> 16;
                  x3 = ((x1 + x2) + 2) >> 2;
                  b4 = (cof.a4 * (x3 + 32768)) >> 15;
                  b7 = (uncompensated - b3) * (50000 >> oss);

                  if (b7 < 0x80000000) {
                    compensated = (b7 * 2) / b4;
                  } else {
                    compensated = (b7 / b4) * 2;
                  }

                  compensated >>= 0;

                  x1 = (compensated >> 8) * (compensated >> 8);
                  x1 = (x1 * 3038) >> 16;
                  x2 = (-7357 * compensated) >> 16;

                  compensated += (x1 + x2 + 3791) >> 4;

                  // Steps of 1Pa (= 0.01hPa = 0.01mbar) (=> 0.001kPa)
                  computed.pressure = compensated;
                }

                if (++cycle === 2) {
                  cycle = 0;
                  this.emit("data", computed);
                }

                readCycle();
              }.bind(this));
            }.bind(this), delay);
          }.bind(this);

          // Kick off "read loop"
          //
          readCycle();
        }.bind(this));
      }
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers["BMP180"].ADDRESSES.value[0];
        return "bmp180-" + address;
      }
    }
  },
  SI7020: {
    ADDRESSES: {
      value: [0x40]
    },
    REGISTER: {
      value: {
        HUMIDITY: 0xE5,
        TEMPERATURE: 0xE0,
      }
    },
    initialize: {
      value: function(board, opts) {
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];

        opts.address = address;

        // The "no hold" measurement requires waiting
        // _at least_ 22ms between register write and
        // register read. Delay is measured in μs:
        // 22ms = 22000μs; recommend 50ms = 50000μs
        opts.delay = 50000;

        io.i2cConfig(opts);

        // Reference
        // https://www.silabs.com/Support%20Documents/TechnicalDocs/Si7020-A20.pdf
        // P. 19
        var computed = {
          temperature: null,
          humidity: null,
        };

        // Despite the registers being back to back, the SI7020
        // does not like when 5 bytes are requested, so we put
        // the two data sources on their own read channels.
        io.i2cRead(address, this.REGISTER.TEMPERATURE, 2, function(data) {
          computed.temperature = int16(data[0], data[1]);
          this.emit("data", computed);
        }.bind(this));

        io.i2cRead(address, this.REGISTER.HUMIDITY, 2, function(data) {
          computed.humidity = int16(data[0], data[1]);
          this.emit("data", computed);
        }.bind(this));
      }
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers["SI7020"].ADDRESSES.value[0];
        return "si7020-" + address;
      }
    },
  }
};

// Otherwise known as...
Drivers["MPU-6050"] = Drivers.MPU6050;

Drivers.get = function(board, driverName, opts) {
  var drivers, driverKey, driver;

  if (!activeDrivers.has(board)) {
    activeDrivers.set(board, {});
  }

  drivers = activeDrivers.get(board);

  driverKey = Drivers[driverName].identifier.value(opts);

  if (!drivers[driverKey]) {
    driver = new Emitter();
    Object.defineProperties(driver, Drivers[driverName]);
    driver.initialize(board, opts);
    drivers[driverKey] = driver;
  }

  return drivers[driverKey];
};

Drivers.clear = function() {
  activeDrivers.clear();
};

var Controllers = {
  /**
   * MPU-6050 3-axis Gyro/Accelerometer and Thermometer
   *
   * http://playground.arduino.cc/Main/MPU-6050
   */

  MPU6050: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.accelerometer = new Accelerometer(
          Object.assign({
            controller: "MPU6050",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: "MPU6050",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.gyro = new Gyro(
          Object.assign({
            controller: "MPU6050",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );
      }
    },
    components: {
      value: ["accelerometer", "thermometer", "gyro"]
    },
    accelerometer: {
      get: function() {
        return priv.get(this).accelerometer;
      }
    },
    // Deprecated
    temperature: {
      get: function() {
        return priv.get(this).thermometer;
      }
    },
    thermometer: {
      get: function() {
        return priv.get(this).thermometer;
      }
    },
    gyro: {
      get: function() {
        return priv.get(this).gyro;
      }
    },
  },
  BNO055: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.accelerometer = new Accelerometer(
          Object.assign({
            controller: "BNO055",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.gyro = new Gyro(
          Object.assign({
            controller: "BNO055",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.magnetometer = new Compass(
          Object.assign({
            controller: "BNO055",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: "BNO055",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.orientation = new Orientation(
            Object.assign({
              controller: "BNO055",
              freq: opts.freq,
              board: this.board,
            }, opts)
        );
      }
    },
    components: {
      value: ["accelerometer", "gyro", "magnetometer", "thermometer", "orientation"]
    },
    accelerometer: {
      get: function() {
        return priv.get(this).accelerometer;
      }
    },
    gyro: {
      get: function() {
        return priv.get(this).gyro;
      }
    },
    magnetometer: {
      get: function() {
        return priv.get(this).magnetometer;
      }
    },
    thermometer: {
      get: function() {
        return priv.get(this).thermometer;
      }
    },
    orientation: {
      get: function() {
        return priv.get(this).orientation;
      }
    },
    calibration: {
      get: function() {
        return this.orientation.calibration;
      }
    },
    isCalibrated: {
      get: function (){
        //returns if the system and all sensors are fully calibrated
        return this.orientation.calibration == 0xFF;
      }
    }
  },
  MPL115A2: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.barometer = new Barometer(
          Object.assign({
            controller: "MPL115A2",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: "MPL115A2",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );
      }
    },
    components: {
      value: ["barometer", "thermometer"]
    },
    barometer: {
      get: function() {
        return priv.get(this).barometer;
      }
    },
    // Deprecated
    temperature: {
      get: function() {
        return priv.get(this).thermometer;
      }
    },
    thermometer: {
      get: function() {
        return priv.get(this).thermometer;
      }
    },
  },
  HTU21D: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.hygrometer = new Hygrometer(
          Object.assign({
            controller: "HTU21D",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: "HTU21D",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );
      }
    },
    components: {
      value: ["hygrometer", "thermometer"]
    },
    hygrometer: {
      get: function() {
        return priv.get(this).hygrometer;
        }
    },
    // Deprecated
    temperature: {
      get: function() {
        return priv.get(this).thermometer;
      }
    },
    thermometer: {
      get: function() {
        return priv.get(this).thermometer;
      }
    },
  },
  MPL3115A2: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.barometer = new Barometer(
          Object.assign({
            controller: "MPL3115A2",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.altimeter = new Altimeter(
          Object.assign({
            controller: "MPL3115A2",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: "MP3L115A2",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );
      }
    },
    components: {
      value: ["barometer", "altimeter", "thermometer"]
    },
    barometer: {
      get: function() {
        return priv.get(this).barometer;
      }
    },
    altimeter: {
      get: function() {
        return priv.get(this).altimeter;
      }
    },
    // Deprecated
    temperature: {
      get: function() {
        return priv.get(this).thermometer;
      }
    },
    thermometer: {
      get: function() {
        return priv.get(this).thermometer;
      }
    },
  },
  BMP180: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.barometer = new Barometer(
          Object.assign({
            controller: "BMP180",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: "BMP180",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );
      }
    },
    components: {
      value: ["barometer", "thermometer", /* "altitude" */]
    },
    barometer: {
      get: function() {
        return priv.get(this).barometer;
      }
    },
    // Deprecated
    temperature: {
      get: function() {
        return priv.get(this).thermometer;
      }
    },
    thermometer: {
      get: function() {
        return priv.get(this).thermometer;
      }
    },
  },
  SI7020: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        state.hygrometer = new Hygrometer(
          Object.assign({
            controller: "SI7020",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: "SI7020",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );
      }
    },
    components: {
      value: ["hygrometer", "thermometer"]
    },
    hygrometer: {
      get: function() {
        return priv.get(this).hygrometer;
        }
    },
    // Deprecated
    temperature: {
      get: function() {
        return priv.get(this).thermometer;
      }
    },
    thermometer: {
      get: function() {
        return priv.get(this).thermometer;
      }
    },
  }
};

// Otherwise known as...
Controllers["MPU-6050"] = Controllers.MPU6050;
Controllers["GY521"] = Controllers["GY-521"] = Controllers.MPU6050;

function IMU(opts) {

  if (!(this instanceof IMU)) {
    return new IMU(opts);
  }

  var controller, state;

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    controller = Controllers["MPU6050"];
  }

  this.freq = opts.freq || 500;

  state = {};
  priv.set(this, state);

  Board.Controller.call(this, controller, opts);

  if (typeof this.initialize === "function") {
    this.initialize(opts);
  }

  setInterval(function() {
    this.emit("data", this);
  }.bind(this), this.freq);

  if (this.components && this.components.length > 0) {
    this.components.forEach(function(component) {
      if (!(this[component] instanceof Emitter)) {
        return;
      }

      this[component].on("change", function() {
        this.emit("change", this, component);
      }.bind(this));
    }, this);
  }
}

util.inherits(IMU, Emitter);

IMU.Drivers = Drivers;

module.exports = IMU;
