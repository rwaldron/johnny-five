var Board = require("../lib/board.js"),
  Emitter = require("events").EventEmitter,
  util = require("util");

var Controllers = {
  MPL3115A2: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("../lib/imu");
        var driver = Multi.Drivers.get(this.board, "MPL3115A2", opts);
        driver.on("data", function(data) {
          dataHandler(data.altitude);
        });
      }
    },
    toMeters: {
      value: function(raw) {
        // formulas extracted from code example:
        // https://github.com/adafruit/Adafruit_MPL3115A2_Library
        return raw / 16;
      }
    }
  }
};

var priv = new Map();

function Altimeter(opts) {
  var controller, freq, last = 0, raw;

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

  priv.set(this, {});

  Object.defineProperties(this, controller);

  if (!this.toMeters) {
    this.toMeters = opts.toMeters || function(x) { return x; };
  }

  var propDescriptors = {
    meters: {
      get: function() {
        return this.toMeters(raw);
      }
    },
    feet: {
      get: function() {
        return this.meters * 3.28084;
      }
    }
  };
  // Convenience aliases
  propDescriptors.m = propDescriptors.meters;
  propDescriptors.ft = propDescriptors.feet;
  
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
    data.m = data.meters = this.meters;
    data.ft = data.feet = this.feet;

    this.emit("data", data);

    if (this.meters !== last) {
      last = this.meters;
      this.emit("change", data);
    }
  }.bind(this), freq);
}

util.inherits(Altimeter, Emitter);

module.exports = Altimeter;
