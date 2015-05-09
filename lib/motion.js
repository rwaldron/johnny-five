var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  temporal = require("temporal"),
  priv = new Map();

var Controllers = {
  PIR: {
    initialize: {
      value: function (opts, dataHandler) {

        var state = priv.get(this);
        var calibrationDelay = "calibrationDelay" in opts ? opts.calibrationDelay : 30000;

        this.io.pinMode(opts.pin, this.io.MODES.INPUT);

        temporal.delay(calibrationDelay, function() {
          state.isCalibrated = true;
          this.emit("calibrated", null);
        }.bind(this));

        this.io.digitalRead(opts.pin, function(data) {
          dataHandler.call(this, !!data);
        }.bind(this));

      }
    }
  },
};

/**
 * Motion
 * @constructor
 *
 * five.Motion(7);
 *
 * five.Motion({
 *  controller: "PIR",
 *  pin: 7,
 *  freq: 100,
 *  calibrationDelay: 1000
 * });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Motion(opts) {

  if (!(this instanceof Motion)) {
    return new Motion(opts);
  }

  var controller;
  var freq = opts.freq || 25;

  // new
  var state;
  var last = false;

  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  if (typeof opts.controller === "string") {
    controller = Controllers[opts.controller];
  } else {
    controller = opts.controller || Controllers["PIR"];
  }

  Object.defineProperties(this, controller);

  state = {
    detectedMotion: false,
    isCalibrated: false
  };

  priv.set(this, state);

  Object.defineProperties(this, {
    /**
     * [read-only] Current sensor state
     * @property detectedMotion
     * @type Boolean
     */
    detectedMotion: {
      get: function() {
        return state.detectedMotion;
      }
    },
    /**
     * [read-only] Sensor calibration status
     * @property isCalibrated
     * @type Boolean
     */
    isCalibrated: {
      get: function() {
        return state.isCalibrated;
      }
    },
  });

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      state.detectedMotion = data;
    });
  }

  setInterval(function() {

    var eventData = {
      timestamp : Date.now(),
      detectedMotion : state.detectedMotion,
      isCalibrated : state.isCalibrated
    };

    if (state.isCalibrated && state.detectedMotion && !last) {
      this.emit("motionstart", eventData);
    }

    if (state.isCalibrated && !state.detectedMotion && last) {
      this.emit("motionend", eventData);
    }

    this.emit("data", eventData);

    last = state.detectedMotion;

  }.bind(this), freq);
}

util.inherits(Motion, events.EventEmitter);

module.exports = Motion;
