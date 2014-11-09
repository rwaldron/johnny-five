var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  Led = require("../lib/led"),
  Sensor = require("../lib/sensor");


var priv = new Map();

function ReflectanceArray(opts) {

  if (!(this instanceof ReflectanceArray)) {
    return new ReflectanceArray(opts);
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, this.opts = Board.Options(opts)
  );

  // Read event throttling
  this.freq = opts.freq || 500;

  // Make private data entry
  priv.set(this, {
    isOn: false
  });

  this.initialize();

  Object.defineProperties(this, {
    isOn: {
      get: function() {
        return priv.get(this).emitter.isOn;
      }
    },
    sensors: {
      get: function() {
        return priv.get(this).sensors;
      }
    },
    raw: {
      get: function() {
        return [];
      }
    },
    values: {
      get: function() {
        // if calibrated, return calibrated
        return [];
      }
    },
    line: {
      get: function() {
        return 0;
      }
    }
  });
}

util.inherits(ReflectanceArray, events.EventEmitter);

ReflectanceArray.prototype.initialize = function() {
  if (typeof this.opts.emitter === "undefined") {
    throw new Error("Emitter pin is required");
  }

  if (!this.pins || this.pins.length === 0) {
    throw new Error("Pins must be defined");
  }

  priv.get(this).emitter = new Led({
    board: this.board,
    pin: this.opts.emitter
  });

  priv.get(this).sensors = this.pins.map(function(pin) {
    return new Sensor({
      board: this.board,
      pin: pin
    });
  });

};

ReflectanceArray.prototype.enable = function() {
  priv.get(this).emitter.on();
};

ReflectanceArray.prototype.disable = function() {
  priv.get(this).emitter.off();
};

module.exports = ReflectanceArray;