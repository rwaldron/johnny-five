var Board = require("./board"),
  Emitter = require("events").EventEmitter,
  util = require("util");

// References
//
var Controllers = {
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
        // Based on the "Relative Humidity Conversion" formula
        // https://www.adafruit.com/datasheets/1899_HTU21D.pdf
        return (125 * raw / 65536) - 6;
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
        // https://www.silabs.com/Support%20Documents/TechnicalDocs/Si7020-A20.pdf
        // P. 22
        return (125 * raw / 65536) - 6;
      }
    }
  }
};

var priv = new Map();

function Hygrometer(opts) {
  var controller, freq, last = 0, raw = 0;

  if (!(this instanceof Hygrometer)) {
    return new Hygrometer(opts);
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
    throw new Error("Missing Hygrometer controller");
  }

  priv.set(this, {});

  Board.Controller.call(this, controller, opts);

  if (!this.toRelativeHumidity) {
    this.toRelativeHumidity = opts.toRelativeHumidity || function(x) { return x; };
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
    if (raw === undefined) {
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

module.exports = Hygrometer;
