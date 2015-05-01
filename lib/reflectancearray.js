var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  __ = require("../lib/fn.js"),
  Led = require("../lib/led"),
  Sensor = require("../lib/sensor");

var CALIBRATED_MIN_VALUE = 0;
var CALIBRATED_MAX_VALUE = 1000;
var LINE_ON_THRESHOLD = 200;
var LINE_NOISE_THRESHOLD = 50;

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
      onData.call(self, sensorState, this.value);
    });

    return sensorState;
  }, this);
}

function onData(sensorState, value) {
  var allRead, state = priv.get(this);

  sensorState.dataReceived = true;
  sensorState.rawValue = value;

  allRead = __.every(state.sensorStates, "dataReceived");

  if (allRead) {
    this.emit("data", null, this.raw);

    if (state.autoCalibrate) {
      setCalibration(state.calibration, this.raw);
    }

    if (this.isCalibrated) {
      this.emit("calibratedData", null, this.values);
      this.emit("line", null, this.line);
    }

    state.sensorStates.forEach(function(sensorState) {
      sensorState.dataReceived = false;
    });
  }
}

function setCalibration(calibration, values) {
  values.forEach(function(value, i) {
    if (calibration.min[i] === undefined || value < calibration.min[i]) {
      calibration.min[i] = value;
    }

    if (calibration.max[i] === undefined || value > calibration.max[i]) {
      calibration.max[i] = value;
    }
  });
}

function calibrationIsValid(calibration, sensors) {
  return calibration &&
         (calibration.max && calibration.max.length === sensors.length) &&
         (calibration.min && calibration.min.length === sensors.length);
}


function calibratedValues() {
  return this.raw.map(function(value, i) {
    var max = this.calibration.max[i],
        min = this.calibration.min[i];

    var scaled = __.scale(value, min, max, CALIBRATED_MIN_VALUE, CALIBRATED_MAX_VALUE);
    return __.constrain(scaled, CALIBRATED_MIN_VALUE, CALIBRATED_MAX_VALUE);
  }, this);
}

function maxLineValue() {
  return (this.sensors.length - 1) * CALIBRATED_MAX_VALUE;
}

// Returns a value between 0 and (n-1)*1000
// Given 5 sensors, the value will be between 0 and 4000
function getLine(whiteLine) {
  var onLine = false;
  var avg = 0, sum = 0;
  var state = priv.get(this);

  whiteLine = !!whiteLine;

  this.values.forEach(function(value, i) {
    value = whiteLine ? (CALIBRATED_MAX_VALUE - value) : value;

    if (value > LINE_ON_THRESHOLD) {
      onLine = true;
    }

    if (value > LINE_NOISE_THRESHOLD) {
      avg += value * i * CALIBRATED_MAX_VALUE;
      sum += value;
    }
  });

  if (!onLine) {
    var maxPoint = maxLineValue.call(this) + 1;
    var centerPoint = maxPoint/2;

    return state.lastLine < centerPoint ? 0 : maxPoint;
  }

  return state.lastLine = Math.floor(avg/sum);
}

// Constructor
function ReflectanceArray(opts) {

  if (!(this instanceof ReflectanceArray)) {
    return new ReflectanceArray(opts);
  }

  this.opts = Board.Options(opts);

  Board.Component.call(
    this, this.opts, {
      requestPin: false
    }
  );

  // Read event throttling
  this.freq = opts.freq || 25;

  // Make private data entry
  var state = {
    lastLine: 0,
    isOn: false,
    calibration: {
      min: [],
      max: []
    },
    autoCalibrate: opts.autoCalibrate || false
  };

  priv.set(this, state);

  initialize.call(this);

  Object.defineProperties(this, {
    isOn: {
      get: function() {
        return state.emitter.isOn;
      }
    },
    isCalibrated: {
      get: function() {
        return calibrationIsValid(this.calibration, this.sensors);
      }
    },
    isOnLine: {
      get: function() {
        var line = this.line;
        return line > CALIBRATED_MIN_VALUE && line < maxLineValue.call(this);
      }
    },
    sensors: {
      get: function() {
        return __.pluck(state.sensorStates, "sensor");
      }
    },
    calibration: {
      get: function() {
        return state.calibration;
      }
    },
    raw: {
      get: function() {
        return __.pluck(state.sensorStates, "rawValue");
      }
    },
    values: {
      get: function() {
        return this.isCalibrated ? calibratedValues.call(this) : this.raw;
      }
    },
    line: {
      get: function() {
        return this.isCalibrated ? getLine.call(this) : 0;
      }
    }
  });
}

util.inherits(ReflectanceArray, events.EventEmitter);

// Public methods
ReflectanceArray.prototype.enable = function() {
  var state = priv.get(this);

  state.emitter.on();

  return this;
};

ReflectanceArray.prototype.disable = function() {
  var state = priv.get(this);

  state.emitter.off();

  return this;
};

// Calibrate will store the min/max values for this sensor array
// It should be called many times in order to get a lot of readings
// on light and dark areas.  See calibrateUntil for a convenience
// for looping until a condition is met.
ReflectanceArray.prototype.calibrate = function() {
  var state = priv.get(this);

  this.once("data", function(err, values) {
    setCalibration(state.calibration, values);

    this.emit("calibrated");
  });

  return this;
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

  return this;
};

// Let the user tell us what the calibration data is
// This allows the user to save calibration data and
// reload it without needing to calibrate every time.
ReflectanceArray.prototype.loadCalibration = function(calibration) {
  var state = priv.get(this);

  if (!calibrationIsValid(calibration, this.sensors)) {
    throw new Error("Calibration data not properly set: {min: [], max: []}");
  }

  state.calibration = calibration;

  return this;
};

module.exports = ReflectanceArray;
