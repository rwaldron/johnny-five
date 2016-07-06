var Board = require("./board");
var Emitter = require("events").EventEmitter;
var util = require("util");
var Fn = require("./fn");
var Accelerometer = require("./accelerometer");
var Altimeter = require("./altimeter");
var Barometer = require("./barometer");
var Compass = require("./compass");
var Hygrometer = require("./hygrometer");
var Thermometer = require("./thermometer");
var Orientation = require("./orientation");
var Gyro = require("./gyro");
var int16 = Fn.int16;
var uint16 = Fn.uint16;
var uint24 = Fn.uint24;

var priv = new Map();
var activeDrivers = new Map();

// The presense of this magic number is for computing meters from pressure and elevation (in meters)
// 0.0000225577

var Drivers = {
  // https://cdn-shop.adafruit.com/product-files/2857/Sensirion_Humidity_SHT3x_Datasheet_digital-767294.pdf
  // Based on the AdaFruit Arduino driver
  // https://github.com/adafruit/Adafruit_SHT31
  // https://www.adafruit.com/products/2857
  // Inspirated by https://github.com/ControlEverythingCommunity/SHT31/blob/master/Java/SHT31.java
  SHT31D: {
    ADDRESSES: {
      value: [0x44]
    },
    REGISTER: {
      value: {
        // Values are in 16-bit form
        // to coincide with datasheet
        //
        // Table 13
        SOFT_RESET: 0x30A2,
        // Table 8
        MEASURE_HIGH_REPEATABILITY: 0x2400,
      }
    },
    initialize: {
      value: function(board, opts) {
        var READLENGTH = 6;
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];

        opts.address = address;

        io.i2cConfig(opts);

        // Soft Reset
        io.i2cWrite(address, [
          // Page 12
          // Table 13
          // See diagram
          this.REGISTER.SOFT_RESET >> 8,
          this.REGISTER.SOFT_RESET & 0xFF,
        ]);


        // Page 10
        // Table 8
        // Send high repeatability measurement command
        io.i2cWrite(address, [
          this.REGISTER.MEASURE_HIGH_REPEATABILITY >> 8,
          this.REGISTER.MEASURE_HIGH_REPEATABILITY & 0xFF,
        ]);

        var computed = {
          temperature: null,
          humidity: null,
        };

    		// temp msb, temp lsb, temp CRC, humidity msb, humidity lsb, humidity CRC
        io.i2cRead(address, READLENGTH, function(data) {
          computed.temperature = int16(data[0], data[1]);
          computed.humidity = int16(data[3], data[4]);
          this.emit("data", computed);
        }.bind(this));
      }
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers.SHT31D.ADDRESSES.value[0];
        return "sht-31d-" + address;
      }
    }
  },

  // https://www.adafruit.com/datasheets/1899_HTU21D.pdf
  HTU21D: {
    ADDRESSES: {
      value: [0x40]
    },
    REGISTER: {
      value: {
        HUMIDITY: 0xE5,
        TEMPERATURE: 0xE3,
        SOFT_RESET: 0xFE,
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
        io.i2cWrite(address, this.REGISTER.SOFT_RESET);

        var computed = {
          temperature: null,
          humidity: null,
        };

        var cycle = 0;
        var readCycle = function() {
          // Despite the registers being back to back, the HTU21D
          // does not like when 5 bytes are requested, so we put
          // the two data sources on their own read channels.
          var isTemperatureCycle = cycle === 0;
          var register = isTemperatureCycle ? this.REGISTER.TEMPERATURE : this.REGISTER.HUMIDITY;

          io.i2cReadOnce(address, register, 2, function(data) {
            if (isTemperatureCycle) {
              computed.temperature = int16(data[0], data[1]);
            } else {
              computed.humidity = int16(data[0], data[1]);
            }

            if (++cycle === 2) {
              cycle = 0;
              this.emit("data", computed);
            }

            readCycle();
          }.bind(this));
        }.bind(this);

        readCycle();
      }
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers.HTU21D.ADDRESSES.value[0];
        return "htu-s1d-" + address;
      }
    }
  },
  DHT11_I2C_NANO_BACKPACK: {
    ADDRESSES: {
      value: [0x0A]
    },
    REGISTER: {
      value: {
        READ: 0x00,
      }
    },
    initialize: {
      value: function(board, opts) {
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];

        opts.address = address;

        io.i2cConfig(opts);

        // http://cdn.sparkfun.com/datasheets/BreakoutBoards/HTU21D.pdf
        var computed = {
          temperature: null,
          humidity: null,
        };

        io.i2cRead(address, 4, function(data) {
          computed.humidity = int16(data[0], data[1]);
          computed.temperature = int16(data[2], data[3]);
          this.emit("data", computed);
        }.bind(this));
      }
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers.DHT11_I2C_NANO_BACKPACK.ADDRESSES.value[0];
        return "dht11_i2c_nano_backpack-" + address;
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
        var address = opts.address || Drivers.MPU6050.ADDRESSES.value[0];
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
          EULER: 0x1A, // heading LSB

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

        OPR_MODE_ADDR: 0x3D,
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

        AXIS_MAP_CONFIG_ADDR: 0x41,
        AXIS_MAP_SIGN_ADDR: 0x42,
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


        // AF. p.67 4.3.54
        //a value for what we use to consider the system calibrated, 0xC0 represents the just fusion algorithm/system
        var calibrationMask = opts.calibrationMask || 0xC0;

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
            io.i2cWriteReg(address, this.REGISTER.SYS_TRIGGER, opts.enableExternalCrystal ? 0x80 : 0x00);

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
                var didCalibrationChange = computed.calibration !== state;


                computed.calibration = state;

                // it is useful, possibly to know when the calibration state changes
                // some of the calibrations are a little picky to get right, so emitting
                // the calibration state as it changes is useful.
                // grab the calibration
                if (didCalibrationChange) {
                  this.emit("calibration", computed.calibration);
                }

                if ((state & calibrationMask) === calibrationMask) {

                  // emit the calibration state so we can work out in our userspace if
                  // we are good to go, and for when we are performing the calibration steps
                  // let everyone know we are calibrated..
                  this.emit("calibrated");

                  resolve();
                } else {
                  readCalibration();
                }

              }.bind(this));
            }.bind(this);

            readCalibration();

          }.bind(this));
        }.bind(this)).then(function() {

          // Temperature requires no calibration, begin reading immediately
          // here we read out temp, and the calibration state since they are back to back
          // and the device can, has been observed to go out of calibration and we may want to check
          io.i2cRead(address, this.REGISTER.READ.TEMP, 2, function(data) {
            computed.temperature = data[0];

            var didCalibrationChange = computed.calibration !== data[1];
            computed.calibration = data[1];

            this.emit("data", computed);
            if (didCalibrationChange) {
              this.emit("calibration", computed.calibration);
            }
          }.bind(this));


          // ACCEL, MAG and GYRO are 6 bytes each => 18 bytes total
          io.i2cRead(address, this.REGISTER.READ.ACCEL, 18, function(data) {

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

            this.emit("data", computed);
          }.bind(this));

          // moved the ndof/quarternions to their own read.. bytes go missing, lots of 32 byte buffers everywhere
          io.i2cRead(address, this.REGISTER.READ.EULER, 14, function(data) {

            // raw euler
            computed.orientation.euler = {
              heading: int16(data[1], data[0]),
              roll: int16(data[3], data[2]),
              pitch: int16(data[5], data[4])
            };

            // scaled quarternion - unitless
            computed.orientation.quarternion = {
              w: int16(data[7], data[6]),
              x: int16(data[9], data[8]),
              y: int16(data[11], data[10]),
              z: int16(data[13], data[12])
            };

            this.emit("data", computed);
          }.bind(this));

        }.bind(this));
      },
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers.BNO055.ADDRESSES.value[0];
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
        // Page 5
        // Table 2. Device Memory Map
        COEFFICIENTS: 0x04,
        PADC_MSB: 0x00,
        CONVERT: 0x12,
      }
    },
    initialize: {
      value: function(board, opts) {
        /*
          Datasheet Reference:

          http://cache.freescale.com/files/sensors/doc/data_sheet/MPL115A2.pdf
         */

        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];

        opts.address = address;

        io.i2cConfig(opts);

        var computed = {
          pressure: null,
          temperature: null,
        };

        var cof = {
          a0: null,
          b1: null,
          b2: null,
          c12: null
        };

        var handler = function(data) {

          // Page 5
          // 3.1 Pressure, Temperature and Coefficient Bit-Width Specifications
          var Padc = uint16(data[0], data[1]) >> 6;
          var Tadc = uint16(data[2], data[3]) >> 6;

          // Page 6
          // 3.2 Compensation
          computed.pressure = cof.a0 + (cof.b1 + cof.c12 * Tadc) * Padc + cof.b2 * Tadc;
          computed.temperature = Tadc;

          this.emit("data", computed);

          readCycle();
        }.bind(this);

        var readCycle = function() {
          io.i2cWriteReg(address, this.REGISTER.CONVERT, 0x00);
          // Page 5
          // Table 2. Device Memory Map
          // Starting from PADC_MSB, read 4 bytes:
          //
          // Padc_MSB
          // Padc_LSB
          // Tadc_MSB
          // Tadc_LSB
          //
          io.i2cReadOnce(address, this.REGISTER.PADC_MSB, 4, handler);

          // TODO: User specified "frequency" needs to be applied here.
        }.bind(this);

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

        pCoefficients.then(readCycle);
      },
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers.MPL115A2.ADDRESSES.value[0];
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
        PRESSURE: 0x01,
        CONFIG: 0x13,
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
        CONFIG: {
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
        var isPressure = false;
        var elevation = null;
        var offset = 0;

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
            io.i2cReadOnce(address, this.REGISTER.PRESSURE, READLENGTH, function(data) {
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
            io.i2cReadOnce(address, this.REGISTER.PRESSURE, READLENGTH, function(data) {
              var m = data[1];
              var c = data[2];
              var l = data[3];
              var fl = (l >> 4) / 4;

              reads.push((m << 10 | c << 2) + fl);

              if (reads.length === 4) {
                var curpress = (reads[0] + reads[1] + reads[2] + reads[3]) / 4;
                var seapress = curpress / Math.pow(1 - elevation * 0.0000225577, 5.255);

                // Update Barometric input for Altitude
                io.i2cWrite(address, this.REGISTER.BAR_IN_MSB, (seapress / 2) >> 8);
                io.i2cWrite(address, this.REGISTER.BAR_IN_LSB, (seapress / 2) & 0xFF);

                // Get into Altitude mode
                // One shot & OST bit
                io.i2cWrite(address, this.REGISTER.CONTROL, 0xBB);
                io.i2cWrite(address, this.REGISTER.CONTROL, 0xB9);

                setTimeout(function() {
                  io.i2cReadOnce(address, this.REGISTER.PRESSURE, READLENGTH, function(data) {
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

        io.i2cConfig(
          Object.assign(opts, {
            settings: {
              stopTX: true
            }
          })
        );

        // configure the chip
        // Set Altitude Offset.
        io.i2cWriteReg(address, 0x2D, 0x00);

        io.i2cWriteReg(address, this.REGISTER.BAR_IN_MSB, 0);
        io.i2cWriteReg(address, this.REGISTER.BAR_IN_LSB, 0);

        io.i2cWriteReg(address, this.REGISTER.CONFIG,
          this.MASK.CONFIG.TDEFE |
          this.MASK.CONFIG.PDEFE |
          this.MASK.CONFIG.DREM);

        if (elevation !== null) {
          calibrate();
        } else {
          readValues();
        }
      }
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers.MPL3115A2.ADDRESSES.value[0];
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
        var elevation = null;
        var offset = 0;

        if (typeof opts.elevation !== "undefined") {
          elevation = opts.elevation;
        }

        if ((elevation != null && elevation <= 0) ||
            elevation == null) {
          offset = Math.abs(elevation) + 1;
          elevation = 1;
        }

        opts.address = address;

        /**
         * https://cdn-shop.adafruit.com/datasheets/BST-BMP180-DS000-09.pdf
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
         *
         * These numbers are derived from rounding the Max column of
         * Table 1, for the Conversion Time entries.
         */

        var mode = opts.mode || 3;
        var kpDelay = [5, 8, 14, 26][mode];
        var oss = Fn.constrain(mode, 0, 3);

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
            // https://www.sparkfun.com/datasheets/Components/General/BST-BMP085-DS000-05.pdf
            // Page 12
            // 3.4 Calibration Coefficients
            //
            // http://www.adafruit.com/datasheets/BST-BMP180-DS000-09.pdf
            // Page 13
            // 3.4 Calibration Coefficients
            //
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

          // https://www.sparkfun.com/datasheets/Components/General/BST-BMP085-DS000-05.pdf
          // Pages 10, 11
          // 3.3 Measurement of pressure and temperature
          // Pages 12, 13, 14
          // 3.5 Calculating pressure and temperature
          //
          // http://www.adafruit.com/datasheets/BST-BMP180-DS000-09.pdf
          // Pages 11, 12
          // 3.3 Measurement of pressure and temperature
          // Pages 13, 14, 15, 16
          // 3.5 Calculating pressure and temperature
          //
          var computed = {
            altitude: null,
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

                  if (b7 < Fn.POW_2_31) {
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

                  // 3.7 Calculating pressure at sea level
                  var seapress = compensated / Math.pow(1 - elevation * 0.0000225577, 5.255);
                  var altitude = 44330 * (1 - Math.pow(compensated / seapress, 1 / 5.255));

                  // Page 3 (of BMP280 Datasheet)
                  // ...relative accuracy is ±0.12 hPa, which is equivalent to
                  // ±1 m difference in altitude.
                  computed.altitude = Math.round(altitude - offset);
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
        var address = opts.address || Drivers.BMP180.ADDRESSES.value[0];
        return "bmp180-" + address;
      }
    }
  },

  BMP280: {
    ADDRESSES: {
      value: [0x77]
    },
    REGISTER: {
      value: {
        COEFFICIENTS: 0x88,
        CONFIG: 0xF5,
        MEASURE: 0xF4,
        // 0xF7, 0xF8, 0xF9
        // MSB, LSB, XLSB
        PRESSURE: 0xF7,
        // 0xFA, 0xFB, 0xFC
        // MSB, LSB, XLSB
        TEMPERATURE: 0xFA,
        RESET: 0xE0,
      }
    },
    initialize: {
      value: function(board, opts) {
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];
        var elevation = null;
        var offset = 0;

        if (typeof opts.elevation !== "undefined") {
          elevation = opts.elevation;
        }

        if ((elevation != null && elevation <= 0) ||
            elevation == null) {
          offset = Math.abs(elevation) + 1;
          elevation = 1;
        }

        opts.address = address;

        /**
         * All page numbers refer to pages in:
         * https://cdn-shop.adafruit.com/datasheets/BST-BMP280-DS001-11.pdf
         *
         */

        var dig = {
          T1: null,
          T2: null,
          T3: null,
          P1: null,
          P2: null,
          P3: null,
          P4: null,
          P5: null,
          P6: null,
          P7: null,
          P8: null,
          P9: null,
        };

        io.i2cConfig(opts);

        // Page. 24
        // 4.3.2 Register 0xE0 "reset"
        io.i2cWrite(address, this.REGISTER.RESET, 0xB6);

        var pCoefficients = new Promise(function(resolve) {
          io.i2cReadOnce(address, this.REGISTER.COEFFICIENTS, 24, function(data) {

            // Page 21, Table 17
            // Compensation parameter storage, naming and data type
            // These are received LSB FIRST
            //

            dig.T1 = uint16(data[1], data[0]);
            dig.T2 = int16(data[3], data[2]);
            dig.T3 = int16(data[5], data[4]);

            dig.P1 = uint16(data[7], data[6]);
            dig.P2 = int16(data[9], data[8]);
            dig.P3 = int16(data[11], data[10]);
            dig.P4 = int16(data[13], data[12]);
            dig.P5 = int16(data[15], data[14]);
            dig.P6 = int16(data[17], data[16]);
            dig.P7 = int16(data[19], data[18]);
            dig.P8 = int16(data[21], data[20]);
            dig.P9 = int16(data[23], data[22]);

            resolve();
          });
        }.bind(this));

        pCoefficients.then(function() {
          /*
          CTRL_MEAS bits

          | DATA LSB                      |
          | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
          | - | - | - | - | - | - | - | - |
          | 0 | 0 | 1 | 1 | 1 | 1 | 1 | 1 |
          */

          io.i2cWrite(address, this.REGISTER.MEASURE, 0x3F);

          var computed = {
            altitude: null,
            pressure: null,
            temperature: null,
          };

          //
          // Page 12
          // 3.3.1 Pressure measurement
          //
          // Page 13
          // 3.3.2 Temperature measurement
          //

          io.i2cRead(address, this.REGISTER.PRESSURE, 6, function(data) {
            var compensated = 0;

            // Page 45
            // "Returns temperature in DegC, double precision. Output value of
            // '51.23' equals 51.23 DegC. t_fine carries fine temperature as global value"
            var fine;

            // var1, var2
            //
            // Expect:
            //
            // int32
            //
            var v1, v2;

            // Page 44
            // "Both pressure and temperature values are expected to be
            // received in 20 bit format, positive, stored in a 32 bit signed integer. "
            //
            //  V = int32(uint24(m, l, xl))
            //  V >> 4;
            //

            // Page 45
            var P = Fn.s32(uint24(data[0], data[1], data[2]));
            var T = Fn.s32(uint24(data[3], data[4], data[5]));

            P >>= 4;
            T >>= 4;

            // TEMPERATURE

            // Page 45
            // bmp280_compensate_T_int32
            // var1 = ((((adc_T>>3) – ((BMP280_S32_t)dig_T1<<1))) *
            //                        ((BMP280_S32_t)dig_T2)) >> 11;
            // var2 = (((((adc_T>>4) – ((BMP280_S32_t)dig_T1)) *
            //          ((adc_T>>4) – ((BMP280_S32_t)dig_T1))) >> 12) *
            //          ((BMP280_S32_t)dig_T3)) >> 14;
            //
            //
            var adc16 = T >> 4;
            var adc16subT1 = adc16 - dig.T1;
            v1  = (((T >> 3) - (dig.T1 << 1)) * dig.T2) >> 11;
            v2  = (((adc16subT1 * adc16subT1) >> 12) * dig.T3) >> 14;

            // t_fine = var1 + var2;
            fine = v1 + v2;

            // Page 7, 8
            // Table 2: Parameter specification
            //
            //
            // Temperature 0.01 °C
            //
            // As toFixed(2)
            //
            // C = +(((t_fine * 5 + 128) >> 8) / 100).toFixed(resolution)
            //
            computed.temperature = ((fine * 5 + 128) >> 8) / 100;

            v1 = undefined;
            v2 = undefined;


            // PRESSURE
            // Page 46
            // bmp280_compensate_P_int32
            //
            // Every single seemingly arbitrary magic number comes from the datasheet.
            // Datasheets are evidently written by people that don't care about
            // anyone else actually understanding how a thing works.
            //

            // var1 = (((BMP280_S32_t)t_fine)>>1) – (BMP280_S32_t)64000;
            v1 = Fn.s32(fine >> 1) - 64000;

            // var2 = (((var1>>2) * (var1>>2)) >> 11 ) * ((BMP280_S32_t)dig_P6);
            v2 = (((v1 >> 2) * (v1 >> 2)) >> 11) * Fn.s32(dig.P6);

            // var2 = var2 + ((var1*((BMP280_S32_t)dig_P5))<<1);
            v2 += (v1 * Fn.s32(dig.P5)) << 1;

            // var2 = (var2>>2)+(((BMP280_S32_t)dig_P4)<<16);
            v2 = (v2 >> 2) + (Fn.s32(dig.P4) << 16);


            // var1 = (((dig_P3 * (((var1>>2) * (var1>>2)) >> 13 )) >> 3) +
            //          ((((BMP280_S32_t)dig_P2) * var1)>>1))>>18;
            v1 = (((dig.P3 * (((v1 >> 2) * (v1 >> 2)) >> 13)) >> 3) + ((Fn.s32(dig.P2) * v1) >> 1)) >> 18;

            // var1 =((((32768+var1))*((BMP280_S32_t)dig_P1))>>15);
            v1 = (((Fn.POW_2_15 + v1) * Fn.s32(dig.P1)) >> 15);

            if (v1 === 0) {
              // Prevent division by zero
              return 0;
            }

            // p = (((BMP280_U32_t)(((BMP280_S32_t)1048576)-adc_P)-(var2>>12)))*3125;
            compensated = Fn.u32((Fn.s32(Fn.POW_2_20) - P) - (v2 >> 12)) * 3125;

            if (compensated < Fn.POW_2_31) {
              // p = (p << 1) / ((BMP280_U32_t)var1);
              compensated = ((compensated << 1) >>> 0) / Fn.u32(v1);
            } else {
              // p = (p / (BMP280_U32_t)var1) * 2;
              compensated = ((compensated / Fn.u32(v1)) >>> 0) * 2;
            }

            compensated = Fn.u32(compensated) >>> 0;

            // var1 = (((BMP280_S32_t)dig_P9) * ((BMP280_S32_t)(((p>>3) * (p>>3))>>13)))>>12;
            var compshift3r = compensated >> 3;
            v1 = (Fn.s32(dig.P9) * Fn.s32(((compshift3r * compshift3r) >> 13))) >> 12;

            // var2 = (((BMP280_S32_t)(p>>2)) * ((BMP280_S32_t)dig_P8))>>13;
            v2 = (Fn.s32(compensated >> 2) * Fn.s32(dig.P8)) >> 13;

            // p = (BMP280_U32_t)((BMP280_S32_t)p + ((var1 + var2 + dig_P7) >> 4));
            compensated = Fn.u32(Fn.s32(compensated) + ((v1 + v2 + dig.P7) >> 4));

            // Steps of 1Pa (= 0.01hPa = 0.01mbar) (=> 0.001kPa)
            computed.pressure = compensated;

            // Calculating pressure at sea level (copied from BMP180)
            var seapress = compensated / Math.pow(1 - elevation * 0.0000225577, 5.255);
            var altitude = 44330 * (1 - Math.pow(compensated / seapress, 1 / 5.255));

            // Page 3
            // ...relative accuracy is ±0.12 hPa, which is equivalent to
            // ±1 m difference in altitude.
            computed.altitude = Math.round(altitude - offset);

            this.emit("data", computed);
          }.bind(this));
        }.bind(this));
      }
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers.BMP280.ADDRESSES.value[0];
        return "bmp280-" + address;
      }
    }
  },

  BME280: {
    ADDRESSES: {
      value: [0x77]
    },
    REGISTER: {
      value: {
        COEFFICIENTS_TP: 0x88,
        COEFFICIENTS_H: 0xE1,
        CONFIG: 0xF5,
        MEASURE_H: 0xF2,
        MEASURE_TP: 0xF4,
        // 0xF7, 0xF8, 0xF9
        //  MSB,  LSB, XLSB
        PRESSURE: 0xF7,
        // 0xFA, 0xFB, 0xFC
        //  MSB,  LSB, XLSB
        TEMPERATURE: 0xFA,
        // 0xFD, 0xFE
        //  MSB,  LSB
        RESET: 0xE0,
      }
    },
    initialize: {
      value: function(board, opts) {
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];
        var elevation = null;
        var offset = 0;

        if (typeof opts.elevation !== "undefined") {
          elevation = opts.elevation;
        }

        if ((elevation != null && elevation <= 0) ||
            elevation == null) {
          offset = Math.abs(elevation) + 1;
          elevation = 1;
        }

        opts.address = address;

        /**
         * All page numbers refer to pages in:
         * https://cdn.sparkfun.com/assets/learn_tutorials/4/1/9/BST-BME280_DS001-10.pdf
         *
         */

        var dig = {
          T1: null,
          T2: null,
          T3: null,
          P1: null,
          P2: null,
          P3: null,
          P4: null,
          P5: null,
          P6: null,
          P7: null,
          P8: null,
          P9: null,
          H1: null,
          H2: null,
          H3: null,
          H4: null,
          H5: null,
          H6: null,
        };

        io.i2cConfig(opts);

        // Page. 24
        // 4.3.2 Register 0xE0 "reset"
        io.i2cWrite(address, this.REGISTER.RESET, 0xB6);

        var pCoefficients = new Promise(function(resolveCoeffs) {

          // Page 22,
          // Table 16: Compensation parameter storage, naming and data type
          // These are received LSB FIRST
          //
          // The H register is not contiguous!


          Promise.all([
            new Promise(function(resolve) {
              io.i2cReadOnce(address, 0x88, 24, function(data) {
                dig.T1 = uint16(data[1], data[0]);
                dig.T2 = int16(data[3], data[2]);
                dig.T3 = int16(data[5], data[4]);

                dig.P1 = uint16(data[7], data[6]);
                dig.P2 = int16(data[9], data[8]);
                dig.P3 = int16(data[11], data[10]);
                dig.P4 = int16(data[13], data[12]);
                dig.P5 = int16(data[15], data[14]);
                dig.P6 = int16(data[17], data[16]);
                dig.P7 = int16(data[19], data[18]);
                dig.P8 = Fn.s32(int16(data[21], data[20]));
                dig.P9 = Fn.s32(int16(data[23], data[22]));
                resolve();
              });
            }),
            new Promise(function(resolve) {
              io.i2cReadOnce(address, 0xA1, 1, function(data) {
                dig.H1 = Fn.u8(data[0]);
                resolve();
              });
            }),
            new Promise(function(resolve) {
              io.i2cReadOnce(address, 0xE1, 8, function(data) {
                /*
                  0xE1 => data[0]
                  0xE2 => data[1]
                  0xE3 => data[2]
                  0xE4 => data[3]
                  0xE5 => data[4]
                  0xE6 => data[5]
                  0xE7 => data[6]
                */

                //        0xE2   0xE1
                // H2   [15:8]  [7:0]
                dig.H2 = Fn.s32(int16(data[1], data[0]));

                //  0xE3
                dig.H3 = Fn.s32(data[2]);

                // Special Bit arrangements for H4 & H5
                //
                //      0xE5    0xE4
                // H4  [3:0]  [11:4]     signed short
                //      0xE6    0xE5
                // H5 [11:4]   [3:0]    signed short

                dig.H4 = Fn.s32((data[3] << 4) | (data[4] & 0xF));
                dig.H5 = Fn.s32((data[5] << 4) | (data[4] >> 4));

                // 0xE7
                dig.H6 = Fn.s8(data[6]);

                resolve();
              });
            })
          ]).then(resolveCoeffs);
        }.bind(this));

        pCoefficients.then(function() {
          /*
            Table 19: Register 0xF2 "ctrl_hum"

            Bit 2, 1, 0
            Controls oversampling of humidity


            osrs_h[2:0] Humidity oversampling
            000 Skipped (output set to 0x8000)
            001 oversampling ×1
            010 oversampling ×2
            011 oversampling ×4
            100 oversampling ×8
            101, others oversampling ×16

            |           |       | HUM       |
            | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
            | - | - | - | - | - | - | - | - |
            | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 |
          */
          io.i2cWrite(address, this.REGISTER.MEASURE_H, 0x05);

          /*
            Table 22: Register 0xF2 "ctrl_meas"

            Bit 7, 6, 5
            Controls oversampling of temperature data

            Bit 4, 3, 2
            Controls oversampling of pressure data

            Bit 1, 0
            Controls the sensor mode of the device


            osrs_h[2:0] Humidity oversampling
            000 Skipped (output set to 0x8000)
            001 oversampling ×1
            010 oversampling ×2
            011 oversampling ×4
            100 oversampling ×8
            101, others oversampling ×16


            000 Skipped (output set to 0x80000)
            001 oversampling ×1
            010 oversampling ×2
            011 oversampling ×4
            100 oversampling ×8
            101, others oversampling ×16

            00 Sleep mode
            01 and 10 Forced mode
            11 Normal mode

            | TEMP      | PRES      | Mode  |
            | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
            | - | - | - | - | - | - | - | - |
            | 1 | 0 | 1 | 1 | 0 | 1 | 1 | 1 |

          */
          io.i2cWrite(address, this.REGISTER.MEASURE_TP, 0xB7);


          var computed = {
            altitude: null,
            pressure: null,
            humidity: null,
            temperature: null,
          };

          //
          // Page 12
          // 3.3.1 Pressure measurement
          //
          // Page 13
          // 3.3.2 Temperature measurement
          //

          io.i2cRead(address, this.REGISTER.PRESSURE, 8, function(data) {
            var compensated = 0;

            // Page 45
            // "Returns temperature in DegC, double precision. Output value of
            // '51.23' equals 51.23 DegC. t_fine carries fine temperature as global value"
            var fine;

            // var1, var2
            //
            // Expect:
            //
            // int32
            //
            var v1, v2, vx;

            // Page 50
            // "Both pressure and temperature values are expected to be
            // received in 20 bit format, positive, stored in a 32 bit signed integer. "
            //
            //  V = int32(uint24(m, l, xl))
            //  V >> 4;
            //

            // Page 50
            var P = Fn.s32(uint24(data[0], data[1], data[2]));
            var T = Fn.s32(uint24(data[3], data[4], data[5]));
            var H = Fn.s32(uint16(data[6], data[7]));

            P >>= 4;
            T >>= 4;

            // TEMPERATURE

            // Page 23
            // bmp280_compensate_T_int32
            // var1 = ((((adc_T>>3) – ((BMP280_S32_t)dig_T1<<1))) *
            //                        ((BMP280_S32_t)dig_T2)) >> 11;
            // var2 = (((((adc_T>>4) – ((BMP280_S32_t)dig_T1)) *
            //          ((adc_T>>4) – ((BMP280_S32_t)dig_T1))) >> 12) *
            //          ((BMP280_S32_t)dig_T3)) >> 14;
            //
            //
            var adc16 = T >> 4;
            var adc16subT1 = adc16 - dig.T1;
            v1  = (((T >> 3) - (dig.T1 << 1)) * dig.T2) >> 11;
            v2  = (((adc16subT1 * adc16subT1) >> 12) * dig.T3) >> 14;

            // t_fine = var1 + var2;
            fine = v1 + v2;

            // Page 7, 8
            // Table 2: Parameter specification
            //
            //
            // Temperature 0.01 °C
            //
            // As toFixed(2)
            //
            // C = +(((t_fine * 5 + 128) >> 8) / 100).toFixed(resolution)
            //
            computed.temperature = ((fine * 5 + 128) >> 8) / 100;

            v1 = undefined;
            v2 = undefined;


            // PRESSURE
            // Page 23
            // bmp280_compensate_P_int32
            //
            // Every single seemingly arbitrary magic number comes from the datasheet.
            // Datasheets are evidently written by people that don't care about
            // anyone else actually understanding how a thing works.
            //

            // var1 = (((BMP280_S32_t)t_fine)>>1) – (BMP280_S32_t)64000;
            v1 = Fn.s32(fine >> 1) - 64000;

            // var2 = (((var1>>2) * (var1>>2)) >> 11 ) * ((BMP280_S32_t)dig_P6);
            v2 = (((v1 >> 2) * (v1 >> 2)) >> 11) * Fn.s32(dig.P6);

            // var2 = var2 + ((var1*((BMP280_S32_t)dig_P5))<<1);
            v2 += (v1 * Fn.s32(dig.P5)) << 1;

            // var2 = (var2>>2)+(((BMP280_S32_t)dig_P4)<<16);
            v2 = (v2 >> 2) + (Fn.s32(dig.P4) << 16);


            // var1 = (((dig_P3 * (((var1>>2) * (var1>>2)) >> 13 )) >> 3) +
            //          ((((BMP280_S32_t)dig_P2) * var1)>>1))>>18;
            v1 = (((dig.P3 * (((v1 >> 2) * (v1 >> 2)) >> 13)) >> 3) + ((Fn.s32(dig.P2) * v1) >> 1)) >> 18;

            // var1 =((((32768+var1))*((BMP280_S32_t)dig_P1))>>15);
            v1 = (((Fn.POW_2_15 + v1) * Fn.s32(dig.P1)) >> 15);

            if (v1 === 0) {
              // Prevent division by zero
              return 0;
            }

            // p = (((BMP280_U32_t)(((BMP280_S32_t)1048576)-adc_P)-(var2>>12)))*3125;
            compensated = Fn.u32((Fn.s32(Fn.POW_2_20) - P) - (v2 >> 12)) * 3125;

            if (compensated < Fn.POW_2_31) {
              // p = (p << 1) / ((BMP280_U32_t)var1);
              compensated = ((compensated << 1) >>> 0) / Fn.u32(v1);
            } else {
              // p = (p / (BMP280_U32_t)var1) * 2;
              compensated = ((compensated / Fn.u32(v1)) >>> 0) * 2;
            }

            compensated = Fn.u32(compensated) >>> 0;

            // var1 = (((BMP280_S32_t)dig_P9) * ((BMP280_S32_t)(((p>>3) * (p>>3))>>13)))>>12;
            var compshift3r = compensated >> 3;
            v1 = (Fn.s32(dig.P9) * Fn.s32(((compshift3r * compshift3r) >> 13))) >> 12;

            // var2 = (((BMP280_S32_t)(p>>2)) * ((BMP280_S32_t)dig_P8))>>13;
            v2 = (Fn.s32(compensated >> 2) * dig.P8) >> 13;

            // p = (BMP280_U32_t)((BMP280_S32_t)p + ((var1 + var2 + dig_P7) >> 4));
            compensated = Fn.u32(Fn.s32(compensated) + ((v1 + v2 + dig.P7) >> 4));

            // Steps of 1Pa (= 0.01hPa = 0.01mbar) (=> 0.001kPa)
            computed.pressure = compensated;

            // Calculating pressure at sea level (copied from BMP180)
            var seapress = compensated / Math.pow(1 - elevation * 0.0000225577, 5.255);
            var altitude = 44330 * (1 - Math.pow(compensated / seapress, 1 / 5.255));

            // Page 3
            // ...relative accuracy is ±0.12 hPa, which is equivalent to
            // ±1 m difference in altitude.
            computed.altitude = Math.round(altitude - offset);


            // Page 23, 24
            // BME280_U32_t bme280_compensate_H_int32(BME280_S32_t adc_H)

            // BME280_S32_t v_x1_u32r;
            // v_x1_u32r = (t_fine – ((BME280_S32_t)76800));
            vx = Fn.s32(fine - 76800);

            // v_x1_u32r = (((((adc_H << 14) – (((BME280_S32_t)dig_H4) << 20) – (((BME280_S32_t)dig_H5) * v_x1_u32r)) +
            // ((BME280_S32_t)16384)) >> 15) * (((((((v_x1_u32r * ((BME280_S32_t)dig_H6)) >> 10) * (((v_x1_u32r * ((BME280_S32_t)dig_H3)) >> 11) + ((BME280_S32_t)32768))) >> 10) + ((BME280_S32_t)2097152)) *
            // ((BME280_S32_t)dig_H2) + 8192) >> 14));

            vx = (((((H << 14) - Fn.s32(dig.H4 << 20) - (dig.H5 * vx)) + Fn.POW_2_14) >> 15) *
                  (((((((vx * dig.H6) >> 10) * (((vx * dig.H3) >> 11) + Fn.POW_2_15)) >> 10) + Fn.POW_2_21) * dig.H2 + Fn.POW_2_13) >> 14));

            // v_x1_u32r = (v_x1_u32r - (((((v_x1_u32r >> 15) * (v_x1_u32r >> 15)) >> 7) * ((int32_t)_bme280_calib.dig_H1)) >> 4));
            vx -= (((((vx >> 15) * (vx >> 15)) >> 7) * Fn.s32(dig.H1) >> 4));

            // v_x1_u32r = (v_x1_u32r < 0 ? 0 : v_x1_u32r);
            // v_x1_u32r = (v_x1_u32r > 419430400 ? 419430400 : v_x1_u32r);
            vx = Fn.constrain(vx, 0, 419430400);

            computed.humidity = Fn.u32(vx >> 12);

            this.emit("data", computed);
          }.bind(this));
        }.bind(this));
      }
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers.BME280.ADDRESSES.value[0];
        return "bme280-" + address;
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
        var address = opts.address || Drivers.SI7020.ADDRESSES.value[0];
        return "si7020-" + address;
      }
    },
  },

  MS5611: {
    ADDRESSES: {
      value: [0x77]
    },
    REGISTER: {
      value: {
        COEFFICIENTS: 0xA2,
        READ: 0x00,
        PRESSURE: 0x40,
        TEMPERATURE: 0x50,
        RESET: 0x1E,
      }
    },
    initialize: {
      value: function(board, opts) {
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];
        var elevation = null;
        var offset = 0;


        if (typeof opts.elevation !== "undefined") {
          elevation = opts.elevation;
        }

        if ((elevation != null && elevation <= 0) ||
            elevation == null) {
          offset = Math.abs(elevation) + 1;
          elevation = 1;
        }

        opts.address = address;

        var computed = {
          altitude: null,
          pressure: null,
          temperature: null,
        };

        /**
         * http://www.hpinfotech.ro/MS5611-01BA03.pdf
         *
         * Page 6
         *
         * Startup in I2C Mode
         *
         * 1. Reset
         * 2. Read PROM (128 bits of calibration data)
         * 3. D1 Conversion
         * 4. D2 Conversion
         * 5. Read ADC (24 but pressure/temperature)
         *
         *
         */

        var mode = opts.mode || 5;
        /*
        [
         ULTRA_LOW_POWER
         LOW_POWER
         STANDARD
         HIGH_RES
         ULTRA_HIGH_RES *
         ]
         */

        var kpDelay = [1, 2, 3, 4, 5, 10][mode];

        /**
         * http://www.hpinfotech.ro/MS5611-01BA03.pdf
         *
         * Page 7
         * Variable, Description | Equation, Type, size, min, max, Example/Typical
         * C1 Pressure sensitivity | SENST1 unsigned int 16 16 0 65535 40127
         * C2 Pressure offset | OFFT1 unsigned int 16 16 0 65535 36924
         * C3 Temperature coefficient of pressure sensitivity | TCS unsigned int 16 16 0 65535 23317
         * C4 Temperature coefficient of pressure offset | TCO unsigned int 16 16 0 65535 23282
         * C5 Reference temperature | TREF unsigned int 16 16 0 65535 33464
         * C6 Temperature coefficient of the temperature | TEMPSENS unsigned int 16 16 0 65535 2
         *
         */

        var cof = {
          C1: null,
          C2: null,
          C3: null,
          C4: null,
          C5: null,
          C6: null,
        };

        var cKeys = Object.keys(cof);


        // TODO: confirm this is actually necessary?
        opts.delay = kpDelay * 1000;

        io.i2cConfig(opts);
        io.i2cWrite(address, this.REGISTER.RESET);

        var pCoefficients = new Promise(function(resolve) {
          // First, a small delay is required following the reset...
          setTimeout(function() {
            // Next, each coefficient must be read on it's own.
            var cofs = cKeys.map(function(key, index) {
              var register = this.REGISTER.COEFFICIENTS + (index * 2);
              return new Promise(function(resolve) {
                io.i2cReadOnce(address, register, 2, function(data) {
                  cof[key] = uint16(data[0], data[1]);
                  resolve();
                });
              });
            }.bind(this));

            Promise.all(cofs).then(resolve);
          }.bind(this), 50);
        }.bind(this));

        pCoefficients.then(function() {

          // http://www.hpinfotech.ro/MS5611-01BA03.pdf
          // Page 7
          // Page 8
          //
          var cycle = 0;
          var D1, D2;
          var dT, TEMP, OFF, SENS, P;
          var TEMP2, OFF2, SENS2;

          var readCycle = function() {

            // cycle 0: temperature
            // cycle 1: pressure

            var isTemperatureCycle = cycle === 0;
            var component = (isTemperatureCycle ? 0x50 : 0x40) + mode;

            io.i2cWrite(address, component);

            if (isTemperatureCycle) {
              D2 = 0;
              dT = 0;
              TEMP = 0;
              TEMP2 = 0;
              OFF2 = 0;
              SENS2 = 0;
            } else {
              D1 = 0;
              OFF = 0;
              SENS = 0;
              P = 0;
            }

            // Once the READ_START register is set,
            // delay the READ_RESULT request based on the
            // mode value provided by the user, or default.
            setTimeout(function() {
              io.i2cReadOnce(address, this.REGISTER.READ, 3, function(data) {

                if (isTemperatureCycle) {
                  // TEMPERATURE
                  D2 = uint24(data[0], data[1], data[2]);

                  // Calculate temperature
                  // Page 7
                  // Difference between actual and reference temperature [2]
                  // dT
                  //  = D2 - TREF
                  //  = D2 - C5 * (2 ** 8)
                  dT = D2 - (cof.C5 * Fn.POW_2_8);

                  // Actual temperature (-40…85°C with 0.01°C resolution)
                  // TEMP
                  //  = 20°C + dT * TEMP * SENS
                  //  = 2000 + dT * C6 / (2 ** 23)
                  TEMP = 2000 + dT * cof.C6 / Fn.POW_2_23;

                  // SECOND ORDER TEMPERATURE COMPENSATION
                  // Page 8
                  // These ridiculous magic numbers come from
                  // the datasheet. No explanation is given.
                  //
                  if (TEMP < 2000) {
                    TEMP2 = Math.pow(dT, 2) / Fn.POW_2_31;
                    OFF2 = 5 * Math.pow(TEMP - 2000, 2) / 2;
                    SENS2 = 5 * Math.pow(TEMP - 2000, 2) / Fn.POW_2_2;

                    if (TEMP < -1500) {
                      OFF2 = OFF2 + 7 * Math.pow(TEMP + 1500, 2);
                      SENS2 = SENS2 + 11 * Math.pow(TEMP + 1500, 2) / 2;
                    }
                  }


                  TEMP -= TEMP2;

                  computed.temperature = TEMP / 100;
                } else {
                  // PRESSURE
                  D1 = uint24(data[0], data[1], data[2]);

                  // Offset at actual temperature [3]
                  // OFF
                  //  = OFFT1 +TCO* dT = C2 * (2 ** 16) + (C4 * dT )/ (2 ** 7)
                  OFF = cof.C2 * Fn.POW_2_16 + (cof.C4 * dT) / Fn.POW_2_7;

                  // Sensitivity at actual temperature [4]
                  // SENS =SENST1 +TCS* dT= C1 * (2 ** 15) + (C3 * dT )/ (2 ** 8)
                  SENS = cof.C1 * Fn.POW_2_15 + (cof.C3 * dT) / Fn.POW_2_8;

                  // SECOND ORDER TEMPERATURE COMPENSATION
                  // Page 8
                  OFF -= OFF2;
                  SENS -= SENS2;

                  // Temperature compensated pressure (10…1200mbar with 0.01mbar resolution)
                  // P = D1 * SENS - OFF = (D1 * SENS / 2 21 - OFF) / 2 15
                  P = (D1 * SENS / Fn.POW_2_21 - OFF) / Fn.POW_2_15;

                  // Steps of 1Pa (= 0.01hPa = 0.01mbar) (=> 0.001kPa)
                  computed.pressure = P;

                  // Sea level pressure...
                  var seapress = P / Math.pow(1 - elevation * 0.0000225577, 5.255);
                  var altitude = 44330 * (1 - Math.pow(P / seapress, 1 / 5.255));

                  computed.altitude = altitude - offset;
                }

                if (++cycle === 2) {
                  cycle = 0;
                  this.emit("data", computed);
                }

                readCycle();
              }.bind(this));
            }.bind(this), kpDelay);
          }.bind(this);

          // Kick off "read loop"
          //
          readCycle();
        }.bind(this));
      }
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers.MS5611.ADDRESSES.value[0];
        return "ms5611-" + address;
      }
    },
  },

  TH02: {
    ADDRESSES: {
      value: [0x40]
    },
    COMMAND: {
      value: {
        MEASURE_HUMIDITY: 0x01,
        MEASURE_TEMPERATURE: 0x11,
      }
    },
    REGISTER: {
      value: {
        STATUS: 0x00,
        READ: 0x01,
        CONFIG: 0x03,
      }
    },
    initialize: {
      value: function(board, opts) {
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];

        opts.address = address;

        var cof = {
          // Table 10. Linearization Coefficients
          A0: -4.7844,
          A1:  0.4008,
          A2: -0.00393,

          // Table 11. Linearization Coefficients
          Q0: 0.1973,
          Q1: 0.00237,
        };

        var linear = {
          temperature: null,
          humidity: null,
        };

        var actual = {
          temperature: null,
          humidity: null,
        };

        var computed = {
          temperature: null,
          humidity: null,
        };

        var cycle = 0;

        io.i2cConfig(
          Object.assign(opts, {
            settings: {
              stopTX: true
            }
          })
        );

        var readCycle = function() {
          // 1. Determine which data we want to request
          var isTemperatureCycle = cycle === 0;
          var command = isTemperatureCycle ?
            this.COMMAND.MEASURE_TEMPERATURE :
            this.COMMAND.MEASURE_HUMIDITY;


          // 2. Send the appropriate measurement/conversion
          //    command for this read cycle.
          io.i2cWrite(address, this.REGISTER.CONFIG, command);

          // 3. Await an affirmative status result. This signifies that
          //    measurement and conversion are complete and values may
          //    be read from the peripheral register.get
          //
          //    Register design like this is really painful to work
          //    with. These peripherals have ample space to store data
          //    in different registers, but do not.
          var conversion = new Promise(function(resolve) {
            var requestStatus = function() {
              io.i2cReadOnce(address, this.REGISTER.STATUS, 1, function(data) {
                var status = data[0];

                if (status === 0) {
                  resolve();
                } else {
                  requestStatus();
                }
              });
            }.bind(this);

            requestStatus();
          }.bind(this));

          // http://www.seeedstudio.com/wiki/images/3/30/TH02_SENSOR.pdf
          // Page. 16
          // http://www.seeedstudio.com/wiki/images/3/30/TH02_SENSOR.pdf
          // Page. 18
          //
          conversion.then(function() {
            // Both values will be placed in the 0x01 after
            // the command is received and the measurement taken.

            // The datasheet _SAYS_ read the MSB and LSB from 0x01 and 0x02,
            // but in reality, reading from 0x01 produces nothing. Trial and
            // error testing resulted in discovering the correct data located
            // in 0x02 & 0x03.
            //
            // One might assume that we could then read 2 bytes from 0x02,
            // but that also produces garbage, so in the end we need to read
            // 3 bytes from 0x01.
            io.i2cReadOnce(address, this.REGISTER.READ, 3, function(data) {
              var value = uint16(data[1], data[2]);

              if (isTemperatureCycle) {
                /*
                | DATA MSB                      | DATA LSB                      |
                | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
                | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
                |    14-Bit Temperature Code                            | 0 | 0 |
                */

                computed.temperature = ((value >> 2) / 32) - 50;
              } else {
                /*
                | DATA MSB                      | DATA LSB                      |
                | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
                | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
                |    12-Bit Humidity Code                       | 0 | 0 | 0 | 0 |
                */

                /*
                Typical %RH Measurements

                | %RH | 12  Bit Value |
                | --- | ------------- |
                | 0   | 384           |
                | 10  | 544           |
                | 20  | 704           |
                | 30  | 864           |
                | 40  | 1024          |
                | 50  | 1184          |
                | 60  | 1344          |
                | 70  | 1504          |
                | 80  | 1664          |
                | 90  | 1824          |
                | 100 | 1984          |
                */

                actual.humidity = ((value >> 4) / 16) - 24;
                linear.humidity = actual.humidity - (Math.pow(actual.humidity, 2) * cof.A2 + actual.humidity * cof.A1 + cof.A0);
                computed.humidity = linear.humidity + (computed.temperature - 30) * (linear.humidity * cof.Q1 + cof.Q0);
              }

              if (++cycle === 2) {
                cycle = 0;
                this.emit("data", computed);
              }

              readCycle();
            }.bind(this));
          }.bind(this));
        }.bind(this);

        readCycle();
      },
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers.TH02.ADDRESSES.value[0];
        return "th02-" + address;
      }
    }
  },
};

// Otherwise known as...
Drivers.BMP085 = Drivers.BMP180;
Drivers["MPU-6050"] = Drivers.MPU6050;

Drivers.get = function(board, driverName, opts) {
  var drivers, driverKey, driver;

  if (!activeDrivers.has(board)) {
    activeDrivers.set(board, {});
  }

  opts = opts || {};

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
        var CONTROLLER = "MPU6050";

        state.accelerometer = new Accelerometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.gyro = new Gyro(
          Object.assign({
            controller: CONTROLLER,
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
        var CONTROLLER = "BNO055";

        state.calibrationMask = opts.calibrationMask || 0xC0;

        // here we want to catch the events coming out of the driver and re-emit them
        // not sure what is cleaner here, picking these up from a data event
        // in the sub controllers, or this
        var driver = IMU.Drivers.get(this.board, CONTROLLER, opts);
        driver.on("calibrated", function() {
          this.emit("calibrated");
        }.bind(this));

        driver.on("calibration", function(state) {
          this.emit("calibration", state);
        }.bind(this));

        state.accelerometer = new Accelerometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.gyro = new Gyro(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.magnetometer = new Compass(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.orientation = new Orientation(
          Object.assign({
            controller: CONTROLLER,
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
      get: function() {
        //returns if the system and all sensors are fully calibrated
        var calibrationMask = priv.get(this).calibrationMask;
        return (this.orientation.calibration & calibrationMask) === calibrationMask;
      }
    }
  },
  MPL115A2: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);
        var CONTROLLER = "MPL115A2";

        state.barometer = new Barometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: CONTROLLER,
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
  SHT31D: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);
        var CONTROLLER = "SHT31D";

        state.hygrometer = new Hygrometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: CONTROLLER,
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
  HTU21D: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);
        var CONTROLLER = "HTU21D";

        state.hygrometer = new Hygrometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: CONTROLLER,
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
  DHT11_I2C_NANO_BACKPACK: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);
        var CONTROLLER = "DHT11_I2C_NANO_BACKPACK";

        state.hygrometer = new Hygrometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: CONTROLLER,
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
        var CONTROLLER = "MPL3115A2";

        state.barometer = new Barometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.altimeter = new Altimeter(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: CONTROLLER,
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
        var CONTROLLER = "BMP180";

        // This controller and driver pair are used for both
        // BMP180 and BMP085

        state.altimeter = new Altimeter(
          Object.assign({
            controller: opts.controller || CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.barometer = new Barometer(
          Object.assign({
            controller: opts.controller || CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: opts.controller || CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );
      }
    },
    components: {
      value: ["altimeter", "barometer", "thermometer"]
    },
    altimeter: {
      get: function() {
        return priv.get(this).altimeter;
      }
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

  BMP280: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);
        var CONTROLLER = "BMP280";

        state.altimeter = new Altimeter(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.barometer = new Barometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );
      }
    },
    components: {
      value: ["altimeter", "barometer", "thermometer"]
    },
    altimeter: {
      get: function() {
        return priv.get(this).altimeter;
      }
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
  BME280: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);
        var CONTROLLER = "BME280";

        state.altimeter = new Altimeter(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.barometer = new Barometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.hygrometer = new Hygrometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );
      }
    },
    components: {
      value: ["altimeter", "barometer", "hygrometer", "thermometer"]
    },
    altimeter: {
      get: function() {
        return priv.get(this).altimeter;
      }
    },
    barometer: {
      get: function() {
        return priv.get(this).barometer;
      }
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
  SI7020: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);
        var CONTROLLER = "SI7020";

        state.hygrometer = new Hygrometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: CONTROLLER,
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
  MS5611: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);
        var CONTROLLER = "MS5611";


        state.altimeter = new Altimeter(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.barometer = new Barometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: CONTROLLER,
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

  TH02: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);
        var CONTROLLER = "TH02";

        state.hygrometer = new Hygrometer(
          Object.assign({
            controller: CONTROLLER,
            freq: opts.freq,
            board: this.board,
          }, opts)
        );

        state.thermometer = new Thermometer(
          Object.assign({
            controller: CONTROLLER,
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
};

// Otherwise known as...
Controllers["MPU-6050"] = Controllers.MPU6050;
Controllers["GY521"] = Controllers["GY-521"] = Controllers.MPU6050;
Controllers["BMP085"] = Controllers["BMP-085"] = Controllers.BMP180;

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
    throw new Error("Missing IMU/Multi controller");
  }

  this.freq = opts.freq || 20;

  state = {};
  priv.set(this, state);

  Board.Controller.call(this, controller, opts);

  if (typeof this.initialize === "function") {
    this.initialize(opts);
  }

  // The IMU/Multi isn't considered "ready"
  // until one of the components has notified via
  // a change event.
  this.isReady = false;

  setInterval(function() {
    if (this.isReady) {
      this.emit("data", this);
    }
  }.bind(this), this.freq);

  var awaiting = this.components.slice();

  if (this.components && this.components.length > 0) {
    this.components.forEach(function(component) {
      if (!(this[component] instanceof Emitter)) {
        return;
      }

      this[component].on("change", function() {
        if (awaiting.length) {
          var index = awaiting.indexOf(component);

          if (index !== -1) {
            awaiting.splice(index, 1);
          }
        }

        if (!awaiting.length && !this.isReady) {
          this.isReady = true;
        }

        if (this.isReady) {
          this.emit("change", this, component);
        }
      }.bind(this));
    }, this);
  }
}

util.inherits(IMU, Emitter);

IMU.Drivers = Drivers;

module.exports = IMU;
