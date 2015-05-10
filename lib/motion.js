var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  priv = new Map();

var Controllers = {
  PIR: {
    initialize: {
      value: function (opts, dataHandler) {

        var state = priv.get(this);
        var calibrationDelay = typeof opts.calibrationDelay !== "undefined" ? opts.calibrationDelay : 2000;

        this.io.pinMode(opts.pin, this.io.MODES.INPUT);

        setTimeout(function() {
          state.isCalibrated = true;
          this.emit("calibrated", null);
        }.bind(this), calibrationDelay || 10);

        this.io.digitalRead(opts.pin, function(data) {
          dataHandler.call(this, data);
        }.bind(this));

      }
    },
    toBoolean: {
      value: function(raw) {
        return !!raw;
      }
    }
  },
  GP2Y0D805Z0F: {
    initialize: {
      value: function (opts, dataHandler) {

        var address = opts.address || 0x26;
        var state = priv.get(this);

        setTimeout(function () {
          state.isCalibrated = true;
          this.emit("calibrated", null);
        }.bind(this), 10);

        // Set up I2C data connection
        this.io.i2cConfig();

        // Enumerate and write each set of setup instructions
        [0x3, 0xFE].forEach(function(byteArray) {
          this.io.i2cWrite(address, byteArray);
        }, this);

        // Read Request Loop
        setInterval(function() {
          // Set pointer to X most signficant byte/register
          this.io.i2cWrite(address, [0x0]);

          // Read from register
          this.io.i2cReadOnce(address, 1, dataHandler);

        }.bind(this), opts.freq || 25);

      }

    },
    toBoolean: {
      value: function(raw) {
        return raw[0] === 1;
      }
    }
  }
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
    value: false,
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
        return this.toBoolean(state.value);
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
      state.value = data;
    });
  }

  setInterval(function() {

    var eventData = {
      timestamp : Date.now(),
      detectedMotion : this.detectedMotion,
      isCalibrated : state.isCalibrated
    };

    if (state.isCalibrated && this.detectedMotion && !last) {
      this.emit("motionstart", eventData);
    }

    if (state.isCalibrated && !this.detectedMotion && last) {
      this.emit("motionend", eventData);
    }

    this.emit("data", eventData);

    last = this.detectedMotion;

  }.bind(this), freq);
}

util.inherits(Motion, events.EventEmitter);

module.exports = Motion;
