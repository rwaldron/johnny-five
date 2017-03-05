var Emitter = require("events").EventEmitter;
var util = require("util");

var Board = require("./board");
var Fn = require("./fn");

var toFixed = Fn.toFixed;

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
  MAX31850K: {
    initialize: {
      value: function(board, opts) {
        var CONSTANTS = {
            TEMPERATURE_FAMILY: 0x3B,
            CONVERT_TEMPERATURE_COMMAND: 0x44,
            READ_SCRATCHPAD_COMMAND: 0xBE,
            READ_COUNT: 9
          },
          pin = opts.pin,
          freq = opts.freq || 100,
          getAddress, readTemperature, isConversionAvailable, getAddresses, readOne;

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

          getAddresses = function() {
            if (this.addresses) {
              return this.devices.filter(function(device) {
                var address = getAddress(device);
                return this.addresses.includes(address);
              }, this);
            } else {
              return [this.devices[0]];
            }
          }.bind(this);

          readTemperature = function() {
            var devicesToWait, devicesToRead, result;

            // request tempeature conversion
            devicesToWait = getAddresses();
            devicesToRead = getAddresses();

            devicesToRead.forEach(function(device) {
              board.io.sendOneWireReset(pin);
              board.io.sendOneWireWrite(pin, device, CONSTANTS.CONVERT_TEMPERATURE_COMMAND);
            });

            isConversionAvailable = function(done) {
              var nextDevice;

              if (devicesToWait.length === 0) {
                return done();
              }

              nextDevice = devicesToWait.pop();

              board.io.sendOneWireReset(pin);

              board.io.sendOneWireWriteAndRead(pin, nextDevice, CONSTANTS.READ_SCRATCHPAD_COMMAND, CONSTANTS.READ_COUNT, function(err, data) {
                if (!data[0]) {
                  devicesToWait.push(nextDevice);

                  if (data[1] !== 0) { //*****checks if second data bit is 0, if not its an error and gets thrown out
                    return done();
                  }
                }

                isConversionAvailable(done);
              });
            }.bind(this);

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

            isConversionAvailable(readOne);
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
  },
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
          getAddress, readThermometer, readOne;

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

          readThermometer = function() {
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
                setTimeout(readThermometer, freq);
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

          readThermometer();
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
  // Generic thermistors. See datasheet for each device.
  ANALOG: {
    initialize: {
      value: analogHandler
    }
  },

  // http://www.ti.com/lit/ds/symlink/lm35.pdf
  LM35: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value: function(raw) {
        // VOUT = 1500 mV at 150°C
        // VOUT = 250 mV at 25°C
        // VOUT = –550 mV at –55°C

        var mV = this.aref * 1000 * raw / 1023;

        // 10mV = 1°C
        //
        // Page 1
        return Math.round(mV / 10);
      }
    }
  },

  // http://www.ti.com/lit/ds/symlink/lm335.pdf
  LM335: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value: function(raw) {
        // OUTPUT 10mV/°K

        var mV = this.aref * 1000 * raw / 1023;

        // Page 1
        return Math.round((mV / 10) - CELSIUS_TO_KELVIN);
      }
    }
  },

  // http://www.analog.com/media/en/technical-documentation/data-sheets/TMP35_36_37.pdf
  TMP36: {
    initialize: {
      value: analogHandler
    },
    toCelsius: {
      value: function(raw) {
        // Analog Reference Voltage
        var mV = this.aref * 1000 * raw / 1023;

        // tempC = (mV / 10) - 50
        // http://ctms.engin.umich.edu/CTMS/Content/Activities/TMP35_36_37.pdf
        //
        // Page 3
        // Table 1
        // Accuracy 1°C
        return Math.round((mV / 10) - 50);
      }
    }
  },

  // http://www.ti.com.cn/cn/lit/ds/symlink/tmp102.pdf
  TMP102: {
    ADDRESSES: {
      value: [0x48]
    },
    initialize: {
      value: function(opts, dataHandler) {
        var address = opts.address || this.ADDRESSES[0];

        opts.address = address;

        this.io.i2cConfig(opts);

        // http://www.ti.com/lit/ds/sbos397b/sbos397b.pdf
        // Addressing is unclear.

        this.io.i2cRead(address, 0x00, 2, function(data) {
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
        // 6.5 Electrical Characteristics
        // –25°C to 85°C ±0.5
        return toFixed(raw / 16, 1);
      }
    },
  },

  // https://cdn-shop.adafruit.com/datasheets/MAX31850-MAX31851.pdf
  MAX31850K: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this),
          address = opts.address,
          driver = Drivers.get(this.board, "MAX31850K", opts);

        if (address) {
          state.address = address;
          driver.register(address);
        } else {
          if (driver.addressless) {
            this.emit("error", "You cannot have more than one MAX31850K without an address");
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
      // Page 4
      // Thermocouple Temperature Data Resolution
      value: function(raw) {
        return toFixed(raw / 16, 2);
      }
    },
    address: {
      get: function() {
        return priv.get(this).address || 0x00;
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
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // DS18B20.pdf, Default
        // ±0.5°C accuracy from -10°C to +85°C
        //
        // Temp resolution is as follows:
        // 9b,    10b     11b,     12b
        // 0.5°C, 0.25°C, 0.125°C, 0.0625°C
        //
        // I'm not sure which we're reading, so default to 4
        // fractional digits until we can verify
        return toFixed(raw / 16, 4);
      }
    },
    address: {
      get: function() {
        return priv.get(this).address || 0x00;
      }
    }
  },

  // https://cdn-shop.adafruit.com/product-files/2857/Sensirion_Humidity_SHT3x_Datasheet_digital-767294.pdf
  SHT31D: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "SHT31D", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // Page 4
        // Table 1.2 Temperature Sensor Performance
        // Resolution: 0.015
        //
        // Page 14
        // 4.13 Conversion of Signal Output
        // T[C] = -45 + 175 * (St / ((2 ** 26) - 1))
        // St = Sensor raw temperature
        return toFixed((175 * raw / 65535) - 45, 3);
      }
    }
  },

  // https://www.adafruit.com/datasheets/1899_HTU21D.pdf
  HTU21D: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "HTU21D", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // Page 5
        // Digital Relative Humidity sensor with Temperature output
        // Resolution shows 0.01-0.04
        //
        // Page 15
        // CONVERSION OF SIGNAL OUTPUTS
        // T = -46.85 + 175.72 * (Stemp / (2 ** 16))
        // Stemp = Sensor raw temperature
        return toFixed((175.72 * raw / 65536) - 46.85, 2);
      }
    }
  },
  // http://www.phanderson.com/arduino/I2CCommunications.pdf
  // http://cdn.sparkfun.com/datasheets/Prototyping/1443945.pdf
  HIH6130: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "HIH6130", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // Page 3
        // 5.0 Calculation of Optional Temperature
        // from the Digital Output
        //
        // -40 C = 0
        // 125 C = 2 ** 14 - 1
        return Math.round(raw / 1000);
      }
    }
  },

  // http://akizukidenshi.com/download/ds/aosong/DHT11.pdf
  DHT_I2C_NANO_BACKPACK: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "DHT_I2C_NANO_BACKPACK", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // Page 2
        // 5. Product parameters
        // Range: ... ±2°C
        return Math.round(raw / 100);
      }
    }
  },

  // http://www.seeedstudio.com/wiki/images/3/30/TH02_SENSOR.pdf
  TH02: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "TH02", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // Page 8
        // Table 5. Temperature Sensor
        // Accuracy Typical at 25 °C — ±0.5 ±1.0 °C
        return toFixed(raw, 1);
      }
    }
  },

  // https://cdn.sparkfun.com/datasheets/Components/General%20IC/PS-MPU-6000A.pdf
  MPU6050: {
    initialize: {
      value: function(opts, dataHandler) {
        var IMU = require("./imu");
        var driver = IMU.Drivers.get(this.board, "MPU6050", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // No sub-degree/fractional parts illustrated in datasheet
        return Math.round((raw / 340.00) + 36.53);
      }
    }
  },

  // https://cdn-shop.adafruit.com/datasheets/BST_BNO055_DS000_12.pdf
  BNO055: {
    initialize: {
      value: function(opts, dataHandler) {
        var IMU = require("./imu");
        var driver = IMU.Drivers.get(this.board, "BNO055", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // Page 37
        // Table 3-37: Temperature data representation
        // 1°C = 1 LSB
        // raw is already C
        return Math.trunc(raw);
      }
    }
  },

  // http://cache.freescale.com/files/sensors/doc/data_sheet/MPL115A2.pdf
  MPL115A2: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "MPL115A2", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // No description, so removing fractional parts
        return Math.trunc((raw - 498) / -5.35 + 25);
      }
    }
  },

  // http://www.nxp.com/files/sensors/doc/data_sheet/MPL3115A2.pdf
  MPL3115A2: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "MPL3115A2", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // Page 5
        // Table 2 Mechanical Characteristics
        //  Accuracy @ 25 °C ±1°C
        return Math.round(raw / 16);
      }
    }
  },

  // http://www.hpinfotech.ro/MS5611-01BA03.pdf
  MS5611: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "MS5611", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
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

        return Math.round(tempc);
      }
    }
  },

  // http://www.cantherm.com/media/productPDF/cantherm_mf52_1.pdf
  // MF52A103J3470
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

        return Math.round(tempc - CELSIUS_TO_KELVIN);
      }
    }
  },

  // https://cdn-shop.adafruit.com/datasheets/BST-BMP180-DS000-09.pdf
  BMP180: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "BMP180", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // Page 6
        // Table 1: Operating conditions, output signal and mechanical characteristics
        //
        // Resolution of output data
        // pressure 0.01 hPa
        // temperature 0.1 °C
        return toFixed(raw, 1);
      }
    }
  },

  // https://cdn-shop.adafruit.com/datasheets/BST-BMP280-DS001-11.pdf
  BMP280: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "BMP280", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // Page 8
        //
        // Resolution of output data in ultra high resolution mode*
        // Pressure 0.0016 hPa
        // Temperature 0.01 °C
        //
        // * resolution mode is currently not configurable.
        //
        return toFixed(raw, 2);
      }
    }
  },

  // https://cdn.sparkfun.com/assets/learn_tutorials/4/1/9/BST-BME280_DS001-10.pdf
  BME280: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "BME280", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // Page 23
        // Resolution is 0.01 DegC.
        return toFixed(raw, 2);
      }
    }
  },

  // https://www.silabs.com/Support%20Documents/TechnicalDocs/Si7020-A20.pdf
  SI7020: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "SI7020", opts);
        driver.on("data", function(data) {
          dataHandler(data.temperature);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // Page 9
        // Table 5. Temperature Sensor
        // Accuracy1 –10 °C< tA < 85 °C — ±0.3 ±0.4 °C
        //
        // Page 23
        // (See temperature conversion expression)
        return toFixed((175.72 * raw / 65536) - 46.85, 1);
      }
    }
  },

  // http://ww1.microchip.com/downloads/en/DeviceDoc/25095A.pdf
  MCP9808: {
    ADDRESSES: {
      value: [0x18]
    },
    initialize: {
      value: function(opts, dataHandler) {
        var address = opts.address || this.ADDRESSES[0];

        opts.address = address;

        this.io.i2cConfig(opts);
        // Page 17
        // Register 0x05 = Ta (Temp, Ambient)
        this.io.i2cRead(address, 0x05, 2, function(data) {
          // Page 24
          // 5.1.3 AMBIENT TEMPERATURE REGISTER (TA)
          var raw = (data[0] << 8) | data[1];

          // Page 25
          raw = (raw & 0x0FFF) / 16;

          if (raw & 0x1000) {
            raw -= 256;
          }
          dataHandler(raw);
        });
      }
    },
    toCelsius: {
      value: function(raw) {
        // Page 1
        // Microchip Technology Inc.s MCP9808 digital
        // temperature sensor converts temperatures between
        // -20°C and +100°C to a digital word with
        // ±0.25°C/±0.5°C (typical/maximum) accuracy.
        return toFixed(raw, 2);
      }
    },
  },
};

Controllers.BMP085 = Controllers.BMP180;
Controllers.GY521 = Controllers.MPU6050;
Controllers.SI7021 = Controllers.SI7020;
Controllers.DHT11_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;
Controllers.DHT21_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;
Controllers.DHT22_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;


var priv = new Map();

function Thermometer(opts) {

  if (!(this instanceof Thermometer)) {
    return new Thermometer(opts);
  }

  var controller = null;
  var last = null;
  var raw = null;

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  var freq = opts.freq || 25;

  // Analog Reference Voltage (default to board.io.aref || 5)
  this.aref = opts.aref || this.io.aref || 5;

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    controller = Controllers.ANALOG;
  }

  priv.set(this, {});

  Board.Controller.call(this, controller, opts);

  if (!this.toCelsius) {
    this.toCelsius = opts.toCelsius || function(x) {
      return x;
    };
  }

  var descriptors = {
    celsius: {
      get: function() {
        return this.toCelsius(raw);
      }
    },
    fahrenheit: {
      get: function() {
        return toFixed((this.celsius * 9 / 5) + 32, 2);
      }
    },
    kelvin: {
      get: function() {
        return toFixed(this.celsius + CELSIUS_TO_KELVIN, 2);
      }
    }
  };
  // Convenience aliases
  descriptors.C = descriptors.celsius;
  descriptors.F = descriptors.fahrenheit;
  descriptors.K = descriptors.kelvin;

  Object.defineProperties(this, descriptors);

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      raw = data;
    });
  }

  setInterval(function() {
    if (raw == null) {
      return;
    }

    var data = {};
    data.C = data.celsius = this.celsius;
    data.F = data.fahrenheit = this.fahrenheit;
    data.K = data.kelvin = this.kelvin;

    this.emit("data", data);

    if (this.celsius !== last) {
      last = this.celsius;
      this.emit("change", data);
    }
  }.bind(this), freq);
}

util.inherits(Thermometer, Emitter);

Thermometer.Drivers = Drivers;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Thermometer.Controllers = Controllers;
  Thermometer.purge = function() {
    priv.clear();
  };
}

module.exports = Thermometer;
