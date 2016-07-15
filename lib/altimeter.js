var IS_TEST_MODE = !!process.env.IS_TEST_MODE;
var Board = require("./board");
var Fn = require("./fn");
var Emitter = require("events").EventEmitter;
var util = require("util");

var Controllers = {
  MPL3115A2: {
    requirements: {
      value: {
        options: {
          elevation: {
            throws: false,
            message: "Missing `elevation` option. Without a specified base `elevation`, the altitude measurement will be inaccurate. Use the meters value shown on whatismyelevation.com",
            typeof: "number",
          }
        }
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "MPL3115A2", opts);
        driver.on("data", function(data) {
          dataHandler(data.altitude);
        });
      }
    },
    toMeters: {
      value: function(raw) {
        // http://cache.freescale.com/files/sensors/doc/data_sheet/MPL3115A2.pdf
        // Table 2, Note 3
        // "Smallest bit change in register represents minimum value change in
        // Pascals or meters. Typical resolution to signify change in altitudeis 0.3 m"
        return Fn.toFixed(raw, 1);
      }
    }
  },
  MS5611: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "MS5611", opts);
        driver.on("data", function(data) {
          dataHandler(data.altitude);
        });
      }
    },
    toMeters: {
      value: function(raw) {
        return Fn.toFixed(raw, 2);
      }
    }
  },

  BMP180: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "BMP180", opts);
        driver.on("data", function(data) {
          dataHandler(data.altitude);
        });
      }
    },
    toMeters: {
      value: function(raw) {
        return Fn.toFixed(raw, 2);
      }
    }
  },

  BMP280: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "BMP280", opts);
        driver.on("data", function(data) {
          dataHandler(data.altitude);
        });
      }
    },
    toMeters: {
      value: function(raw) {
        return Fn.toFixed(raw, 2);
      }
    }
  },
  BME280: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("./imu");
        var driver = Multi.Drivers.get(this.board, "BME280", opts);
        driver.on("data", function(data) {
          dataHandler(data.altitude);
        });
      }
    },
    toMeters: {
      value: function(raw) {
        return Fn.toFixed(raw, 2);
      }
    }
  },

};

Controllers["BMP085"] = Controllers["BMP-085"] = Controllers.BMP180;

var priv = new Map();

function Altimeter(opts) {
  var controller;
  var freq;
  var last = null;
  var raw = null;
  var state = {};

  if (!(this instanceof Altimeter)) {
    return new Altimeter(opts);
  }

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  freq = opts.freq || 25;


  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    throw new Error("Altimeter expects a valid controller");
  }

  Board.Controller.call(this, controller, opts);

  if (!this.toMeters) {
    this.toMeters = opts.toMeters || function(x) {
      return x;
    };
  }

  var descriptors = {
    meters: {
      get: function() {
        return this.toMeters(raw);
      }
    },
    feet: {
      get: function() {
        return Fn.toFixed(this.meters * 3.28084, 2);
      }
    }
  };
  // Convenience aliases
  descriptors.m = descriptors.meters;
  descriptors.ft = descriptors.feet;

  Object.defineProperties(this, descriptors);

  priv.set(this, state);

  /* istanbul ignore else */
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
    data.m = data.meters = this.meters;
    data.ft = data.feet = this.feet;

    this.emit("data", data);

    /* istanbul ignore else */
    if (this.meters !== last) {
      last = this.meters;
      this.emit("change", data);
    }
  }.bind(this), freq);
}

util.inherits(Altimeter, Emitter);

/* istanbul ignore else */
if (IS_TEST_MODE) {
  Altimeter.purge = function() {
    priv.clear();
  };
}


module.exports = Altimeter;
