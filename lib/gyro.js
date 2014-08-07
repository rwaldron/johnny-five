var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  __ = require("../lib/fn.js"),
  sum = __.sum;

var priv = new Map();
var axes = ["x", "y"];

// TODO: Migrate to multi-device design

function Gyro(opts) {
  if (!(this instanceof Gyro)) {
    return new Gyro(opts);
  }

  var err = null;
  var isCalibrated = false;
  var sampleSize = 100;
  // 4.88mV / (0.167mV/dps * 2)
  // 0.67 = 4X
  // 0.167 = 1X
  var sensitivity = null;
  var resolution = 4.88;
  var K;

  var state = {
    x: {
      angle: 0,
      value: 0,
      previous: 0,
      calibration: [],
      stash: [0, 0, 0, 0, 0],
      zeroVoltage: 512
    },
    y: {
      angle: 0,
      value: 0,
      previous: 0,
      calibration: [],
      stash: [0, 0, 0, 0, 0],
      zeroVoltage: 512
    }
  };

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  if (!opts.amplify ||
    (opts.amplify && opts.amplify !== 1 || opts.amplify !== 4)) {
    opts.amplify = 1;
  }

  // sensitivity = opts.sensitivity / opts.amplify;

  sensitivity = opts.sensitivity;

  K = resolution / sensitivity;

  this.mode = this.io.MODES.ANALOG;

  this.pins.forEach(function(pin, index) {
    this.io.pinMode(pin, this.mode);
    this.io.analogRead(pin, function(data) {
      var axis = axes[index];
      var sensor = state[axis];

      data = data >> 2;

      sensor.previous = sensor.value;
      sensor.stash.shift();
      sensor.stash.push(data);
      sensor.value = (sum(sensor.stash) / 5) | 0;

      if (!isCalibrated &&
        (state.x.calibration.length === sampleSize &&
          state.y.calibration.length === sampleSize)) {

        isCalibrated = true;
        state.x.zeroVoltage = (sum(state.x.calibration) / sampleSize) | 0;
        state.y.zeroVoltage = (sum(state.y.calibration) / sampleSize) | 0;

        state.x.calibration.length = 0;
        state.y.calibration.length = 0;
      } else {
        if (sensor.calibration.length < sampleSize) {
          sensor.calibration.push(data);
        }
      }

      if (isCalibrated) {
        state.x.angle += this.rate.x / 100;
        state.y.angle += this.rate.y / 100;

        this.emit("data", {
          x: this.x,
          y: this.y
        });

        if (sensor.previous !== sensor.value) {
          this.emit("change", {
            x: this.x,
            y: this.y
          });
        }
      }
    }.bind(this));
  }, this);

  priv.set(this, state);

  Object.defineProperties(this, {
    isCalibrated: {
      get: function() {
        return isCalibrated;
      },
      set: function(value) {
        if (typeof value === "boolean") {
          isCalibrated = value;
        }
      }
    },
    pitch: {
      get: function() {
        return {
          rate: this.rate.y,
          angle: state.y.angle
        };
      }
    },
    roll: {
      get: function() {
        return {
          rate: this.rate.x,
          angle: state.x.angle
        };
      }
    },
    x: {
      get: function() {
        return state.x.value;
      }
    },
    y: {
      get: function() {
        return state.y.value;
      }
    },
    rate: {
      get: function() {
        return {
          x: ((state.x.value - state.x.zeroVoltage) * K) | 0,
          y: ((state.y.value - state.y.zeroVoltage) * K) | 0
        };
      }
    }
  });
}

Object.defineProperties(Gyro, {
  TK_4X: {
    value: 0.67
  },
  TK_1X: {
    value: 0.167
  }
});


util.inherits(Gyro, events.EventEmitter);

Gyro.prototype.recalibrate = function() {
  this.isCalibrated = false;
};

module.exports = Gyro;
