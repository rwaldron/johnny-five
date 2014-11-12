var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  __ = require("../lib/fn.js"),
  Led = require("../lib/led"),
  Sensor = require("../lib/sensor");

var MAX_VALUE = 1023;

var priv = new Map();

// Private methods
function initialize() {
  var self = this, state = priv.get(this);

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
    var sensorState = {
      sensor: new Sensor({
        board: this.board,
        freq: this.freq,
        pin: pin
      }),
      rawValue: 0,
      dataReceived: false
    };


    sensorState.sensor.on("data", function() {
      onData.bind(self)(sensorState, this.value);
    });

    return sensorState;
  }.bind(this));
}

function onData(sensorState, value) {
  var allRead, values, state = priv.get(this);

  sensorState.dataReceived = true;
  sensorState.rawValue = value;

  allRead = __.every(state.sensorStates, "dataReceived");

  if (allRead) {
    this.emit("data", null, this.raw);

    state.sensorStates.forEach(function(sensorState) {
      sensorState.dataReceived = false;
    });
  }
}

function calibrationIsValid(calibration, sensors) {
  return calibration && 
         calibration.max && 
         calibration.max.length === sensors.length &&
         calibration.min &&
         calibration.min.length === sensors.length;
}

// Constructor
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
    isOn: false, 
    calibration: {
      min: [],
      max: []
    }
  });

  initialize.bind(this)();

  Object.defineProperties(this, {
    isOn: {
      get: function() {
        return priv.get(this).emitter.isOn;
      }
    },
    isCalibrated: {
      get: function() {
        return calibrationIsValid(this.calibration, this.sensors);
      }
    },
    sensors: {
      get: function() {
        return __.pluck(priv.get(this).sensorStates, "sensor");
      }
    },
    calibration: {
      get: function() {
        return priv.get(this).calibration;
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

// Public methods
ReflectanceArray.prototype.enable = function() {
  priv.get(this).emitter.on();
};

ReflectanceArray.prototype.disable = function() {
  priv.get(this).emitter.off();
};

// Calibrate will store the min/max values for this sensor array
// It should be called many times in order to get a lot of readings
// on light and dark areas.  See calibrateUntil for a convenience
// for looping until a condition is met.
ReflectanceArray.prototype.calibrate = function() {
  var state = priv.get(this);

  this.once("data", function(err, values) {
    values.forEach(function(value, i) {
      if (state.calibration.min[i] === undefined || value < state.calibration.min[i]) {
        state.calibration.min[i] = value;
      }

      if (state.calibration.max[i] === undefined || value > state.calibration.max[i]) {
        state.calibration.max[i] = value;
      }
    });

    this.emit("calibrated");
  }.bind(this));
};

// This will continue to calibrate until the predicate is true.
// Allows the user to calibrate n-times, or wait for user input, 
// or base it on calibration heuristics.  However the user wants.
ReflectanceArray.prototype.calibrateUntil = function(predicate) {
  var loop = function() {
    this.calibrate();
    this.once("calibrated", function() {
      if (!predicate()) {
        loop();
      }
    });
  }.bind(this);

  loop();
};

// Let the user tell us what the calibration data is
// This allows the user to save calibration data and
// reload it without needing to calibrate every time.
ReflectanceArray.prototype.loadCalibration = function(calibration) {
  if (!calibrationIsValid(calibration, this.sensors)) {
    throw new Error("Calibration data not properly set: {min: [], max: []}");
  }

  priv.get(this).calibration = calibration;
};

module.exports = ReflectanceArray;