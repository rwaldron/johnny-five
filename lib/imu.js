var Board = require("../lib/board.js");
var Emitter = require("events").EventEmitter;
var util = require("util");
var __ = require("../lib/fn.js");
var Accelerometer = require("../lib/accelerometer.js");
var Barometer = require("../lib/barometer.js");
var Temperature = require("../lib/temperature.js");
var Gyro = require("../lib/gyro.js");
var int16 = __.int16;
var uint16 = __.uint16;
var uint24 = __.uint24;

var priv = new Map();
var activeDrivers = new Map();

var Drivers = {
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
        HUMIDITY: 0xF5,
        TEMPERATURE: 0xE3,
      }
    },
    initialize: {
      value: function(board, opts) {
        var io = board.io;
        var address = opts.address || this.ADDRESSES[0];

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
          temperature: null
        };

        io.i2cRead(address, this.REGISTER.TEMPERATURE, 2, function(data) {
          var raw = int16(data[0], data[1]);

          // https://www.silabs.com/Support%20Documents/TechnicalDocs/Si7020-A20.pdf
          // P. 23
          computed.temperature = (175.25 * raw / 65536) - 46.85;

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
   * MPU-6050 3-axis Gyro/Accelerometer and Temperature
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

        state.temperature = new Temperature(
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
      value: ["accelerometer", "temperature", "gyro"]
    },
    accelerometer: {
      get: function() {
        return priv.get(this).accelerometer;
      }
    },
    temperature: {
      get: function() {
        return priv.get(this).temperature;
      }
    },
    gyro: {
      get: function() {
        return priv.get(this).gyro;
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

        state.temperature = new Temperature(
          Object.assign({
            controller: "MPL115A2",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );
      }
    },
    components: {
      value: ["barometer", "temperature"]
    },
    barometer: {
      get: function() {
        return priv.get(this).barometer;
      }
    },
    temperature: {
      get: function() {
        return priv.get(this).temperature;
      }
    }
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

        state.temperature = new Temperature(
          Object.assign({
            controller: "BMP180",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );
      }
    },
    components: {
      value: ["barometer", "temperature", /* "altitude" */]
    },
    barometer: {
      get: function() {
        return priv.get(this).barometer;
      }
    },
    temperature: {
      get: function() {
        return priv.get(this).temperature;
      }
    }
  },
  SI7020: {
    initialize: {
      value: function(opts) {
        var state = priv.get(this);

        // Eventually humidity will also be exposed.
        state.temperature = new Temperature(
          Object.assign({
            controller: "SI7020",
            freq: opts.freq,
            board: this.board,
          }, opts)
        );
      }
    },
    components: {
      value: ["temperature"]
    },
    temperature: {
      get: function() {
        return priv.get(this).temperature;
      }
    }
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

  Object.defineProperties(this, controller);

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
