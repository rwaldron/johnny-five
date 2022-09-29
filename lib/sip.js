const Board = require("./board");
const Emitter = require("./mixins/emitter");
const Fn = require("./fn");
const priv = new Map();
const activeDrivers = new Map();
const {
  int16,
  uint16,
  uint24,
  s32,
  u32,
} = Fn;

const ACCELEROMETER = "accelerometer";
const ALTIMETER = "altimeter";
const BAROMETER = "barometer";
const GYRO = "gyro";
const HYGROMETER = "hygrometer";
const MAGNETOMETER = "magnetometer";
const ORIENTATION = "orientation";
const THERMOMETER = "thermometer";

function Components(controller, options) {
  const state = priv.get(this);
  const descriptors = Object.create(null);

  for (const component of this.components) {
    // TODO: Can this be put inside the get accessor?
    // - Lazy init?
    state[component] = new Components[component](
      Object.assign({
        controller: options.controller || controller,
        freq: options.freq,
        board: this.board,
      }, options)
    );

    descriptors[component] = {
      get() {
        return state[component];
      }
    };

    // TODO: Get rid of this trash
    if (backwardCompatibilityGarbageHacks[component]) {
      descriptors[backwardCompatibilityGarbageHacks[component]] = descriptors[component];
    }
  }

  Object.defineProperties(this, descriptors);
}

Components.accelerometer = require("./accelerometer");
Components.altimeter = require("./altimeter");
Components.barometer = require("./barometer");
Components.gyro = require("./gyro");
Components.hygrometer = require("./hygrometer");
Components.magnetometer = require("./compass");
Components.orientation = require("./orientation");
Components.thermometer = require("./thermometer");

const backwardCompatibilityGarbageHacks = {
  thermometer: "temperature",
};

const Drivers = {
  SHT31D: {
    ADDRESSES: {
      value: [0x44]
    },
    REGISTER: {
      value: {
        // Table 13
        SOFT_RESET: 0x30A2,
        // Table 8
        MEASURE_HIGH_REPEATABILITY: 0x2400,
      }
    },
    initialize: {
      value(board, options) {
        const READLENGTH = 6;
        const io = board.io;
        const address = Drivers.addressResolver(this, options);
        io.i2cConfig(options);

        io.i2cWrite(address, [
          // Page 12, Table 13
          this.REGISTER.SOFT_RESET >> 8,
          this.REGISTER.SOFT_RESET & 0xFF,
        ]);

        const computed = {
          temperature: null,
          humidity: null,
        };

        // temp msb, temp lsb, temp CRC, humidity msb, humidity lsb, humidity CRC
        const readCycle = () => {
          // Page 10, Table 8
          // Send high repeatability measurement command
          io.i2cWrite(address, [
            this.REGISTER.MEASURE_HIGH_REPEATABILITY >> 8,
            this.REGISTER.MEASURE_HIGH_REPEATABILITY & 0xFF,
          ]);

          setTimeout(() => {
            io.i2cReadOnce(address, READLENGTH, data => {
              computed.temperature = uint16(data[0], data[1]);
              computed.humidity = uint16(data[3], data[4]);
              this.emit("data", computed);
              readCycle();
            });
          }, 16);
        };

        readCycle();
      }
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.SHT31D, options);
        return `sht-31d-${address}`;
      }
    }
  },

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
      value(board, options) {
        const io = board.io;
        const address = Drivers.addressResolver(this, options);
        // The "no hold" measurement requires waiting
        // _at least_ 22ms between register write and
        // register read. Delay is measured in μs:
        // 22ms = 22000μs; recommend 50ms = 50000μs
        options.delay = 50000;

        io.i2cConfig(options);
        io.i2cWrite(address, this.REGISTER.SOFT_RESET);

        const computed = {
          temperature: null,
          humidity: null,
        };

        let cycle = 0;
        const readCycle = () => {
          // Despite the registers being back to back, the HTU21D
          // does not like when 5 bytes are requested, so we put
          // the two data sources on their own read channels.
          const isTemperatureCycle = cycle === 0;
          const register = isTemperatureCycle ? this.REGISTER.TEMPERATURE : this.REGISTER.HUMIDITY;

          io.i2cReadOnce(address, register, 2, data => {
            if (isTemperatureCycle) {
              computed.temperature = uint16(data[0], data[1]);
            } else {
              computed.humidity = uint16(data[0], data[1]);
            }

            if (++cycle === 2) {
              cycle = 0;
              this.emit("data", computed);
            }

            readCycle();
          });
        };

        readCycle();
      }
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.HTU21D, options);
        return `htu-s1d-${address}`;
      }
    }
  },
  HIH6130: {
    ADDRESSES: {
      value: [0x27]
    },
    initialize: {
      value(board, options) {
        const io = board.io;
        const address = Drivers.addressResolver(this, options);
        io.i2cConfig(options);

        const computed = {
          humidity: null,
          temperature: null,
        };

        let delay = 36.65;

        const measureCycle = () => {
          // The most common use cases involve continuous
          // sampling of sensor data, so that's what this
          // controller-driver will provide.
          io.i2cWrite(address, 0xA0, [0x00, 0x00]);

          setTimeout(() => {
            io.i2cWrite(address, 0x80, [0x00, 0x00]);
            io.i2cReadOnce(address, 4, data => {
              // Page 2, Figure 4.
              // Humidity and Temperature Data Fetch, Four Byte Data Read
              // B7:6 Contain status bits
              const status = data[0] >> 6;
              // Mask out B7:6 status bits from H MSB
              computed.humidity = int16(data[0] & 0x3F, data[1]);
              // Shift off B1:0 (which are empty)
              computed.temperature = int16(data[2], data[3] >> 2);

              // Page 3, 2.6 Status Bits
              //
              // 0 0 Normal
              // 0 1 Stale
              // 1 0 Command Mode
              // 1 1 Diagnostic Condition
              //
              // When the two status bits read "01", "stale" data is
              // indicated. This means that the data that already
              // exists in the sensor's output buffer has already
              // been fetched by the Master, and has not yet been
              // updated with the next data from the current measurement
              // cycle. This can happen when the Master polls the
              // data quicker than the sensor can update the output buffer.
              if (status === 0) {
                delay--;
              }

              if (status === 1) {
                delay++;
              }

              this.emit("data", computed);

              measureCycle();
            });
          // Page 3
          // 3.0 Measurement Cycle
          // The measurement cycle duration is typically
          // 36.65 ms for temperature and humidity readings.
          }, delay);
        };

        measureCycle();
      }
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.HIH6130, options);
        return `hih6130-${address}`;
      }
    }
  },
  DHT_I2C_NANO_BACKPACK: {
    ADDRESSES: {
      value: [0x0A]
    },
    REGISTER: {
      value: {
        READ: 0x00,
      }
    },
    initialize: {
      value(board, options) {
        const io = board.io;
        // Correspond to firmware variables
        const dhtPin = 2;
        let dhtType = 11;

        const address = Drivers.addressResolver(this, options);
        io.i2cConfig(options);

        const dhtVariantExec = /(\d{2})/.exec(options.controller);
        const dhtVariant = dhtVariantExec && dhtVariantExec.length && dhtVariantExec[0];

        if (dhtVariant) {
          dhtType = +dhtVariant;

          if (Number.isNaN(dhtType)) {
            dhtType = 11;
          }
        }

        const computed = {
          temperature: null,
          humidity: null,
        };

        io.i2cWrite(address, [dhtPin, dhtType]);
        io.i2cRead(address, 4, data => {
          computed.humidity = int16(data[0], data[1]);
          computed.temperature = int16(data[2], data[3]);
          this.emit("data", computed);
        });
      }
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.DHT_I2C_NANO_BACKPACK, options);
        return `dht_i2c_nano_backpack-${address}`;
      }
    }
  },
  MPU6050: {
    ADDRESSES: {
      value: [0x68, 0x69]
    },
    REGISTER: {
      value: {
        SETUP: [0x6B, 0x00],
        READ: 0x3B
      }
    },
    initialize: {
      value(board, options) {
        const READLENGTH = 14;
        const io = board.io;
        const address = Drivers.addressResolver(this, options);
        const computed = {
          accelerometer: {},
          temperature: {},
          gyro: {}
        };

        io.i2cConfig(options);
        io.i2cWrite(address, this.REGISTER.SETUP);

        io.i2cRead(address, this.REGISTER.READ, READLENGTH, data => {
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
        });
      },
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.MPU6050, options);
        return `mpu-6050-${address}`;
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
      value(board, options) {
        const io = board.io;

        // Page 67 4.3.54
        // a value for what we use to consider the system calibrated,
        // 0xC0 represents the just fusion algorithm/system
        const calibrationMask = options.calibrationMask || 0xC0;

        const address = Drivers.addressResolver(this, options);
        const computed = {
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

        io.i2cConfig(options);

        // Put chip into CONFIG operation mode
        io.i2cWriteReg(address, this.REGISTER.OPR_MODE_ADDR, this.REGISTER.OPR_MODES.CONFIG);

        // Set register page to 0
        io.i2cWriteReg(address, this.REGISTER.PAGE_ID_ADDR, this.REGISTER.PAGE_STATES.ZERO);

        // Page 70, 4.3.63 SYS_TRIGGER
        //
        // RST_SYS (Set to reset system)
        //
        // B7 B6 B5 B4 B3 B2 B1 B0
        //  0  0  1  0  0  0  0  0
        //
        io.i2cWriteReg(address, this.REGISTER.SYS_TRIGGER, 0x20);

        const por = new Promise(resolve => {
          setTimeout(() => {

            // Normal power mode
            io.i2cWriteReg(address, this.REGISTER.PWR_MODE_ADDR, this.REGISTER.PWR_MODES.NORMAL);

            // Page 70, 4.3.63 SYS_TRIGGER
            //
            // CLK_SEL:
            //
            // B7 B6 B5 B4 B3 B2 B1 B0
            //  0  0  0  0  0  0  0  0
            //
            //io.i2cWriteReg(address, this.REGISTER.SYS_TRIGGER, 0x00);
            // do we want to enable an external crystal??
            io.i2cWriteReg(address, this.REGISTER.SYS_TRIGGER, options.enableExternalCrystal ? 0x80 : 0x00);

            // AF Page 24 3.4, Axis remap
            //
            // AXIS_MAP_CONFIG:
            //
            // B7 B6 B5 B4 B3 B2 B1 B0
            //  0  0  0  0  0  0  0  0
            //  -  -  z  z  y  y  x  x
            //
            // x axis = 00, y axis = 01, z axis = 10
            //
            // see also the defaults starting on Page 50
            //
            const axisMap = options.axisMap || 0x24;
            io.i2cWriteReg(address, this.REGISTER.AXIS_MAP_CONFIG_ADDR, axisMap);

            // AF Page 24 3.4, Axis remap
            //
            // AXIS_MAP_CONFIG:
            //
            // B7 B6 B5 B4 B3 B2 B1 B0
            //  0  0  0  0  0  0  0  0
            //  -  -  -  -  -  x  y  z
            //
            // 0 = positive, 1 = negative
            //
            const axisSign = options.axisSign || 0x00;
            io.i2cWriteReg(address, this.REGISTER.AXIS_MAP_SIGN_ADDR, axisSign);

            // Set operational mode to "nine degrees of freedom"
            setTimeout(() => {
              io.i2cWriteReg(address, this.REGISTER.OPR_MODE_ADDR, this.REGISTER.OPR_MODES.NDOF);
              resolve();
            }, 10);

            // Page 13, 1.2, OPERATING CONDITIONS BNO055
            // From reset to config mode
          }, 650);
        });

        por.then(() => new Promise(resolve => {
          const readCalibration = () => {
            io.i2cReadOnce(address, this.REGISTER.CALIBRATION, 1, data => {

              const calibration = data[0];
              const didCalibrationChange = computed.calibration !== calibration;


              computed.calibration = calibration;

              // It is useful, possibly to know when the calibration state changes
              // some of the calibrations are a little picky to get right, so emitting
              // the calibration state as it changes is useful.
              if (didCalibrationChange) {
                this.emit("calibration", computed.calibration);
              }

              if ((calibration & calibrationMask) === calibrationMask) {

                // Emit the calibration state so we can work out in our userspace if
                // we are good to go, and for when we are performing the calibration steps
                // let everyone know we are calibrated.
                this.emit("calibrated");

                resolve();
              } else {
                readCalibration();
              }

            });
          };

          readCalibration();

        })).then(() => {

          // Temperature requires no calibration, begin reading immediately
          // here we read out temp, and the calibration state since they are back to back
          // and the device can, has been observed to go out of calibration and we may want to check
          io.i2cRead(address, this.REGISTER.READ.TEMP, 2, data => {
            computed.temperature = data[0];

            const didCalibrationChange = computed.calibration !== data[1];
            computed.calibration = data[1];

            this.emit("data", computed);
            if (didCalibrationChange) {
              this.emit("calibration", computed.calibration);
            }
          });


          // ACCEL, MAG and GYRO are 6 bytes each => 18 bytes total
          io.i2cRead(address, this.REGISTER.READ.ACCEL, 18, data => {

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
          });

          // Moved the ndof/quarternions to their own read.. bytes go missing, lots of 32 byte buffers everywhere
          io.i2cRead(address, this.REGISTER.READ.EULER, 14, data => {

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
          });

        });
      },
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.BNO055, options);
        return `bno055-${address}`;
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
      value(board, options) {
        const io = board.io;
        const address = Drivers.addressResolver(this, options);
        io.i2cConfig(options);

        const computed = {
          pressure: null,
          temperature: null,
        };

        const cof = {
          a0: null,
          b1: null,
          b2: null,
          c12: null
        };

        const handler = data => {

          // Page 5
          // 3.1 Pressure, Temperature and Coefficient Bit-Width Specifications
          const Padc = uint16(data[0], data[1]) >> 6;
          const Tadc = uint16(data[2], data[3]) >> 6;

          // Page 6
          // 3.2 Compensation
          computed.pressure = cof.a0 + (cof.b1 + cof.c12 * Tadc) * Padc + cof.b2 * Tadc;
          computed.temperature = Tadc;

          this.emit("data", computed);

          readCycle();
        };

        var readCycle = () => {
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
        };

        const pCoefficients = new Promise(resolve => {
          io.i2cReadOnce(address, this.REGISTER.COEFFICIENTS, 8, data => {
            const A0 = int16(data[0], data[1]);
            const B1 = int16(data[2], data[3]);
            const B2 = int16(data[4], data[5]);
            const C12 = int16(data[6], data[7]) >> 2;

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
          });
        });

        pCoefficients.then(readCycle);
      },
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.MPL115A2, options);
        return `mpl115a2-${address}`;
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
      // Page 18
      // 13 Register descriptions
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
      value(board, options) {
        const READLENGTH = 6;
        const io = board.io;
        let isPressure = false;
        let elevation = null;
        let offset = 0;

        const address = Drivers.addressResolver(this, options);
        // See http://www.henrylahr.com/?p=99 for implementation approach
        //
        let altNow = 0;
        const computed = {
          pressure: 0,
          altitude: 0,
          temperature: 0
        };

        if (typeof options.elevation !== "undefined") {
          elevation = options.elevation;
        }

        if (elevation !== null && elevation <= 0) {
          offset = Math.abs(elevation) + 1;
          elevation = 1;
        }

        const waitForReady = next => {
          io.i2cReadOnce(address, this.REGISTER.STATUS, 1, data => {
            if (data[0] & this.MASK.STATUS.PRESSURE_DATA_READ) {
              next();
            } else {
              setTimeout(() => {
                waitForReady(next);
              }, 100);
            }
          });
        };

        const readValues = () => {
          const modeMask = isPressure ? this.MASK.CONTROL.PRESSURE : this.MASK.CONTROL.ALTIMETER;
          const mode = this.MASK.CONTROL.SBYB | this.MASK.CONTROL.OS128 | modeMask;

          io.i2cWrite(address, this.REGISTER.CONTROL, mode);

          waitForReady(() => {
            io.i2cReadOnce(address, this.REGISTER.PRESSURE, READLENGTH, data => {
              const value = uint24(data[1], data[2], data[3]) >> 4;
              const temperature = uint16(data[4], data[5]) >> 4;
              let altVal;

              computed.temperature = temperature;

              if (isPressure) {
                computed.pressure = value;
                this.emit("data", computed);
              } else {
                const m = data[1];
                const c = data[2];
                const l = data[3];
                const fl = (l >> 4) / 16;

                altVal = (m << 8 | c) + fl;
                altNow = (altNow * 3 + altVal) / 4;

                computed.altitude = altNow - offset;
              }

              isPressure = !isPressure;

              readValues();
            });
          });
        };

        const reads = [];
        const calibrate = () => {
          // Clear Oversampling and OST
          io.i2cWrite(address, this.REGISTER.CONTROL, 0x3B);
          io.i2cWrite(address, this.REGISTER.CONTROL, 0x39);

          setTimeout(() => {
            io.i2cReadOnce(address, this.REGISTER.PRESSURE, READLENGTH, data => {
              const m = data[1];
              const c = data[2];
              const l = data[3];
              const fl = (l >> 4) / 4;

              reads.push((m << 10 | c << 2) + fl);

              if (reads.length === 4) {
                const curpress = (reads[0] + reads[1] + reads[2] + reads[3]) / 4;
                const seapress = curpress / ((1 - elevation * 0.0000225577) ** 5.255);

                // Update Barometric input for Altitude
                io.i2cWrite(address, this.REGISTER.BAR_IN_MSB, (seapress / 2) >> 8);
                io.i2cWrite(address, this.REGISTER.BAR_IN_LSB, (seapress / 2) & 0xFF);

                // Get into Altitude mode
                // One shot & OST bit
                io.i2cWrite(address, this.REGISTER.CONTROL, 0xBB);
                io.i2cWrite(address, this.REGISTER.CONTROL, 0xB9);

                setTimeout(() => {
                  io.i2cReadOnce(address, this.REGISTER.PRESSURE, READLENGTH, data => {
                    const m = data[1];
                    const c = data[2];
                    const l = data[3];
                    const fl = (l >> 4) / 16;

                    altNow = (m << 8 | c) + fl;

                    readValues(false);
                  });
                }, 550);

              } else {
                calibrate();
              }
            });
          }, 500);
        };

        io.i2cConfig(
          Object.assign(options, {
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
      value(options) {
        const address = Drivers.addressResolver(Drivers.MPL3115A2, options);
        return `mpl3115a2-${address}`;
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
      value(board, options) {
        const io = board.io;
        let elevation = null;
        let offset = 0;

        if (typeof options.elevation !== "undefined") {
          elevation = options.elevation;
        }

        if ((elevation != null && elevation <= 0) ||
            elevation == null) {
          offset = Math.abs(elevation) + 1;
          elevation = 1;
        }

        const address = Drivers.addressResolver(this, options);
        /**
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

        const mode = options.mode || 3;
        const kpDelay = [5, 8, 14, 26][mode];
        const oss = Fn.constrain(mode, 0, 3);

        const cof = {
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

        io.i2cConfig(options);

        const pCoefficients = new Promise(resolve => {
          io.i2cReadOnce(address, this.REGISTER.COEFFICIENTS, 22, data => {
            // BMP085
            // Page 12
            // 3.4 Calibration Coefficients
            //
            // BMP180
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
        });

        pCoefficients.then(() => {

          // BMP085
          // Pages 10, 11
          // 3.3 Measurement of pressure and temperature
          // Pages 12, 13, 14
          // 3.5 Calculating pressure and temperature
          //
          // BMP180
          // Pages 11, 12
          // 3.3 Measurement of pressure and temperature
          // Pages 13, 14, 15, 16
          // 3.5 Calculating pressure and temperature
          //
          const computed = {
            altitude: null,
            pressure: null,
            temperature: null,
          };

          let cycle = 0;

          // BMP180
          // Pages 11, 15
          // 3.3 Measurement of pressure and temperature
          // 3.5 Calculating pressure and temperature
          const readCycle = () => {

            // cycle 0: temperature
            // cycle 1: pressure

            const isTemperatureCycle = cycle === 0;
            const component = isTemperatureCycle ? 0x2E : 0x34 + (oss << 6);
            const numBytes = isTemperatureCycle ? 2 : 3;
            const delay = isTemperatureCycle ? 5 : kpDelay;


            io.i2cWriteReg(address, this.REGISTER.READ_START, component);

            // Once the READ_START register is set,
            // delay the READ_RESULT request based on the
            // mode value provided by the user, or default.
            setTimeout(() => {
              io.i2cReadOnce(address, this.REGISTER.READ_RESULT, numBytes, data => {
                let compensated;
                let uncompensated;
                let x1;
                let x2;
                let x3;
                let b3;
                let b4;
                let b6;
                let b7;
                let b6s;
                let bx;

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
                  const seapress = compensated / ((1 - elevation * 0.0000225577) ** 5.255);
                  const altitude = 44330 * (1 - compensated / seapress ** (1 / 5.255));

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
              });
            }, delay);
          };

          // Kick off "read loop"
          //
          readCycle();
        });
      }
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.BMP180, options);
        return `bmp180-${address}`;
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
      value(board, options) {
        const io = board.io;
        let elevation = null;
        let offset = 0;

        if (typeof options.elevation !== "undefined") {
          elevation = options.elevation;
        }

        if ((elevation != null && elevation <= 0) ||
            elevation == null) {
          offset = Math.abs(elevation) + 1;
          elevation = 1;
        }

        const address = Drivers.addressResolver(this, options);
        const dig = {
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

        io.i2cConfig(options);

        // Page. 24
        // 4.3.2 Register 0xE0 "reset"
        io.i2cWrite(address, this.REGISTER.RESET, 0xB6);

        const pCoefficients = new Promise(resolve => {
          io.i2cReadOnce(address, this.REGISTER.COEFFICIENTS, 24, data => {

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
        });

        pCoefficients.then(() => {
          /*
          CTRL_MEAS bits

          | DATA LSB                      |
          | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
          | - | - | - | - | - | - | - | - |
          | 0 | 0 | 1 | 1 | 1 | 1 | 1 | 1 |
          */

          io.i2cWrite(address, this.REGISTER.MEASURE, 0x3F);

          const computed = {
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

          io.i2cRead(address, this.REGISTER.PRESSURE, 6, data => {
            let compensated = 0;

            // Page 45
            // "Returns temperature in DegC, double precision. Output value of
            // '51.23' equals 51.23 DegC. t_fine carries fine temperature as global value"
            let fine;

            // var1, var2
            //
            // Expect:
            //
            // int32
            //
            let v1;

            let v2;

            // Page 44
            // "Both pressure and temperature values are expected to be
            // received in 20 bit format, positive, stored in a 32 bit signed integer. "
            //
            //  V = int32(uint24(m, l, xl))
            //  V >> 4;
            //

            // Page 45
            let P = s32(uint24(data[0], data[1], data[2]));
            let T = s32(uint24(data[3], data[4], data[5]));

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
            const adc16 = T >> 4;
            const adc16subT1 = adc16 - dig.T1;
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
            v1 = s32(fine >> 1) - 64000;

            // var2 = (((var1>>2) * (var1>>2)) >> 11 ) * ((BMP280_S32_t)dig_P6);
            v2 = (((v1 >> 2) * (v1 >> 2)) >> 11) * s32(dig.P6);

            // var2 = var2 + ((var1*((BMP280_S32_t)dig_P5))<<1);
            v2 += (v1 * s32(dig.P5)) << 1;

            // var2 = (var2>>2)+(((BMP280_S32_t)dig_P4)<<16);
            v2 = (v2 >> 2) + (s32(dig.P4) << 16);


            // var1 = (((dig_P3 * (((var1>>2) * (var1>>2)) >> 13 )) >> 3) +
            //          ((((BMP280_S32_t)dig_P2) * var1)>>1))>>18;
            v1 = (((dig.P3 * (((v1 >> 2) * (v1 >> 2)) >> 13)) >> 3) + ((s32(dig.P2) * v1) >> 1)) >> 18;

            // var1 =((((32768+var1))*((BMP280_S32_t)dig_P1))>>15);
            v1 = (((Fn.POW_2_15 + v1) * s32(dig.P1)) >> 15);

            if (v1 === 0) {
              // Prevent division by zero
              return 0;
            }

            // p = (((BMP280_U32_t)(((BMP280_S32_t)1048576)-adc_P)-(var2>>12)))*3125;
            compensated = u32((s32(Fn.POW_2_20) - P) - (v2 >> 12)) * 3125;

            if (compensated < Fn.POW_2_31) {
              // p = (p << 1) / ((BMP280_U32_t)var1);
              compensated = ((compensated << 1) >>> 0) / u32(v1);
            } else {
              // p = (p / (BMP280_U32_t)var1) * 2;
              compensated = ((compensated / u32(v1)) >>> 0) * 2;
            }

            compensated = u32(compensated) >>> 0;

            // var1 = (((BMP280_S32_t)dig_P9) * ((BMP280_S32_t)(((p>>3) * (p>>3))>>13)))>>12;
            const compshift3r = compensated >> 3;
            v1 = (s32(dig.P9) * s32(((compshift3r * compshift3r) >> 13))) >> 12;

            // var2 = (((BMP280_S32_t)(p>>2)) * ((BMP280_S32_t)dig_P8))>>13;
            v2 = (s32(compensated >> 2) * s32(dig.P8)) >> 13;

            // p = (BMP280_U32_t)((BMP280_S32_t)p + ((var1 + var2 + dig_P7) >> 4));
            compensated = u32(s32(compensated) + ((v1 + v2 + dig.P7) >> 4));

            // Steps of 1Pa (= 0.01hPa = 0.01mbar) (=> 0.001kPa)
            computed.pressure = compensated;

            // Calculating pressure at sea level (copied from BMP180)
            const seapress = compensated / ((1 - elevation * 0.0000225577) ** 5.255);
            const altitude = 44330 * (1 - compensated / seapress ** (1 / 5.255));

            // Page 3
            // ...relative accuracy is ±0.12 hPa, which is equivalent to
            // ±1 m difference in altitude.
            computed.altitude = Math.round(altitude - offset);

            this.emit("data", computed);
          });
        });
      }
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.BMP280, options);
        return `bmp280-${address}`;
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
        PRESSURE: 0xF7,
        // 0xF7, 0xF8, 0xF9
        //  MSB,  LSB, XLSB
        TEMPERATURE: 0xFA,
        // 0xFA, 0xFB, 0xFC
        //  MSB,  LSB, XLSB
        HUMIDITY: 0xFD,
        // 0xFD, 0xFE
        //  MSB,  LSB
        RESET: 0xE0,
      }
    },
    initialize: {
      value(board, options) {
        const io = board.io;
        let elevation = null;
        let offset = 0;

        if (typeof options.elevation !== "undefined") {
          elevation = options.elevation;
        }

        if ((elevation != null && elevation <= 0) ||
            elevation == null) {
          offset = Math.abs(elevation) + 1;
          elevation = 1;
        }

        const address = Drivers.addressResolver(this, options);
        const dig = {
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

        io.i2cConfig(options);

        // Page. 24
        // 4.3.2 Register 0xE0 "reset"
        io.i2cWrite(address, this.REGISTER.RESET, 0xB6);

        const pCoefficients = new Promise(resolveCoeffs => {

          // Page 22,
          // Table 16: Compensation parameter storage, naming and data type
          // These are received LSB FIRST
          //
          // The H register is not contiguous!


          Promise.all([
            new Promise(resolve => {
              io.i2cReadOnce(address, 0x88, 24, data => {
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
                dig.P8 = s32(int16(data[21], data[20]));
                dig.P9 = s32(int16(data[23], data[22]));
                resolve();
              });
            }),
            new Promise(resolve => {
              io.i2cReadOnce(address, 0xA1, 1, data => {
                dig.H1 = Fn.u8(data[0]);
                resolve();
              });
            }),
            new Promise(resolve => {
              io.i2cReadOnce(address, 0xE1, 8, data => {
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
                dig.H2 = s32(int16(data[1], data[0]));

                //  0xE3
                dig.H3 = s32(data[2]);

                // Special Bit arrangements for H4 & H5
                //
                //      0xE5    0xE4
                // H4  [3:0]  [11:4]     signed short
                //      0xE6    0xE5
                // H5 [11:4]   [3:0]    signed short

                dig.H4 = s32((data[3] << 4) | (data[4] & 0xF));
                dig.H5 = s32((data[5] << 4) | (data[4] >> 4));

                // 0xE7
                dig.H6 = Fn.s8(data[6]);

                resolve();
              });
            })
          ]).then(resolveCoeffs);
        });

        pCoefficients.then(() => {
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
            Table 22: Register 0xF4 "ctrl_meas"

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


          const computed = {
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

          const standby = Date.now();

          io.i2cRead(address, this.REGISTER.PRESSURE, 8, data => {
            //
            // Response time to complete 63% of a step is 1 second.
            // Don't emit a reading until a complete step has occurred.
            // This will be ~1587ms
            // (1 / 63 * 100) * 1000 = 1587.3015873015872ms
            // if ((standby + 1587) > Date.now()) {
            if (!process.env.IS_TEST_MODE) {
              if ((standby + 1000) > Date.now()) {
                return;
              }
            }

            let compensated = 0;

            // Page 45
            // "Returns temperature in DegC, double precision. Output value of
            // '51.23' equals 51.23 DegC. t_fine carries fine temperature as global value"
            let fine;

            // var1, var2
            //
            // Expect:
            //
            // int32
            //
            let v1;

            let v2;
            let vx;

            // Page 50
            // "Both pressure and temperature values are expected to be
            // received in 20 bit format, positive, stored in a 32 bit signed integer. "
            //
            //  V = int32(uint24(m, l, xl))
            //  V >> 4;
            //

            // Page 50
            let P = s32(uint24(data[0], data[1], data[2]));
            let T = s32(uint24(data[3], data[4], data[5]));
            const H = s32(uint16(data[6], data[7]));

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
            const adc16 = T >> 4;
            const adc16subT1 = adc16 - dig.T1;
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
            v1 = s32(fine >> 1) - 64000;

            // var2 = (((var1>>2) * (var1>>2)) >> 11 ) * ((BMP280_S32_t)dig_P6);
            v2 = (((v1 >> 2) * (v1 >> 2)) >> 11) * s32(dig.P6);

            // var2 = var2 + ((var1*((BMP280_S32_t)dig_P5))<<1);
            v2 += (v1 * s32(dig.P5)) << 1;

            // var2 = (var2>>2)+(((BMP280_S32_t)dig_P4)<<16);
            v2 = (v2 >> 2) + (s32(dig.P4) << 16);


            // var1 = (((dig_P3 * (((var1>>2) * (var1>>2)) >> 13 )) >> 3) +
            //          ((((BMP280_S32_t)dig_P2) * var1)>>1))>>18;
            v1 = (((dig.P3 * (((v1 >> 2) * (v1 >> 2)) >> 13)) >> 3) + ((s32(dig.P2) * v1) >> 1)) >> 18;

            // var1 =((((32768+var1))*((BMP280_S32_t)dig_P1))>>15);
            v1 = (((Fn.POW_2_15 + v1) * s32(dig.P1)) >> 15);

            if (v1 === 0) {
              // Prevent division by zero
              return 0;
            }

            // p = (((BMP280_U32_t)(((BMP280_S32_t)1048576)-adc_P)-(var2>>12)))*3125;
            compensated = u32((s32(Fn.POW_2_20) - P) - (v2 >> 12)) * 3125;

            if (compensated < Fn.POW_2_31) {
              // p = (p << 1) / ((BMP280_U32_t)var1);
              compensated = ((compensated << 1) >>> 0) / u32(v1);
            } else {
              // p = (p / (BMP280_U32_t)var1) * 2;
              compensated = ((compensated / u32(v1)) >>> 0) * 2;
            }

            compensated = u32(compensated) >>> 0;

            // var1 = (((BMP280_S32_t)dig_P9) * ((BMP280_S32_t)(((p>>3) * (p>>3))>>13)))>>12;
            const compshift3r = compensated >> 3;
            v1 = (s32(dig.P9) * s32(((compshift3r * compshift3r) >> 13))) >> 12;

            // var2 = (((BMP280_S32_t)(p>>2)) * ((BMP280_S32_t)dig_P8))>>13;
            v2 = (s32(compensated >> 2) * dig.P8) >> 13;

            // p = (BMP280_U32_t)((BMP280_S32_t)p + ((var1 + var2 + dig_P7) >> 4));
            compensated = u32(s32(compensated) + ((v1 + v2 + dig.P7) >> 4));

            // Steps of 1Pa (= 0.01hPa = 0.01mbar) (=> 0.001kPa)
            computed.pressure = compensated;

            // Calculating pressure at sea level (copied from BMP180)
            const seapress = compensated / ((1 - elevation * 0.0000225577) ** 5.255);
            const altitude = 44330 * (1 - compensated / seapress ** (1 / 5.255));

            // Page 3
            // ...relative accuracy is ±0.12 hPa, which is equivalent to
            // ±1 m difference in altitude.
            computed.altitude = Math.round(altitude - offset);


            // Page 23, 24
            // BME280_U32_t bme280_compensate_H_int32(BME280_S32_t adc_H)

            // BME280_S32_t v_x1_u32r;
            // v_x1_u32r = (t_fine – ((BME280_S32_t)76800));
            vx = s32(fine - 76800);

            // v_x1_u32r = (((((adc_H << 14) – (((BME280_S32_t)dig_H4) << 20) – (((BME280_S32_t)dig_H5) * v_x1_u32r)) +
            // ((BME280_S32_t)16384)) >> 15) * (((((((v_x1_u32r * ((BME280_S32_t)dig_H6)) >> 10) * (((v_x1_u32r * ((BME280_S32_t)dig_H3)) >> 11) + ((BME280_S32_t)32768))) >> 10) + ((BME280_S32_t)2097152)) *
            // ((BME280_S32_t)dig_H2) + 8192) >> 14));

            vx = (((((H << 14) - s32(dig.H4 << 20) - (dig.H5 * vx)) + Fn.POW_2_14) >> 15) *
                  (((((((vx * dig.H6) >> 10) * (((vx * dig.H3) >> 11) + Fn.POW_2_15)) >> 10) + Fn.POW_2_21) * dig.H2 + Fn.POW_2_13) >> 14));

            // v_x1_u32r = (v_x1_u32r - (((((v_x1_u32r >> 15) * (v_x1_u32r >> 15)) >> 7) * ((int32_t)_bme280_calib.dig_H1)) >> 4));
            vx -= (((((vx >> 15) * (vx >> 15)) >> 7) * s32(dig.H1) >> 4));

            // v_x1_u32r = (v_x1_u32r < 0 ? 0 : v_x1_u32r);
            // v_x1_u32r = (v_x1_u32r > 419430400 ? 419430400 : v_x1_u32r);
            vx = Fn.constrain(vx, 0, 419430400);

            computed.humidity = u32(vx >> 12);

            this.emit("data", computed);
          });
        });
      }
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.BME280, options);
        return `bme280-${address}`;
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
      value(board, options) {
        const io = board.io;
        const address = Drivers.addressResolver(this, options);
        // The "no hold" measurement requires waiting
        // _at least_ 22ms between register write and
        // register read. Delay is measured in μs:
        // 22ms = 22000μs; recommend 50ms = 50000μs
        options.delay = 50000;

        io.i2cConfig(options);

        // Reference
        // P. 19
        const computed = {
          temperature: null,
          humidity: null,
        };

        // Despite the registers being back to back, the SI7020
        // does not like when 5 bytes are requested, so we put
        // the two data sources on their own read channels.
        io.i2cRead(address, this.REGISTER.TEMPERATURE, 2, data => {
          computed.temperature = uint16(data[0], data[1]);
          this.emit("data", computed);
        });

        io.i2cRead(address, this.REGISTER.HUMIDITY, 2, data => {
          computed.humidity = uint16(data[0], data[1]);
          this.emit("data", computed);
        });
      }
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.SI7020, options);
        return `si7020-${address}`;
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
      value(board, options) {
        const io = board.io;
        let elevation = null;
        let offset = 0;


        if (typeof options.elevation !== "undefined") {
          elevation = options.elevation;
        }

        if ((elevation != null && elevation <= 0) ||
            elevation == null) {
          offset = Math.abs(elevation) + 1;
          elevation = 1;
        }

        const address = Drivers.addressResolver(this, options);
        const computed = {
          altitude: null,
          pressure: null,
          temperature: null,
        };

        /**
         * Page 6
         *
         * Startup in I2C Mode
         *
         * 1. Reset
         * 2. Read PROM (128 bits of calibration data)
         * 3. D1 Conversion
         * 4. D2 Conversion
         * 5. Read ADC (24 but pressure/temperature)
         */
        const mode = options.mode || 5;
        /*
        [
         ULTRA_LOW_POWER
         LOW_POWER
         STANDARD
         HIGH_RES
         ULTRA_HIGH_RES *
         ]
         */

        const kpDelay = [1, 2, 3, 4, 5, 10][mode];

        /**
         * Page 7
         */
        const cof = {
          C1: null,
          C2: null,
          C3: null,
          C4: null,
          C5: null,
          C6: null,
        };

        const cKeys = Object.keys(cof);


        // TODO: confirm this is actually necessary?
        options.delay = kpDelay * 1000;

        io.i2cConfig(options);
        io.i2cWrite(address, this.REGISTER.RESET);

        const pCoefficients = new Promise(resolve => {
          // First, a small delay is required following the reset...
          setTimeout(() => {
            // Next, each coefficient must be read on it's own.
            const cofs = cKeys.map((key, index) => {
              const register = this.REGISTER.COEFFICIENTS + (index * 2);
              return new Promise(resolve => {
                io.i2cReadOnce(address, register, 2, data => {
                  cof[key] = uint16(data[0], data[1]);
                  resolve();
                });
              });
            });

            Promise.all(cofs).then(resolve);
          }, 50);
        });

        pCoefficients.then(() => {
          // Page 7, 8
          //
          let cycle = 0;
          let D1;
          let D2;
          let dT;
          let TEMP;
          let OFF;
          let SENS;
          let P;
          let TEMP2;
          let OFF2;
          let SENS2;

          const readCycle = () => {

            // cycle 0: temperature
            // cycle 1: pressure

            const isTemperatureCycle = cycle === 0;
            const component = (isTemperatureCycle ? 0x50 : 0x40) + mode;

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
            setTimeout(() => {
              io.i2cReadOnce(address, this.REGISTER.READ, 3, data => {

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
                    TEMP2 = dT ** 2 / Fn.POW_2_31;
                    OFF2 = 5 * ((TEMP - 2000) ** 2) / 2;
                    SENS2 = 5 * ((TEMP - 2000) ** 2) / Fn.POW_2_2;

                    if (TEMP < -1500) {
                      OFF2 = OFF2 + 7 * ((TEMP + 1500) ** 2);
                      SENS2 = SENS2 + 11 * ((TEMP + 1500) ** 2) / 2;
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
                  const seapress = P / ((1 - elevation * 0.0000225577) ** 5.255);
                  const altitude = 44330 * (1 - P / seapress ** (1 / 5.255));

                  computed.altitude = altitude - offset;
                }

                if (++cycle === 2) {
                  cycle = 0;
                  this.emit("data", computed);
                }

                readCycle();
              });
            }, kpDelay);
          };

          // Kick off "read loop"
          //
          readCycle();
        });
      }
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.MS5611, options);
        return `ms5611-${address}`;
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
      value(board, options) {
        const io = board.io;
        const address = Drivers.addressResolver(this, options);
        const computed = {
          temperature: null,
          humidity: null,
        };

        let cycle = 0;

        io.i2cConfig(
          Object.assign(options, {
            settings: {
              stopTX: true
            }
          })
        );

        const readCycle = () => {
          // 1. Determine which data we want to request
          const isTemperatureCycle = cycle === 0;
          const command = isTemperatureCycle ?
            this.COMMAND.MEASURE_TEMPERATURE :
            this.COMMAND.MEASURE_HUMIDITY;


          const conversion = new Promise(resolve => {
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
            const requestStatus = () => {
              io.i2cReadOnce(address, this.REGISTER.STATUS, 1, data => {
                const status = data[0];

                if (!(status & 0x01)) {
                  resolve();
                } else {
                  requestStatus();
                }
              });
            };

            requestStatus();
          });

          // Page. 16, 18
          //
          conversion.then(() => {
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
            Promise.all([
              new Promise(resolve => {
                io.i2cReadOnce(address, 0x01, 1, data => {
                  resolve(data[0]);
                });
              }),
              new Promise(resolve => {
                io.i2cReadOnce(address, 0x02, 1, data => {
                  resolve(data[0]);
                });
              })
            ]).then(data => {

              if (isTemperatureCycle) {
                computed.temperature = ((uint16(data[0], data[1]) >> 2) / 32) - 50;
              } else {
                computed.humidity = ((uint16(data[0], data[1]) >> 4) / 16) - 24;
              }

              if (++cycle === 2) {
                cycle = 0;
                this.emit("data", computed);
              }

              readCycle();
            });
          });
        };

        readCycle();
      },
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.TH02, options);
        return `th02-${address}`;
      }
    }
  },

  /**
   * LSM303C: 6Dof 3-Axis Magnetometer & Accelerometer
   *
   * https://learn.sparkfun.com/tutorials/lsm303c-6dof-hookup-guide
   * https://github.com/sparkfun/LSM303C_6_DOF_IMU_Breakout
   */
  LSM303C: {
    ADDRESSES: {
      value: [
        0x1D,
        0x1E,
      ]
    },
    COMMAND: {
      value: {
        ACC_SETUP: [0x4, 0x3F, 0x3F, 0x3F],
        MAG_SETUP: [0xD8, 0x60, 0x40, 0xD8, 0x8, 0x00]
      }
    },
    REGISTER: {
      value: {
        ACC_CTRL_SEQ: [0x23, 0x20, 0x20, 0x20],
        ACC_STATUS: 0x27,
        ACC_OUTX_L: 0x28,
        ACC_OUTX_H: 0x29,
        ACC_OUTY_L: 0x2A,
        ACC_OUTY_H: 0x2B,
        ACC_OUTZ_L: 0x2C,
        ACC_OUTZ_H: 0x2D,
        MAG_CTRL_SEQ: [0x20, 0x21, 0x24, 0x20, 0x23, 0x22],
        MAG_STATUS: 0x27,
        MAG_OUTX_L: 0x28,
        MAG_OUTX_H: 0x29,
        MAG_OUTY_L: 0x2A,
        MAG_OUTY_H: 0x2B,
        MAG_OUTZ_L: 0x2C,
        MAG_OUTZ_H: 0x2D,
        MAG_TEMP_OUT_L: 0x2E,
        MAG_TEMP_OUT_H: 0x2F,
      }
    },
    initialize: {
      value(board, options) {

        const ACC_SENSITIVITY = 0.06103515625; // LSB/mg
        const MAG_SENSITIVITY = 0.00048828125; // LSB/Ga

        const io = board.io;
        const frequency = this.freq || 40;
        const [ACC_ADDRESS, MAG_ADDRESS] = this.ADDRESSES;

        const accelerometer = {};
        const magnetometer = {};
        const computed = {
          temperature: 0,
          magnetometer,
          accelerometer
        };

        // ACC Initialization sequence (4 bytes)
        const initializeAccelerometer = () => {
          io.i2cConfig(Object.assign({}, options, { address: ACC_ADDRESS }));
          this.REGISTER.ACC_CTRL_SEQ
            .forEach((ctrlReg, i) => {
              io.i2cWrite(ACC_ADDRESS, ctrlReg, this.COMMAND.ACC_SETUP[i]);
            });
        };

        // MAG Initialization sequence (6 bytes)
        const initializeMagnetometer = () => {
          io.i2cConfig(Object.assign({}, options, { address: MAG_ADDRESS }));
          this.REGISTER.MAG_CTRL_SEQ
            .forEach((ctrlReg, i) => {
              io.i2cWrite(MAG_ADDRESS, ctrlReg, this.COMMAND.MAG_SETUP[i]);
            });
        };

        const readAccelerometer = done => {
          io.i2cReadOnce(ACC_ADDRESS, this.REGISTER.ACC_OUTX_L, 6, data => {
            accelerometer.x = int16(data[1], data[0]) * ACC_SENSITIVITY;
            accelerometer.y = int16(data[3], data[2]) * ACC_SENSITIVITY;
            accelerometer.z = int16(data[5], data[4]) * ACC_SENSITIVITY;
            done();
          });
        };

        const readMagnetometer = done => {
          io.i2cReadOnce(MAG_ADDRESS, this.REGISTER.MAG_OUTX_L, 6, data => {
            magnetometer.x = int16(data[1], data[0]) * MAG_SENSITIVITY;
            magnetometer.y = int16(data[3], data[2]) * MAG_SENSITIVITY;
            magnetometer.z = int16(data[5], data[4]) * MAG_SENSITIVITY;
            done();
          });
        };

        const readTemperature = done => {
          io.i2cReadOnce(MAG_ADDRESS, this.REGISTER.MAG_TEMP_OUT_L, 2, data => {
            computed.temperature = int16(data[1], data[0]);
            done();
          });
        };

        // Rinse and repeat
        const readCycle = () => {
          Promise.all([
            new Promise(readAccelerometer),
            new Promise(readMagnetometer),
            new Promise(readTemperature)
          ])
          .then(() => {
            this.emit("data", computed);
            setTimeout(readCycle, frequency);
          });
        };

        // Kick off
        initializeAccelerometer();
        initializeMagnetometer();
        readCycle();
      },
    },
    identifier: {
      value(options) {
        const address = Drivers.addressResolver(Drivers.LSM303C, options);
        return `lsm303c-${address}`;
      }
    }
  },
};

// Otherwise known as...
Drivers.BMP085 = Drivers.BMP180;
Drivers.GY521 = Drivers.MPU6050;
Drivers.SI7021 = Drivers.SI7020;
Drivers.DHT11_I2C_NANO_BACKPACK = Drivers.DHT_I2C_NANO_BACKPACK;
Drivers.DHT21_I2C_NANO_BACKPACK = Drivers.DHT_I2C_NANO_BACKPACK;
Drivers.DHT22_I2C_NANO_BACKPACK = Drivers.DHT_I2C_NANO_BACKPACK;


Drivers.get = (board, driverName, options = {}) => {
  let drivers;
  let driverKey;
  let driver;

  if (!activeDrivers.has(board)) {
    activeDrivers.set(board, {});
  }

  drivers = activeDrivers.get(board);
  driverKey = Drivers[driverName].identifier.value(options);

  if (!drivers[driverKey]) {
    driver = new Emitter();
    Object.defineProperties(driver, Drivers[driverName]);
    driver.initialize(board, options);
    drivers[driverKey] = driver;
  }

  return drivers[driverKey];
};

Drivers.addressResolver = (driver, options) => {
  const addresses = driver.ADDRESSES;
  const address = options.address || (
    Array.isArray(addresses) ? addresses[0] : addresses.value[0]
  );
  options.address = address;
  return address;
};

Drivers.clear = () => {
  activeDrivers.clear();
};

const Controllers = {
  /**
   * MPU6050 3-axis Gyro/Accelerometer and Thermometer
   *
   * http://playground.arduino.cc/Main/MPU6050
   */

  MPU6050: {
    initialize: {
      value(options) {
        Components.call(this, "MPU6050", options);
      }
    },
    components: {
      value: [ACCELEROMETER, GYRO, THERMOMETER]
    },
  },

  BNO055: {
    initialize: {
      value(options) {
        const state = priv.get(this);
        const CONTROLLER = "BNO055";

        state.calibrationMask = options.calibrationMask || 0xC0;

        // here we want to catch the events coming out of the driver and re-emit them
        // not sure what is cleaner here, picking these up from a data event
        // in the sub controllers, or this
        Drivers.get(this.board, CONTROLLER, options)
          .on("calibrated", () => this.emit("calibrated"))
          .on("calibration", state => this.emit("calibration", state));

        Components.call(this, CONTROLLER, options);
      }
    },
    components: {
      value: [ACCELEROMETER, GYRO, MAGNETOMETER, ORIENTATION, THERMOMETER]
    },
    calibration: {
      get() {
        return this.orientation.calibration;
      }
    },
    isCalibrated: {
      get() {
        //returns if the system and all sensors are fully calibrated
        const {calibrationMask} = priv.get(this);
        return (this.orientation.calibration & calibrationMask) === calibrationMask;
      }
    }
  },
  MPL115A2: {
    initialize: {
      value(options) {
        Components.call(this, "MPL115A2", options);
      }
    },
    components: {
      value: [BAROMETER, THERMOMETER]
    },
  },
  SHT31D: {
    initialize: {
      value(options) {
        Components.call(this, "SHT31D", options);
      }
    },
    components: {
      value: [HYGROMETER, THERMOMETER]
    },
  },
  HTU21D: {
    initialize: {
      value(options) {
        Components.call(this, "HTU21D", options);
      }
    },
    components: {
      value: [HYGROMETER, THERMOMETER]
    },
  },
  HIH6130: {
    initialize: {
      value(options) {
        Components.call(this, "HIH6130", options);
      }
    },
    components: {
      value: [HYGROMETER, THERMOMETER]
    },
  },
  DHT_I2C_NANO_BACKPACK: {
    initialize: {
      value(options) {
        Components.call(this, "DHT_I2C_NANO_BACKPACK", options);
      }
    },
    components: {
      value: [HYGROMETER, THERMOMETER]
    },
  },
  MPL3115A2: {
    initialize: {
      value(options) {
        Components.call(this, "MPL3115A2", options);
      }
    },
    components: {
      value: [ALTIMETER, BAROMETER, THERMOMETER]
    },
  },
  // This controller and driver pair are used for both
  // BMP180 and BMP085
  BMP180: {
    initialize: {
      value(options) {
        Components.call(this, "BMP180", options);
      }
    },
    components: {
      value: [ALTIMETER, BAROMETER, THERMOMETER]
    },
  },
  BMP280: {
    initialize: {
      value(options) {
        Components.call(this, "BMP280", options);
      }
    },
    components: {
      value: [ALTIMETER, BAROMETER, THERMOMETER]
    },
  },
  BME280: {
    initialize: {
      value(options) {
        Components.call(this, "BME280", options);
      }
    },
    components: {
      value: [ALTIMETER, BAROMETER, HYGROMETER, THERMOMETER]
    },
  },
  SI7020: {
    initialize: {
      value(options) {
        Components.call(this, "SI7020", options);
      }
    },
    components: {
      value: [HYGROMETER, THERMOMETER]
    },
  },
  MS5611: {
    initialize: {
      value(options) {
        Components.call(this, "MS5611", options);
      }
    },
    components: {
      value: [ALTIMETER, BAROMETER, THERMOMETER]
    },
  },

  TH02: {
    initialize: {
      value(options) {
        Components.call(this, "TH02", options);
      }
    },
    components: {
      value: [HYGROMETER, THERMOMETER]
    },
  },

  LSM303C: {
    initialize: {
      value(options) {
        Components.call(this, "LSM303C", options);
      }
    },
    components: {
      value: [MAGNETOMETER, THERMOMETER, ACCELEROMETER]
    },
  },
};

// Otherwise known as...
Controllers.BMP085 = Controllers.BMP180;
Controllers.GY521 = Controllers.MPU6050;
Controllers.SI7021 = Controllers.SI7020;
Controllers.DHT11_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;
Controllers.DHT21_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;
Controllers.DHT22_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;


class IMU extends Emitter {
  constructor(options) {
    super();

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    let state = {};
    priv.set(this, state);

    this.freq = options.freq || 20;

    if (typeof this.initialize === "function") {
      this.initialize(options);
    }

    // The IMU/Multi isn't considered "ready"
    // until one of the components has notified via
    // a change event.
    this.isReady = false;

    setInterval(() => {
      if (this.isReady) {
        this.emit("data", this);
      }
    }, this.freq);

    const awaiting = this.components.slice();

    if (this.components && this.components.length > 0) {
      this.components.forEach(component => {
        if (!(this[component] instanceof Emitter)) {
          return;
        }

        this[component].on("change", () => {
          if (awaiting.length) {
            const index = awaiting.indexOf(component);

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
        });
      });
    }
  }
}


IMU.Drivers = Drivers;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  IMU.Controllers = Controllers;
  IMU.purge = () => {
    priv.clear();
  };
}

module.exports = IMU;
