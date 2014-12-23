var Emitter = require("events").EventEmitter;

var activeDrivers = new Map();

function int16(high, low) {
  var result = (high << 8) | low;

  // if highest bit is on, it is negative
  result = result >> 15 ? ((result ^ 0xFFFF) + 1) * -1 : result;

  return result;
}

var Drivers = {
  // Based on the example code from 
  // http://playground.arduino.cc/Main/MPU-6050
  // http://www.invensense.com/mems/gyro/mpu6050.html
  MPU6050: {
    ADDRESSES: {
      value: [0x68, 0x69]
    },
    COMMANDS: {
      value: {
        SETUP: [0x6B, 0x00], // += 250
        READREGISTER: 0x3B
      }
    },
    initialize: {
      value: function(board, opts) {
        var READLENGTH = 14;
        var io = board.io;
        var freq = opts.freq || 100;
        var address = opts.address || this.ADDRESSES[0];

        this.data = {
          accelerometer: {},
          temperature: {},
          gyro: {}
        };

        io.i2cConfig();
        io.i2cWrite(address, this.COMMANDS.SETUP);

        io.i2cRead(address, this.COMMANDS.READREGISTER, READLENGTH, function(data) {
          this.data.accelerometer = {
            x: int16(data[0], data[1]),
            y: int16(data[2], data[3]),
            z: int16(data[4], data[5])
          };

          this.data.temperature = int16(data[6], data[7]);

          this.data.gyro = {
            x: int16(data[8], data[9]),
            y: int16(data[10], data[11]),
            z: int16(data[12], data[13])
          };

          this.emit("data", null, this.data);
        }.bind(this));
      },
    },
    identifier: {
      value: function(opts) {
        var address = opts.address || Drivers["MPU6050"].ADDRESSES.value[0];
        return "mpu-6050-" + address;
      }
    }
  }
};

// Otherwise known as...
Drivers["MPU-6050"] = Drivers.MPU6050;

var Breakouts = {
  get: function(board, driverName, opts) {
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
  },
  clear: function() {
    activeDrivers.clear();
  }
};


module.exports = Breakouts;
