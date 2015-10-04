var Board = require("../lib/board.js"),
  Emitter = require("events").EventEmitter,
  util = require("util");

// References
//
var Controllers = {
  HTU21D: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("../lib/imu");
        var driver = Multi.Drivers.get(this.board, "HTU21D", opts);
        driver.on("data", function(data) {
          dataHandler(data.humidity);
        });
      }
    },
    toRelativeHumidity: {
      value: function(raw) {
        return (125.0*(raw/65536)) - 6;
      }
    }
  }
};

var priv = new Map();

function Hygrometer(opts) {
  var controller, freq, last = 0, raw;

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
    controller = Controllers["ANALOG"];
  }

  priv.set(this, {});

  Object.defineProperties(this, controller);

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

    this.emit("data", null, data);

    if (this.relativeHumidity !== last) {
      last = this.relativeHumidity;
      this.emit("change", null, data);
    }
  }.bind(this), freq);
}

util.inherits(Hygrometer, Emitter);

module.exports = Hygrometer;