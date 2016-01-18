var Board = require("./board"),
  Emitter = require("events").EventEmitter,
  util = require("util"),
  __ = require("./fn"),
  int16 = __.int16;


var priv = new Map();

var Controllers = {

  BNO055: {
    initialize: {
      value: function (opts, dataHandler) {
        var IMU = require("./imu");
        var driver = IMU.Drivers.get(this.board, "BNO055", opts);
        var state = priv.get(this);

        driver.on("data", function (data) {
          dataHandler(data.orientation);
        });
      }
    },
    toScaledEuler: {
      value: function (raw) {

        return {
          heading: raw.euler.heading / 16,
          roll: raw.euler.roll / 16,
          pitch: raw.euler.pitch / 16,
        }
      }
    },
    toScaledQuarternion: {
      value: function (raw) {
        return {
          w: raw.quarternion.w * (1 / (1 << 14)),
          x: raw.quarternion.x * (1 / (1 << 14)),
          y: raw.quarternion.y * (1 / (1 << 14)),
          z: raw.quarternion.z * (1 / (1 << 14)),
        }
      }
    },
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
    }
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
    this.toScaledQuarternion = opts.toScaledQuarternion || function (raw) {
        return raw;
      };
  }

  if (!this.toScaledEuler) {
    this.toScaledEuler = opts.toScaledEuler || function (raw) {
        return raw;
      };
  }

  priv.set(this, state);

  if (typeof this.initialize === "function") {
    this.initialize(opts, function (data) {
      raw = data;
    });
  }

  setInterval(function () {
    if (raw === null) {
      return;
    }
    var isChange = false;

    state.euler.heading = raw.euler.heading;
    state.euler.roll = raw.euler.roll;
    state.euler.pitch = raw.euler.pitch;

    state.quarternion.w = raw.quarternion.w;
    state.quarternion.x = raw.quarternion.x;
    state.quarternion.y = raw.quarternion.y;
    state.quarternion.z = raw.quarternion.z;


    this.emit("data", {
      orientation: state.orietation
    });

//        if (isChange) {
//            this.emit("change", {
//            });
//        }

  }.bind(this), freq);
}


util.inherits(Orientation, Emitter);

Object.defineProperties(Orientation.prototype, {
  euler: {
    get: function () {
      var state = priv.get(this);
      return this.toScaledEuler(state);
    }
  },
  quarternion: {
    get: function () {
      var state = priv.get(this);
      return this.toScaledQuarternion(state);
    }
  }

});


module.exports = Orientation;

