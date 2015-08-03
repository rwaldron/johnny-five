var Board = require("../lib/board.js"),
  Emitter = require("events").EventEmitter,
  util = require("util");


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
  //http://www.ti.com/lit/ds/symlink/lm35.pdf
  LM35: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value: function(raw) {
        return (5.0 * raw * 100.0) / 1024.0;
      }
    }
  },
  //http://www.ti.com/lit/ds/symlink/lm335.pdf
  LM335: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value: function(raw) {
        var mv = (raw / 1024.0) * 5000;
        var k = (mv / 10);
        return (k - 273.15);
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
        return (raw * 0.4882814) - 50;
      }
    }
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
        // 0°C = 273.15 K
        var kelvin = 273.15;
        // 10 kOhm (sensor resistance)
        var rb = 10000;
        // Ginf = 1/Rinf
        // var ginf = 120.6685;
        // Reference Temperature 25°C
        var tempr = 298.15;

        var rthermistor = (adcres - raw) * rb / raw;
        var tempc = 1 / (Math.log(rthermistor / rb) / beta + 1 / tempr) - kelvin;

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
        var kelvin = 273.15;
        var rb = 10000; // 10 kOhm
        var ginf = 120.6685; // Ginf = 1/Rinf

        var rthermistor = rb * (adcres / raw - 1);
        var tempc = beta / (Math.log(rthermistor * ginf));

        return tempc - kelvin;
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
};

// Otherwise known as...
Controllers["MPU-6050"] = Controllers.MPU6050;

var priv = new Map();

function Temperature(opts) {
  var controller, freq, last = 0, raw;

  if (!(this instanceof Temperature)) {
    return new Temperature(opts);
  }

  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  freq = opts.freq || 25;

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

  Object.defineProperties(this, {
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
        return this.celsius + 273.15;
      }
    }
  });

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      raw = data;
    });
  }

  setInterval(function() {
    if (raw === undefined) {
      return;
    }

    var data = {
      celsius: this.celsius,
      fahrenheit: this.fahrenheit,
      kelvin: this.kelvin
    };

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
