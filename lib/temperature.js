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
        return (5.0 * raw * 100.0)/1024.0;
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
        var CONSTANTS = {
          TEMPERATURE_FAMILY: 0x28,
          CONVERT_TEMPERATURE_COMMAND: 0x44,
          READ_SCRATCHPAD_COMMAND: 0xBE,
          READ_COUNT: 2
        },
          pin = opts.pin,
          freq = opts.freq || 100,
          address = opts.address,
          state = priv.get(this),
          device, getAddress, readTemperature;

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

        this.io.sendOneWireConfig(pin, true);
        this.io.sendOneWireSearch(pin, function(err, devices) {
          if (err) {
            this.emit("error", err);
            return;
          }

          devices = devices.filter(function(device) {
            var inFamily = device[0] === CONSTANTS.TEMPERATURE_FAMILY;
            var isAddress = address === undefined || getAddress(device) === address;

            return inFamily && isAddress;
          }, this);

          if (devices.length === 0) {
            this.emit("error", new Error("FAILED TO FIND TEMPERATURE DEVICE"));
            return;
          }

          device = devices[0];
          state.address = getAddress(device);

          readTemperature = function() {
            // request tempeature conversion
            this.io.sendOneWireReset(pin);
            this.io.sendOneWireWrite(pin, device, CONSTANTS.CONVERT_TEMPERATURE_COMMAND);

            // the delay gives the sensor time to do the calculation
            this.io.sendOneWireDelay(pin, 1);

            // read from the scratchpad
            this.io.sendOneWireReset(pin);
            this.io.sendOneWireWriteAndRead(pin, device, CONSTANTS.READ_SCRATCHPAD_COMMAND, CONSTANTS.READ_COUNT, function(err, data) {
              if (err) {
                this.emit("error", err);
                return;
              }

              dataHandler((data[1] << 8) | data[0]);
              setTimeout(readTemperature, freq);
            });
          }.bind(this);

          readTemperature();
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
        driver.on("data", function(err, data) {
          dataHandler.call(this, data.temperature);
        }.bind(this));
      }
    },
    toCelsius: {
      value: function(raw) {
        return (raw / 340.00) + 36.53;
      }
    }
  },
  GROVE: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value: function(raw) {
        var adcres = 1023,
          beta = 3975, // Beta parameter
          kelvin = 273.15, // 0°C = 273.15 K
          rb = 10000, // 10 kOhm (sensor resistance)
          ginf = 120.6685, // Ginf = 1/Rinf
          rthermistor, tempc;

        rthermistor = rb * (adcres / raw - 1);
        tempc = beta / (Math.log(rthermistor * ginf));

        return tempc - kelvin;
      }
    }
  }
};

// Otherwise known as...
Controllers["MPU-6050"] = Controllers.MPU6050;

var priv = new Map();

function Temperature(opts) {
  var controller, state, freq, last = 0, raw;

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

module.exports = Temperature;
