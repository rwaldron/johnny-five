var Emitter = require("events").EventEmitter;
var util = require("util");

var Board = require("./board");
var Fn = require("./fn");

var toFixed = Fn.toFixed;


var Controllers = {
  MPL115A2: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "MPL115A2", opts);
        driver.on("data", function(data) {
          dataHandler.call(this, data.pressure);
        }.bind(this));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value: function(raw) {
        // Datasheet available at http://cache.freescale.com/files/sensors/doc/data_sheet/MPL115A2.pdf
        // Pressure output in kPa explained at P. 6, Eqn. 2
        var output = ((65 / 1023) * raw) + 50;
        // Typical resolution 0.15kPa from paragraph 2.2 page 3
        return toFixed(output, 2);
      }
    }
  },
  MPL3115A2: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "MPL3115A2", opts);
        driver.on("data", function(data) {
          dataHandler.call(this, data.pressure);
        }.bind(this));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value: function(raw) {
        // formulas extracted from code example:
        // https://github.com/adafruit/Adafruit_MPL3115A2_Library
        var inches = (raw / 4) / 3377;
        var output = inches * 3.39;
        // Datasheet available at https://www.nxp.com/docs/en/data-sheet/MPL3115A2.pdf
        // From Table 5, page 8
        // Typical resolution 1.5Pa = 0.0015kPa
        return toFixed(output, 4);
      }
    }
  },
  BMP180: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "BMP180", opts);
        driver.on("data", function(data) {
          dataHandler.call(this, data.pressure);
        }.bind(this));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value: function(raw) {
        // Datasheet available at https://ae-bst.resource.bosch.com/media/_tech/media/datasheets/BST-BMP180-DS000-121.pdf
        // From Table 1, page 6
        // Typical resolution 0.01hPa = 0.001kPa
        return toFixed(raw / 1000, 3);
      }
    }
  },
  BMP280: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "BMP280", opts);
        driver.on("data", function(data) {
          dataHandler.call(this, data.pressure);
        }.bind(this));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value: function(raw) {
        // Datasheet available at https://cdn-shop.adafruit.com/datasheets/BST-BMP280-DS001-11.pdf
        // From Table 2, page 8
        // Resolution in ultra high resolution mode 0.0016hPa = 0.00016kPa
        return toFixed(raw / 1000, 5);
      }
    }
  },
  BME280: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "BME280", opts);
        driver.on("data", function(data) {
          dataHandler.call(this, data.pressure);
        }.bind(this));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value: function(raw) {
        // Datasheet available at https://cdn.sparkfun.com/assets/learn_tutorials/4/1/9/BST-BME280_DS001-10.pdf
        // From Table 3, page 10
        // Typical resolution 0.18Pa = 0.00018kPa
        return toFixed(raw / 1000, 5);
      }
    }
  },
  MS5611: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "MS5611", opts);
        driver.on("data", function(data) {
          dataHandler.call(this, data.pressure);
        }.bind(this));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value: function(raw) {
        // Datasheet available at http://www.te.com/commerce/DocumentDelivery/DDEController?Action=srchrtrv&DocNm=MS5611-01BA03&DocType=Data+Sheet&DocLang=English
        // From table in page 2
        // Resolution      Over sampling ratio
        // 0.065mbar       256
        // 0.042mbar       512
        // 0.027mbar       1024
        // 0.018mbar       2048
        // 0.012mbar       4096
        //
        // 0.012mbar = 1,2Pa = 0.0012kPa
        return toFixed(raw / 1000, 4);
      }
    }
  },
};

Controllers.BMP085 = Controllers.BMP180;

/**
 * Barometer
 * @constructor
 *
 * five.Barometer(opts);
 *
 * five.Barometer({
 *   controller: "CONTROLLER"
 *   address: 0x00
 * });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Barometer(opts) {
  if (!(this instanceof Barometer)) {
    return new Barometer(opts);
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
    // controller = Controllers["ANALOG"];
    throw new Error("Missing Barometer controller");
  }

  Board.Controller.call(this, controller, opts);

  if (!this.toPressure) {
    this.toPressure = opts.toPressure || function(raw) {
      return raw;
    };
  }

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      raw = data;
    });
  }

  Object.defineProperties(this, {
    pressure: {
      get: function() {
        return this.toPressure(raw);
      }
    }
  });

  setInterval(function() {
    if (raw === null) {
      return;
    }

    var data = {
      pressure: this.pressure
    };

    this.emit("data", data);

    if (this.pressure !== last) {
      last = this.pressure;
      this.emit("change", data);
    }
  }.bind(this), freq);
}

util.inherits(Barometer, Emitter);

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Barometer.Controllers = Controllers;
  Barometer.purge = function() {};
}

module.exports = Barometer;
