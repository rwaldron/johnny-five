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
 * five.Compass();
 *
 * five.Compass({
 *  controller: "BNO055",
 *  freq: 50,
 * });
 *
 *
 * Device Shorthands:
 *
 * "BNO055": new five.Magnetometer()
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

    ['heading','roll', 'pitch'].forEach(function (el){
      if (state.euler[el] != raw.euler[el]){
        isChange = true;
      }
      state.euler[el] = raw.euler[el];
    });

    ['w', 'x', 'y', 'z'].forEach(function (el){
      if (state.quarternion[el] != raw.quarternion[el]){
        isChange = true;
      }
      state.quarternion[el] = raw.quarternion[el];
    });

    this.emit("data", {
      euler: this.euler,
      quarternion: this.quarternion
    });

    if (isChange) {
        this.emit("change", {
          euler: this.euler,
          quarternion: this.quarternion
        });
    }

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

/**
 * Fires once every N ms, equal to value of `freq`. Defaults to 66ms
 *
 * @event
 * @name read
 * @memberOf Compass
 */



module.exports = Orientation;


// http://en.wikipedia.org/wiki/Relative_direction
