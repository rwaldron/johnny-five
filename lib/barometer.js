var Board = require("../lib/board.js");
var Emitter = require("events").EventEmitter;
var util = require("util");


var Controllers = {
  MPL115A2: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("../lib/imu");
        var driver = Multi.Drivers.get(this.board, "MPL115A2", opts);
        driver.on("data", function(data) {
          dataHandler.call(this, data.pressure);
        }.bind(this));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value: function(raw) {
        // http://cache.freescale.com/files/sensors/doc/data_sheet/MPL115A2.pdf
        // P. 6, Eqn. 2
        return ((65.0 / 1023.0) * raw) + 50.0;
      }
    }
  },
  BMP180: {
    initialize: {
      value: function(opts, dataHandler) {
        var Multi = require("../lib/imu");
        var driver = Multi.Drivers.get(this.board, "BMP180", opts);
        driver.on("data", function(data) {
          dataHandler.call(this, data.pressure);
        }.bind(this));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value: function(raw) {
        return raw / 1000;
      }
    }
  }
};

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

  Object.defineProperties(this, controller);

  if (!this.toPressure) {
    this.toPressure = opts.toPressure || function(raw) { return raw; };
  }

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      raw = data;
    });
  }

  Object.defineProperties(this, {
    pressure: {
      get: function() {
        return this.toPressure(raw).toFixed(4);
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

module.exports = Barometer;
