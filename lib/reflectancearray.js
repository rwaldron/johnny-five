var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  __ = require("../lib/fn.js"),
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
        return __.pluck(priv.get(this).sensorStates, "sensor");
      }
    },
    raw: {
      get: function() {
        return __.pluck(priv.get(this).sensorStates, "rawValue");
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

ReflectanceArray.prototype.onData = function(sensorState, value) {
  var allRead, values, state = priv.get(this);

  sensorState.dataReceived = true;
  sensorState.rawValue = value;

  allRead = __.every(state.sensorStates, "dataReceived");

  if (allRead) {
    this.emit("data", this.raw);

    state.sensorStates.forEach(function(sensorState) {
      sensorState.dataReceived = false;
    });
  }
};

ReflectanceArray.prototype.initialize = function() {
  var state = priv.get(this);

  if (typeof this.opts.emitter === "undefined") {
    throw new Error("Emitter pin is required");
  }

  if (!this.pins || this.pins.length === 0) {
    throw new Error("Pins must be defined");
  }

  state.emitter = new Led({
    board: this.board,
    pin: this.opts.emitter
  });

  state.sensorStates = this.pins.map(function(pin) {
    var self = this, sensorState;

    sensorState = {
      sensor: new Sensor({
        board: this.board,
        freq: this.freq,
        pin: pin
      }),
      rawValue: 0,
      dataReceived: false
    };

    sensorState.sensor.on("data", function() {
      self.onData(sensorState, this.value);
    });

    return sensorState;
  }.bind(this));

};

ReflectanceArray.prototype.enable = function() {
  priv.get(this).emitter.on();
};

ReflectanceArray.prototype.disable = function() {
  priv.get(this).emitter.off();
};

module.exports = ReflectanceArray;