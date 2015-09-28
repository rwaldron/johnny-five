var Board = require("../lib/board.js"),
  Emitter = require("events").EventEmitter,
  util = require("util");

var CELSIUS_TO_KELVIN = 273.15;

function analogHandler(opts, dataHandler) {
  var pin = opts.pin;

  this.io.pinMode(pin, this.io.MODES.ANALOG);
  this.io.analogRead(pin, function(data) {
    dataHandler.call(this, data);
  }.bind(this));
}

var activeDrivers = new Map();

var Drivers = {
  DS18B20: {
    initialize: {
      value: function(board, opts) {
        var CONSTANTS = {
          TEMPERATURE_FAMILY: 0x28,
          CONVERT_TEMPERATURE_COMMAND: 0x44,
          READ_SCRATCHPAD_COMMAND: 0xBE,
          READ_COUNT: 2
        },
          pin = opts.pin,
          freq = opts.freq || 100,
          getAddress, readTemperature, readOne;

        getAddress = function(device) {
          // 64-bit device code
          // device[0]    => Family Code
          // device[1..6] => Serial Number (device[1] is LSB)
          // device[7]    => CRC
          var i, result = 0;
          for (i = 6; i > 0; i--) {
            result = result * 256 + device[i];
          }
          return result;
        };

        board.io.sendOneWireConfig(pin, true);
        board.io.sendOneWireSearch(pin, function(err, devices) {
          if (err) {
            this.emit("error", err);
            return;
          }

          this.devices = devices.filter(function(device) {
            return device[0] === CONSTANTS.TEMPERATURE_FAMILY;
          }, this);

          if (devices.length === 0) {
            this.emit("error", new Error("FAILED TO FIND TEMPERATURE DEVICE"));
            return;
          }

          this.devices.forEach(function(device) {
            this.emit("initialized", getAddress(device));
          }.bind(this));

          readTemperature = function() {
            var devicesToRead, result;

            // request tempeature conversion
            if (this.addresses) {
              devicesToRead = this.devices.filter(function(device) {
                var address = getAddress(device);
                return this.addresses.includes(address);
              }, this);
            } else {
              devicesToRead = [this.devices[0]];
            }

            devicesToRead.forEach(function(device) {
              board.io.sendOneWireReset(pin);
              board.io.sendOneWireWrite(pin, device, CONSTANTS.CONVERT_TEMPERATURE_COMMAND);
            });

            // the delay gives the sensor time to do the calculation
            board.io.sendOneWireDelay(pin, 1);

            readOne = function() {
              var device;

              if (devicesToRead.length === 0) {
                setTimeout(readTemperature, freq);
                return;
              }

              device = devicesToRead.pop();
              // read from the scratchpad
              board.io.sendOneWireReset(pin);

              board.io.sendOneWireWriteAndRead(pin, device, CONSTANTS.READ_SCRATCHPAD_COMMAND, CONSTANTS.READ_COUNT, function(err, data) {
                if (err) {
                  this.emit("error", err);
                  return;
                }

                result = (data[1] << 8) | data[0];
                this.emit("data", getAddress(device), result);

                readOne();
              }.bind(this));
            }.bind(this);

            readOne();
          }.bind(this);

          readTemperature();
        }.bind(this));
      }
    },
    register: {
      value: function(address) {
        if (!this.addresses) {
          this.addresses = [];
        }

        this.addresses.push(address);
      }
    }
  }
};

Drivers.get = function(board, driverName, opts) {
  var drivers, driver;

  if (!activeDrivers.has(board)) {
    activeDrivers.set(board, {});
  }

  drivers = activeDrivers.get(board);

  if (!drivers[driverName]) {
    driver = new Emitter();
    Object.defineProperties(driver, Drivers[driverName]);
    driver.initialize(board, opts);
    drivers[driverName] = driver;
  }

  return drivers[driverName];
};

Drivers.clear = function() {
  activeDrivers.clear();
};

// References
//
var Controllers = {
  ANALOG: {
    initialize: {
      value: analogHandler
    }
  },
  LM35: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value: function(raw) {
        // http://www.ti.com/lit/ds/symlink/lm35.pdf
        // VOUT = 1500 mV at 150°C
        // VOUT = 250 mV at 25°C
        // VOUT = –550 mV at –55°C

        var mV = this.aref * 1000 * raw / 1024;

        // 10mV = 1°C
        return mV / 10;
      }
    }
  },
  LM335: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value: function(raw) {
        // http://www.ti.com/lit/ds/symlink/lm335.pdf
        // OUTPUT 10mV/°K

        var mV = this.aref * 1000 * raw / 1024;

        return (mV / 10) - CELSIUS_TO_KELVIN;
      }
    }
  },

  //https://www.sparkfun.com/products/10988
  TMP36: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value: function(raw) {
        // Analog Reference Voltage
        var mV = this.aref * 1000 * raw / 1024;

        // tempC = (mV / 10) - 50
        return (mV / 10) - 50;
      }
    }
  },

  TMP102: {
    initialize: {
      value: function(opts, dataHandler) {
        this.io.i2cConfig(opts);

        // http://www.ti.com/lit/ds/sbos397b/sbos397b.pdf
        // Addressing is unclear.

        this.io.i2cRead(0x48, 0x00, 2, function(data) {
          // Based on the example code from https://www.sparkfun.com/products/11931
          var raw = ((data[0] << 8) | data[1]) >> 4;

          // The tmp102 does twos compliment but has the negative bit in the wrong spot, so test for it and correct if needed
          if (raw & (1 << 11)) {
            raw |= 0xF800; // Set bits 11 to 15 to 1s to get this reading into real twos compliment
          }

          // twos compliment
          raw = raw >> 15 ? ((raw ^ 0xFFFF) + 1) * -1 : raw;

          dataHandler(raw);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        return raw / 16;
      }
    },
  },
  // Based on code from Westin Pigott:
  //    https://github.com/westinpigott/one-wire-temps
  // And the datasheet:
  //    http://datasheets.maximintegrated.com/en/ds/DS18B20.pdf
  // OneWire protocol.  The device needs to be issued a "Convert Temperature"
  // command which can take up to 10 microseconds to compute, so we need
  // tell the board to delay 1 millisecond before issuing the "Read Scratchpad" command
  //
  // This device requires the OneWire support enabled via ConfigurableFirmata
  DS18B20: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this),
          address = opts.address,
          driver = Drivers.get(this.board, "DS18B20", opts);

        if (address) {
          state.address = address;
          driver.register(address);
        } else {
          if (driver.addressless) {
            this.emit("error", "You cannot have more than one DS18B20 without an address");
          }
          driver.addressless = true;
        }

        driver.once("initialized", function(dataAddress) {
          if (!state.address) {
            state.address = dataAddress;
          }
        });

        driver.on("data", function(dataAddress, data) {
          if (!address || dataAddress === address) {
            dataHandler(data);
          }
        }.bind(this));
      }
    },
    toCelsius: {
      value: function(raw) {
        return raw / 16.0;
      }
    },
    address: {
      get: function() {
        return priv.get(this).address || 0x00;
      }
    }
  },
  //http://playground.arduino.cc/Main/MPU-6050
  MPU6050: {
    initialize: {
      value: function(opts, dataHandler) {
        var IMU = require("../lib/imu");
        var driver = IMU.Drivers.get(this.board, "MPU6050", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        return (raw / 340.00) + 36.53;
      }
    }
  },
  MPL115A2: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("../lib/imu");
        var driver = Multi.Drivers.get(this.board, "MPL115A2", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // Source:
        // https://github.com/adafruit/Adafruit_MPL115A2
        return (raw - 498) / -5.35 + 25.0;
      }
    }
  },
  GROVE: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value: function(raw) {
        // http://www.seeedstudio.com/wiki/Grove_-_Temperature_Sensor
        var adcres = 1023;
        // Beta parameter
        var beta = 3975;
        // 10 kOhm (sensor resistance)
        var rb = 10000;
        // Ginf = 1/Rinf
        // var ginf = 120.6685;
        // Reference Temperature 25°C
        var tempr = 298.15;

        var rthermistor = (adcres - raw) * rb / raw;
        var tempc = 1 / (Math.log(rthermistor / rb) / beta + 1 / tempr) - CELSIUS_TO_KELVIN;

        return tempc;
      }
    }
  },
  TINKERKIT: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value: function(raw) {
        var adcres = 1023;
        var beta = 3950;
        var rb = 10000; // 10 kOhm
        var ginf = 120.6685; // Ginf = 1/Rinf

        var rthermistor = rb * (adcres / raw - 1);
        var tempc = beta / (Math.log(rthermistor * ginf));

        return tempc - CELSIUS_TO_KELVIN;
      }
    }
  },
  BMP180: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("../lib/imu");
        var driver = Multi.Drivers.get(this.board, "BMP180", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        return raw;
      }
    }
  },
  SI7020: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("../lib/imu");
        var driver = Multi.Drivers.get(this.board, "SI7020", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        return raw;
      }
    }
  },
};

// Otherwise known as...
Controllers["MPU-6050"] = Controllers.MPU6050;

var priv = new Map();

function Temperature(opts) {
  var controller, freq, last = 0, raw;

  if (!(this instanceof Temperature)) {
    return new Temperature(opts);
  }

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  freq = opts.freq || 25;

  // Analog Reference Voltage (default to board.io.aref || 5)
  this.aref = opts.aref || this.io.aref || 5;

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    controller = Controllers["ANALOG"];
  }

  priv.set(this, {});

  Object.defineProperties(this, controller);

  if (!this.toCelsius) {
    this.toCelsius = opts.toCelsius || function(x) { return x; };
  }

  var propDescriptors = {
    celsius: {
      get: function() {
        return this.toCelsius(raw);
      }
    },
    fahrenheit: {
      get: function() {
        return (this.celsius * 9.0 / 5.0) + 32;
      }
    },
    kelvin: {
      get: function() {
        return this.celsius + CELSIUS_TO_KELVIN;
      }
    }
  };
  // Convenience aliases
  propDescriptors.C = propDescriptors.celsius;
  propDescriptors.F = propDescriptors.fahrenheit;
  propDescriptors.K = propDescriptors.kelvin;

  Object.defineProperties(this, propDescriptors);

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      raw = data;
    });
  }

  setInterval(function() {
    if (raw === undefined) {
      return;
    }

    var data = {};
    data.C = data.celsius = this.celsius;
    data.F = data.fahrenheit = this.fahrenheit;
    data.K = data.kelvin = this.kelvin;

    this.emit("data", null, data);

    if (this.celsius !== last) {
      last = this.celsius;
      this.emit("change", null, data);
    }
  }.bind(this), freq);
}

util.inherits(Temperature, Emitter);

Temperature.Drivers = Drivers;

module.exports = Temperature;
