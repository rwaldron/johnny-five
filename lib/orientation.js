var Emitter = require("events").EventEmitter;
var util = require("util");

var Board = require("./board");

var priv = new Map();

var Controllers = {

  BNO055: {
    initialize: {
      value: function(opts, dataHandler) {
        var IMU = require("./imu"),
          driver = IMU.Drivers.get(this.board, "BNO055", opts);

        driver.on("data", function(data) {
          dataHandler(data);
        });
      }
    },
    toScaledEuler: {
      value: function(raw) {

        return {
          heading: raw.euler.heading / 16,
          roll: raw.euler.roll / 16,
          pitch: raw.euler.pitch / 16,
        };
      }
    },
    toScaledQuarternion: {
      value: function(raw) {
        return {
          w: raw.quarternion.w * (1 / (1 << 14)),
          x: raw.quarternion.x * (1 / (1 << 14)),
          y: raw.quarternion.y * (1 / (1 << 14)),
          z: raw.quarternion.z * (1 / (1 << 14)),
        };
      }
    },
    calibration: {
      get: function() {
        return priv.get(this).calibration;
      }
    },
    isCalibrated: {
      get: function() {
        //only returns true if the calibration of the NDOF/Fusion algo is calibrated
        return ((this.calibration >> 6) & 0x03) === 0x03; //are we fully calibrated
      }
    }
  },
};


/**
 * Orientation
 * @constructor
 *
 * five.Orientation();
 *
 * five.Orientation({
 *  controller: "BNO055",
 *  freq: 50,
 * });
 *
 *
 * Device Shorthands:
 *
 * "BNO055": new five.Orientation()
 *
 *
 * @param {Object} opts [description]
 *
 */

function Orientation(opts) {

  if (!(this instanceof Orientation)) {
    return new Orientation(opts);
  }

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  var freq = opts.freq || 25;
  var controller = null;
  var raw = null;
  var state = {
    euler: {
      heading: 0,
      roll: 0,
      pitch: 0,
    },
    quarternion: {
      w: 0,
      x: 0,
      y: 0,
      z: 0,
    },
    calibration: 0,
  };

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller === null || typeof controller !== "object") {
    throw new Error("Missing valid Orientation controller");
  }

  Board.Controller.call(this, controller, opts);

  if (!this.toScaledQuarternion) {
    this.toScaledQuarternion = opts.toScaledQuarternion || function(raw) {
      return raw;
    };
  }

  if (!this.toScaledEuler) {
    this.toScaledEuler = opts.toScaledEuler || function(raw) {
      return raw;
    };
  }

  priv.set(this, state);

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      raw = data;
    });
  }

  setInterval(function() {
    if (raw === null) {
      return;
    }
    var didOrientationChange = false;
    var didCalibrationChange = false;

    ["heading", "roll", "pitch"].forEach(function(el) {
      if (state.euler[el] !== raw.orientation.euler[el]) {
        didOrientationChange = true;
      }
      state.euler[el] = raw.orientation.euler[el];
    });

    ["w", "x", "y", "z"].forEach(function(el) {
      if (state.quarternion[el] !== raw.orientation.quarternion[el]) {
        didOrientationChange = true;
      }
      state.quarternion[el] = raw.orientation.quarternion[el];
    });

    //if we have a raw calibration state...
    // not sure if this is the best place... some devices may not have a calibration state...
    if (raw.calibration) {
      if (state.calibration !== raw.calibration) {
        didCalibrationChange = true;
      }
      state.calibration = raw.calibration;
    }

    var data = {
      euler: this.euler,
      quarternion: this.quarternion,
      calibration: this.calibration
    };

    this.emit("data", data);

    if (didOrientationChange) {
      this.emit("change", data);
    }

    //not sure how we can get this event into other drivers
    if (didCalibrationChange) {
      this.emit("calibration", this.calibration);
    }
  }.bind(this), freq);
}


util.inherits(Orientation, Emitter);

Object.defineProperties(Orientation.prototype, {
  euler: {
    get: function() {
      var state = priv.get(this);
      return this.toScaledEuler(state);
    }
  },
  quarternion: {
    get: function() {
      var state = priv.get(this);
      return this.toScaledQuarternion(state);
    }
  }
});


module.exports = Orientation;
