var Board = require("./board");
var Fn = require("./fn");
var Emitter = require("events").EventEmitter;
var util = require("util");

var toFixed = Fn.toFixed;
var priv = new Map();

var Controllers = {

  SHT31D: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "SHT31D", opts);
        driver.on("data", function(data) {
          dataHandler(data.humidity);
        });
      }
    },
    toRelativeHumidity: {
      value: function(raw) {
        // Page 2, Table 1
        // Based on the "Relative Humidity Conversion" formula
        // 1.1 Humidity Sensor Performance
        // Typical resoultion 0.01%RH
        //
        // Page 14
        // 4.13 Conversion of Signal Output
        // RH = 100 * (Srh / ((2 ** 26) - 1))
        // Srh = Sensor raw humidity
        return toFixed((100 * raw / 65535), 2);
      }
    }
  },


  HTU21D: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "HTU21D", opts);
        driver.on("data", function(data) {
          dataHandler(data.humidity);
        });
      }
    },
    toRelativeHumidity: {
      value: function(raw) {
        // Page 15
        // CONVERSION OF SIGNAL OUTPUTS
        // RH = -6 + 125 * (Srh / (2 ** 26))
        // Srh = Sensor raw humidity
        //
        // Page 3, Table `SENSOR PERFORMANCE`
        //
        // Typical resolution 0.04 %RH
        return toFixed((125 * raw / 65536) - 6, 2);
      }
    }
  },

  HIH6130: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "HIH6130", opts);
        driver.on("data", function(data) {
          dataHandler(data.humidity);
        });
      }
    },
    toRelativeHumidity: {
      // Page 7, Table 2
      // Typical resoultion 0.04%RH
      value: function(raw) {
        // Page 3
        // Equation 1: Humidity Conversion Function
        return toFixed(raw * 100 / (Fn.POW_2_14 - 1), 2);
      }
    }
  },

  DHT_I2C_NANO_BACKPACK: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "DHT_I2C_NANO_BACKPACK", opts);
        driver.on("data", function(data) {
          dataHandler(data.humidity);
        });
      }
    },
    toRelativeHumidity: {
      // DHT11

      // Page 4, Table
      // Typical resolution 1%RH
      //
      // DHT21

      // Page 2, Paragraph 5
      // Resolution 0.1%RH
      //
      // DHT22

      // Page 2, Paragraph 3
      // Resolution 0.1%RH
      value: function(raw) {
        return toFixed(raw / 100, 1);
      }
    }
  },

  TH02: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "TH02", opts);
        driver.on("data", function(data) {
          dataHandler(data.humidity);
        });
      }
    },
    toRelativeHumidity: {
      // Table 4
      // Resolution 12bit (16 codes per %RH) -> ~ 2 fractional digits
      value: function(raw) {
        if (raw > 100) {
          raw = 0;
        }
        return toFixed(raw || 0, 2);
      }
    }
  },

  SI7020: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "SI7020", opts);
        driver.on("data", function(data) {
          dataHandler(data.humidity);
        });
      }
    },
    toRelativeHumidity: {
      value: function(raw) {
        // Page 7, Table 4
        // The device can have 12-bit resolution ~ 2 fractional digits (100 / 2^12)
        //
        // Humidity formula
        // P. 22
        return toFixed((125 * raw / 65536) - 6, 2);
      }
    }
  },

  BME280: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "BME280", opts);
        driver.on("data", function(data) {
          dataHandler(data.humidity);
        });
      }
    },
    toRelativeHumidity: {
      value: function(raw) {
        // Page 23
        // 47445 / 1024 = 46.333 %RH
        return toFixed(raw / 1024, 3);
      }
    }
  }
};

Controllers.DHT11_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;
Controllers.DHT21_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;
Controllers.DHT22_I2C_NANO_BACKPACK = Controllers.DHT_I2C_NANO_BACKPACK;
Controllers.SI7021 = Controllers.SI7020;


function Hygrometer(opts) {
  if (!(this instanceof Hygrometer)) {
    return new Hygrometer(opts);
  }

  var controller = null;
  var last = null;
  var raw = null;

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  var freq = opts.freq || 25;

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    throw new Error("Missing Hygrometer controller");
  }

  priv.set(this, {});

  Board.Controller.call(this, controller, opts);

  if (!this.toRelativeHumidity) {
    this.toRelativeHumidity = opts.toRelativeHumidity || function(x) {
      return x;
    };
  }

  var propDescriptors = {
    relativeHumidity: {
      get: function() {
        return this.toRelativeHumidity(raw);
      }
    }
  };
  // Convenience aliases
  propDescriptors.RH = propDescriptors.relativeHumidity;

  Object.defineProperties(this, propDescriptors);

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      raw = data;
    });
  }

  setInterval(function() {
    if (raw == null) {
      return;
    }

    if (Number.isNaN(this.relativeHumidity)) {
      return;
    }

    var data = {};
    data.RH = data.relativeHumidity = this.relativeHumidity;

    this.emit("data", data);

    if (this.relativeHumidity !== last) {
      last = this.relativeHumidity;
      this.emit("change", data);
    }
  }.bind(this), freq);
}

util.inherits(Hygrometer, Emitter);

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Hygrometer.Controllers = Controllers;
  Hygrometer.purge = function() {
    priv.clear();
  };
}

module.exports = Hygrometer;
