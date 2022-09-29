const Board = require("./board");
const EventEmitter = require("events");
const Withinable = require("./mixins/withinable");
const {
  toFixed,
  POW_2_16,
} = require("./fn");
const {
  log,
  round,
  trunc,
} = Math;

const CELSIUS_TO_KELVIN = 273.15;

function analogHandler(options, callback) {
  const pin = options.pin;

  this.io.pinMode(pin, this.io.MODES.ANALOG);
  this.io.analogRead(pin, data => {
    callback.call(this, data);
  });
}

const activeDrivers = new Map();

const Drivers = {
  MAX31850K: {
    initialize: {
      value(board, options) {
        const CONSTANTS = {
          TEMPERATURE_FAMILY: 0x3B,
          CONVERT_TEMPERATURE_COMMAND: 0x44,
          READ_SCRATCHPAD_COMMAND: 0xBE,
          READ_COUNT: 9
        };

        const pin = options.pin;
        const freq = options.freq || 100;
        const getAddress = device => {
          // 64-bit device code
          // device[0]    => Family Code
          // device[1..6] => Serial Number (device[1] is LSB)
          // device[7]    => CRC
          let result = 0;
          for (let i = 6; i > 0; i--) {
            result = result * 256 + device[i];
          }
          return result;
        };

        board.io.sendOneWireConfig(pin, true);
        board.io.sendOneWireSearch(pin, (err, devices) => {
          if (err) {
            this.emit("error", err);
            return;
          }

          this.devices = devices.filter(device => device[0] === CONSTANTS.TEMPERATURE_FAMILY, this);

          if (devices.length === 0) {
            this.emit("error", new Error("FAILED TO FIND TEMPERATURE DEVICE"));
            return;
          }

          this.devices.forEach(device => {
            this.emit("initialized", getAddress(device));
          });

          let getAddresses = () => {
            if (this.addresses) {
              return this.devices.filter(function(device) {
                const address = getAddress(device);
                return this.addresses.includes(address);
              }, this);
            } else {
              return [this.devices[0]];
            }
          };

          let readTemperature = () => {
            let result;

            // request tempeature conversion
            let devicesToWait = getAddresses();
            let devicesToRead = getAddresses();

            devicesToRead.forEach(device => {
              board.io.sendOneWireReset(pin);
              board.io.sendOneWireWrite(pin, device, CONSTANTS.CONVERT_TEMPERATURE_COMMAND);
            });

            let isConversionAvailable = done => {
              let nextDevice;

              if (devicesToWait.length === 0) {
                return done();
              }

              nextDevice = devicesToWait.pop();

              board.io.sendOneWireReset(pin);

              board.io.sendOneWireWriteAndRead(pin, nextDevice, CONSTANTS.READ_SCRATCHPAD_COMMAND, CONSTANTS.READ_COUNT, (err, data) => {
                if (!data[0]) {
                  devicesToWait.push(nextDevice);

                  if (data[1] !== 0) { //*****checks if second data bit is 0, if not its an error and gets thrown out
                    return done();
                  }
                }

                isConversionAvailable(done);
              });
            };

            let readOne = () => {
              let device;

              if (devicesToRead.length === 0) {
                setTimeout(readTemperature, freq);
                return;
              }

              device = devicesToRead.pop();
              // read from the scratchpad
              board.io.sendOneWireReset(pin);

              board.io.sendOneWireWriteAndRead(pin, device, CONSTANTS.READ_SCRATCHPAD_COMMAND, CONSTANTS.READ_COUNT, (error, data) => {
                if (error) {
                  this.emit("error", error);
                  return;
                }

                result = (data[1] << 8) | data[0];
                this.emit("data", getAddress(device), result);

                readOne();
              });
            };

            isConversionAvailable(readOne);
          };

          readTemperature();
        });
      }
    },
    register: {
      value(address) {
        if (!this.addresses) {
          this.addresses = [];
        }

        this.addresses.push(address);
      }
    }
  },
  DS18B20: {
    initialize: {
      value(board, options) {
        const CONSTANTS = {
          TEMPERATURE_FAMILY: 0x28,
          CONVERT_TEMPERATURE_COMMAND: 0x44,
          READ_SCRATCHPAD_COMMAND: 0xBE,
          READ_COUNT: 2
        };

        const pin = options.pin;
        const freq = options.freq || 100;
        let getAddress;
        let readThermometer;
        let readOne;

        getAddress = device => {
          // 64-bit device code
          // device[0]    => Family Code
          // device[1..6] => Serial Number (device[1] is LSB)
          // device[7]    => CRC
          let i;

          let result = 0;
          for (i = 6; i > 0; i--) {
            result = result * 256 + device[i];
          }
          return result;
        };

        board.io.sendOneWireConfig(pin, true);
        board.io.sendOneWireSearch(pin, (err, devices) => {
          if (err) {
            this.emit("error", err);
            return;
          }

          this.devices = devices.filter(device => device[0] === CONSTANTS.TEMPERATURE_FAMILY, this);

          if (devices.length === 0) {
            this.emit("error", new Error("FAILED TO FIND TEMPERATURE DEVICE"));
            return;
          }

          this.devices.forEach(device => {
            this.emit("initialized", getAddress(device));
          });

          readThermometer = () => {
            let devicesToRead;
            let result;

            // request tempeature conversion
            if (this.addresses) {
              devicesToRead = this.devices.filter(function(device) {
                const address = getAddress(device);
                return this.addresses.includes(address);
              }, this);
            } else {
              devicesToRead = [this.devices[0]];
            }

            devicesToRead.forEach(device => {
              board.io.sendOneWireReset(pin);
              board.io.sendOneWireWrite(pin, device, CONSTANTS.CONVERT_TEMPERATURE_COMMAND);
            });

            // the delay gives the sensor time to do the calculation
            board.io.sendOneWireDelay(pin, 1);

            readOne = () => {
              let device;

              if (devicesToRead.length === 0) {
                setTimeout(readThermometer, freq);
                return;
              }

              device = devicesToRead.pop();
              // read from the scratchpad
              board.io.sendOneWireReset(pin);

              board.io.sendOneWireWriteAndRead(pin, device, CONSTANTS.READ_SCRATCHPAD_COMMAND, CONSTANTS.READ_COUNT, (err, data) => {
                if (err) {
                  this.emit("error", err);
                  return;
                }

                result = (data[1] << 8) | data[0];
                this.emit("data", getAddress(device), result);

                readOne();
              });
            };

            readOne();
          };

          readThermometer();
        });
      }
    },
    register: {
      value(address) {
        if (!this.addresses) {
          this.addresses = [];
        }

        this.addresses.push(address);
      }
    }
  }
};

Drivers.get = (board, driverName, options) => {
  let drivers;
  let driver;

  if (!activeDrivers.has(board)) {
    activeDrivers.set(board, {});
  }

  drivers = activeDrivers.get(board);

  const key = `${driverName}_${options.pin}`;

  if (!drivers[key]) {
    driver = new EventEmitter();
    Object.defineProperties(driver, Drivers[driverName]);
    driver.initialize(board, options);
    drivers[key] = driver;
  }

  return drivers[key];
};

Drivers.clear = () => {
  activeDrivers.clear();
};

// References
//
const Controllers = {
  // Generic thermistors. See datasheet for each device.
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
      value(raw) {
        // VOUT = 1500 mV at 150°C
        // VOUT = 250 mV at 25°C
        // VOUT = –550 mV at –55°C

        const mV = this.aref * 1000 * raw / 1023;

        // 10mV = 1°C
        //
        // Page 1
        return round(mV / 10);
      }
    }
  },

  LM335: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value(raw) {
        // OUTPUT 10mV/°K

        const mV = this.aref * 1000 * raw / 1023;

        // Page 1
        return round((mV / 10) - CELSIUS_TO_KELVIN);
      }
    }
  },

  TMP36: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value(raw) {
        // Analog Reference Voltage
        const mV = this.aref * 1000 * raw / 1023;

        // tempC = (mV / 10) - 50
        //
        // Page 3
        // Table 1
        // Accuracy 1°C
        return round((mV / 10) - 50);
      }
    }
  },

  TMP102: {
    ADDRESSES: {
      value: [0x48]
    },
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const address = Drivers.addressResolver(this, options);

        this.io.i2cConfig(options);

        // Addressing is unclear.

        this.io.i2cRead(address, 0x00, 2, data => {
          // Based on the example code from https://www.sparkfun.com/products/11931
          let raw = ((data[0] << 8) | data[1]) >> 4;

          // The tmp102 does twos compliment but has the negative bit in the wrong spot, so test for it and correct if needed
          if (raw & (1 << 11)) {
            raw |= 0xF800; // Set bits 11 to 15 to 1s to get this reading into real twos compliment
          }

          // twos compliment
          raw = raw >> 15 ? ((raw ^ 0xFFFF) + 1) * -1 : raw;

          callback(raw);
        });
      }
    },
    toCelsius: {
      value(raw) {
        // 6.5 Electrical Characteristics
        // –25°C to 85°C ±0.5
        return toFixed(raw / 16, 1);
      }
    },
  },

  MAX31850K: {
    initialize: {
      value(options, callback) {
        const state = priv.get(this);
        const address = options.address;
        const driver = Drivers.get(this.board, "MAX31850K", options);

        if (address) {
          state.address = address;
          driver.register(address);
        } else {
          if (driver.addressless) {
            this.emit("error", "You cannot have more than one MAX31850K without an address");
          }
          driver.addressless = true;
        }

        driver.once("initialized", dataAddress => {
          if (!state.address) {
            state.address = dataAddress;
          }
        });

        driver.on("data", (dataAddress, data) => {
          if (!address || dataAddress === address) {
            callback(data);
          }
        });
      }
    },
    toCelsius: {
      // Page 4
      // Thermocouple Temperature Data Resolution
      value(value) {
        return toFixed(value / 16, 2);
      }
    },
    address: {
      get() {
        return priv.get(this).address || 0x00;
      }
    }
  },

  // Based on code from Westin Pigott:
  //    https://github.com/westinpigott/one-wire-temps
  // And the datasheet:
  // OneWire protocol.  The device needs to be issued a "Convert Temperature"
  // command which can take up to 10 microseconds to compute, so we need
  // tell the board to delay 1 millisecond before issuing the "Read Scratchpad" command
  //
  // This device requires the OneWire support enabled via ConfigurableFirmata
  DS18B20: {
    initialize: {
      value(options, callback) {
        const state = priv.get(this);
        const address = options.address;
        const driver = Drivers.get(this.board, "DS18B20", options);

        if (address) {
          state.address = address;
          driver.register(address);
        } else {
          if (driver.addressless) {
            this.emit("error", "You cannot have more than one DS18B20 without an address");
          }
          driver.addressless = true;
        }

        driver.once("initialized", dataAddress => {
          if (!state.address) {
            state.address = dataAddress;
          }
        });

        driver.on("data", (dataAddress, data) => {
          if (!address || dataAddress === address) {
            callback(data);
          }
        });
      }
    },
    toCelsius: {
      value(value) {
        // ±0.5°C accuracy from -10°C to +85°C
        //
        // Temp resolution is as follows:
        // 9b,    10b     11b,     12b
        // 0.5°C, 0.25°C, 0.125°C, 0.0625°C
        //
        // I'm not sure which we're reading, so default to 4
        // fractional digits until we can verify
        return toFixed(value / 16, 4);
      }
    },
    address: {
      get() {
        return priv.get(this).address || 0x00;
      }
    }
  },


  SHT31D: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "SHT31D", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(value) {
        // Page 4, Table 1.2 Temperature Sensor Performance
        // Resolution: 0.015
        //
        // Page 14
        // 4.13 Conversion of Signal Output
        // T[C] = -45 + 175 * (St / ((2 ** 26) - 1))
        // St = Sensor raw temperature
        return toFixed(-45 + (175 * (value / (POW_2_16 - 1))), 3);
      }
    }
  },

  HTU21D: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "HTU21D", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(value) {
        // Page 5
        // Digital Relative Humidity sensor with Temperature output
        // Resolution shows 0.01-0.04
        //
        // Page 15
        // CONVERSION OF SIGNAL OUTPUTS
        // T = -46.85 + 175.72 * (Stemp / (2 ** 16))
        // Stemp = Sensor raw temperature
        return toFixed(-46.85 + (175.72 * (value / POW_2_16)), 2);
      }
    }
  },
  HIH6130: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "HIH6130", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(raw) {
        // Page 3
        // 5.0 Calculation of Optional Temperature
        // from the Digital Output
        //
        // -40 C = 0
        // 125 C = 2 ** 14 - 1
        return round(raw / 1000);
      }
    }
  },

  DHT_I2C_NANO_BACKPACK: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "DHT_I2C_NANO_BACKPACK", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(raw) {
        // Page 2
        // 5. Product parameters
        // Range: ... ±2°C
        return round(raw / 100);
      }
    }
  },

  TH02: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "TH02", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(raw) {
        // Page 8, Table 5
        // Temperature Sensor
        // Accuracy Typical at 25 °C — ±0.5 ±1.0 °C
        return toFixed(raw, 1);
      }
    }
  },

  MPU6050: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "MPU6050", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(raw) {
        // No sub-degree/fractional parts illustrated in datasheet
        return round((raw / 340.00) + 36.53);
      }
    }
  },

  BNO055: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "BNO055", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(raw) {
        // Page 37, Table 3-37
        // Temperature data representation
        // 1°C = 1 LSB
        // raw is already C
        return trunc(raw);
      }
    }
  },

  MPL115A2: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "MPL115A2", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(raw) {
        // No description, so removing fractional parts
        return trunc((raw - 498) / -5.35 + 25);
      }
    }
  },

  MPL3115A2: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "MPL3115A2", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(raw) {
        // Page 5
        // Table 2 Mechanical Characteristics
        // Accuracy @ 25 °C ±1°C
        return round(raw / 16);
      }
    }
  },

  MS5611: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "MS5611", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(raw) {
        // Page 1
        // TECHNICAL DATA
        // Resolution <0.01 °C
        return toFixed(raw, 2);
      }
    }
  },

  GROVE: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value(raw) {
        // http://www.seeedstudio.com/wiki/Grove_-_Temperature_Sensor
        const adcres = 1023;
        // Beta parameter
        const beta = 3975;
        // 10 kOhm (sensor resistance)
        const rb = 10000;
        // Ginf = 1/Rinf
        // var ginf = 120.6685;
        // Reference Temperature 25°C
        const tempr = 298.15;

        const rthermistor = (adcres - raw) * rb / raw;
        const tempc = 1 / (log(rthermistor / rb) / beta + 1 / tempr) - CELSIUS_TO_KELVIN;

        return round(tempc);
      }
    }
  },

  // MF52A103J3470
  TINKERKIT: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value(value) {
        const adcres = 1023;
        const beta = 3950;
        const rb = 10000; // 10 kOhm
        const ginf = 120.6685; // Ginf = 1/Rinf

        const rthermistor = rb * (adcres / value - 1);
        const tempc = beta / (log(rthermistor * ginf));

        return round(tempc - CELSIUS_TO_KELVIN);
      }
    }
  },

  BMP180: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "BMP180", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(value) {
        // Page 6, Table 1
        // Operating conditions, output signal and mechanical characteristics
        //
        // Resolution of output data
        // pressure 0.01 hPa
        // temperature 0.1 °C
        return toFixed(value, 1);
      }
    }
  },

  BMP280: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "BMP280", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(value) {
        // Page 8
        //
        // Resolution of output data in ultra high resolution mode*
        // Pressure 0.0016 hPa
        // Temperature 0.01 °C
        //
        // * resolution mode is currently not configurable.
        //
        return toFixed(value, 2);
      }
    }
  },

  BME280: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "BME280", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(value) {
        // Page 23
        // Resolution is 0.01 DegC.
        return toFixed(value, 2);
      }
    }
  },

  SI7020: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "SI7020", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(value) {
        // Page 9, Table 5. Temperature Sensor
        // Accuracy1 –10 °C< tA < 85 °C — ±0.3 ±0.4 °C
        //
        // Page 23
        // (See temperature conversion expression)
        return toFixed((175.72 * value / 65536) - 46.85, 1);
      }
    }
  },

  MCP9808: {
    ADDRESSES: {
      value: [0x18]
    },
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        const address = Drivers.addressResolver(this, options);

        this.io.i2cConfig(options);
        // Page 17
        // Register 0x05 = Ta (Temp, Ambient)
        this.io.i2cRead(address, 0x05, 2, data => {
          // Page 24
          // 5.1.3 AMBIENT TEMPERATURE REGISTER (TA)
          // Page 25
          let value = (((data[0] << 8) | data[1]) & 0x0FFF) / 16;

          if (value & 0x1000) {
            value -= 256;
          }
          callback(value);
        });
      }
    },
    toCelsius: {
      value(value) {
        // Page 1
        // Microchip Technology Inc.s MCP9808 digital
        // temperature sensor converts temperatures between
        // -20°C and +100°C to a digital word with
        // ±0.25°C/±0.5°C (typical/maximum) accuracy.
        return toFixed(value, 2);
      }
    },
  },

  LSM303C: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "LSM303C", options)
          .on("data", ({temperature}) => callback(temperature));
      }
    },
    toCelsius: {
      value(value) {
        // int16 resolution, 8 bits per C, 0 = 25 C
        return toFixed((value / 8) + 25, 1);
      }
    }
  },
};

Controllers.BMP085 = Controllers.BMP180;
Controllers.GY521 = Controllers.MPU6050;
Controllers.SI7021 = Controllers.SI7020;
Controllers.DHT11_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;
Controllers.DHT21_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;
Controllers.DHT22_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;
Controllers.DEFAULT = Controllers.ANALOG;

var priv = new Map();

class Thermometer extends Withinable {
  constructor(options) {
    super();

    let last = null;
    let raw = null;

    Board.Component.call(
      this, options = Board.Options(options)
    );


    Board.Controller.call(this, Controllers, options);

    const state = {
      enabled: typeof options.enabled === "undefined" ? true : options.enabled,
      intervalId: null,
      freq: options.freq || 25,
      previousFreq: options.freq || 25,
    };

    priv.set(this, state);

    // Analog Reference Voltage (default to board.io.aref || 5)
    this.aref = options.aref || this.io.aref || 5;

    if (!this.toCelsius) {
      this.toCelsius = options.toCelsius || (x => x);
    }

    // TODO: Move this out of the constructor
    const eventProcessing = () => {
      if (raw == null) {
        return;
      }

      const data = {};
      data.C = data.celsius = this.celsius;
      data.F = data.fahrenheit = this.fahrenheit;
      data.K = data.kelvin = this.kelvin;

      this.emit("data", data);

      if (this.celsius !== last) {
        last = this.celsius;
        this.emit("change", data);
      }
    };

    const descriptors = {
      celsius: {
        get() {
          return this.toCelsius(raw);
        }
      },
      fahrenheit: {
        get() {
          return toFixed((this.celsius * 9 / 5) + 32, 2);
        }
      },
      kelvin: {
        get() {
          return toFixed(this.celsius + CELSIUS_TO_KELVIN, 2);
        }
      },
      freq: {
        get() {
          return state.freq;
        },
        set(newFreq) {
          state.freq = newFreq;
          if (state.intervalId) {
            clearInterval(state.intervalId);
          }

          if (state.freq !== null) {
            state.intervalId = setInterval(eventProcessing, newFreq);
          }
        }
      },
    };
    // Convenience aliases
    descriptors.C = descriptors.celsius;
    descriptors.F = descriptors.fahrenheit;
    descriptors.K = descriptors.kelvin;

    Object.defineProperties(this, descriptors);

    if (typeof this.initialize === "function") {
      this.initialize(options, data => raw = data);
    }

    // Set the freq property only after the get and set functions are defined
    // and only if the sensor is not `enabled: false`
    if (state.enabled) {
      this.freq = state.freq;
    }
  }

  /**
   * enable Enable a disabled thermometer.
   *
   * @return {Object} instance
   *
   */
  enable() {
    const state = priv.get(this);

    /* istanbul ignore else */
    if (!state.enabled) {
      this.freq = state.freq || state.previousFreq;
    }

    return this;
  }

  /**
   * disable Disable an enabled thermometer.
   *
   * @return {Object} instance
   *
   */
  disable() {
    const state = priv.get(this);

    /* istanbul ignore else */
    if (state.enabled) {
      state.enabled = false;
      state.previousFreq = state.freq;
      this.freq = null;
    }

    return this;
  }
}

Thermometer.Drivers = Drivers;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Thermometer.Controllers = Controllers;
  Thermometer.purge = () => {
    priv.clear();
  };
}

module.exports = Thermometer;
