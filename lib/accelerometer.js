var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  __ = require("../lib/fn.js"),
  sum = __.sum,
  scale = __.scale;

var priv = new Map();
var axes = ["x", "y", "z"];

function ToPrecision(val, precision) {
  return +(val).toPrecision(precision);
}

function mV(aref, value) {
  return scale(
    value, 0, 1024,
    0, aref === 5 ? 3300 : 5000
  );
}

function g(aref, value) {
  return scale(
    value, 0, 1024,
    aref === 5 ? -825 : -800,
    aref === 5 ?  800 : 1600
  );
}

/**
 * Accelerometer
 * @constructor
 *
 * five.Accelerometer([ x, y[, z] ]);
 *
 * five.Accelerometer({
 *   pins: [ x, y[, z] ]
 *   freq: ms
 *  });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Accelerometer(opts) {
  if (!(this instanceof Accelerometer)) {
    return new Accelerometer(opts);
  }

  var err = null;
  var aref = 5;
  var zeroV = 478;
  var sensitivity = 96;

  var state = {
    x: {
      value: 0,
      previous: 0,
      stash: [],
      orientation: null,
      inclination: null,
    },
    y: {
      value: 0,
      previous: 0,
      stash: [],
      orientation: null,
      inclination: null,
    },
    z: {
      value: 0,
      previous: 0,
      stash: [],
      orientation: null,
      inclination: null,
    }
  };

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  if (opts.aref) {
    aref = opts.aref;
  }

  if (opts.zeroV) {
    zeroV = opts.zeroV;
  }

  if (opts.sensitivity) {
    sensitivity = opts.sensitivity;
  }

  this.mode = this.io.MODES.ANALOG;

  this.pins.forEach(function(pin, index) {
    this.io.pinMode(pin, this.mode);
    this.io.analogRead(pin, function(data) {
      var axis = axes[index];
      var sensor = state[axis];
      var isChange = false;

      // The first run needs to prime the "stash"
      // of data values.
      if (sensor.stash.length === 0) {
        for (var i = 0; i < 5; i++) {
          sensor.stash[i] = data;
        }
      }

      sensor.previous = sensor.value;
      sensor.stash.shift();
      sensor.stash.push(data);
      sensor.value = (sum(sensor.stash) / 5) | 0;

      this.emit("data", { x: this.x, y: this.y, z: this.z });

      if (sensor.previous !== sensor.value) {
        isChange = true;
        this.emit("acceleration");
      }

      if (this.orientation !== sensor.orientation) {
        sensor.orientation = this.orientation;
        isChange = true;
        this.emit("orientation", sensor.orientation);
      }

      if (this.inclination !== sensor.inclination) {
        sensor.inclination = this.inclination;
        isChange = true;
        this.emit("inclination", sensor.inclination);
      }

      if (isChange) {
        this.emit("change", { x: this.x, y: this.y, z: this.z });
      }

    }.bind(this));
  }, this);

  priv.set(this, state);

  Object.defineProperties(this, {
    /**
     * [read-only] Calculated pitch value
     * @property pitch
     * @type Number
     */
    pitch: {
      get: function() {
        var x, y, z, rad;

        x = this.x;
        y = this.y;
        z = this.pins.length === 3 ? this.z : 1;

        rad = Math.abs(
          Math.atan(
            x / Math.hypot(y, z)
          )
        );

        return {
          radians: ToPrecision(rad, 2),
          inclination: ToPrecision(rad * 180 / Math.PI, 2)
        };
      }
    },
    /**
     * [read-only] Calculated roll value
     * @property roll
     * @type Number
     */
    roll: {
      get: function() {
        var x, y, z, rad;

        x = this.x;
        y = this.y;
        z = this.pins.length === 3 ? this.z : 1;

        rad = Math.abs(
          Math.atan(
            y / Math.hypot(x, z)
          )
        );

        return {
          radians: ToPrecision(rad, 2),
          inclination: ToPrecision(rad * 180 / Math.PI, 2)
        };
      }
    },
    x: {
      get: function() {
        return ToPrecision((state.x.value - zeroV) / sensitivity, 2);
      }
    },
    y: {
      get: function() {
        return ToPrecision((state.y.value - zeroV) / sensitivity, 2);
      }
    },
    z: {
      get: function() {
        return this.pins.length === 3 ?
          ToPrecision((state.z.value - zeroV) / sensitivity, 2) : 0;
      }
    },
    accel: {
      get: function() {
        return {
          x: mV(aref, state.x.value),
          y: mV(aref, state.y.value),
          z: mV(aref, this.pins.length === 3 ? state.z.value : 0),
        };
      }
    },
    g: {
      get: function() {
        return {
          x: g(aref, state.x.value),
          y: g(aref, state.y.value),
          z: g(aref, state.z.value),
        };
      }
    },
    inclination: {
      get: function() {
        if (this.x <= sensitivity && this.y <= sensitivity) {
          return ToPrecision(Math.atan2(this.x, this.y) * 180 / Math.PI, 2);
        } else {
          return null;
        }
      }
    },
    orientation: {
      get: function() {
        var abs = Math.abs;
        var x = this.x;
        var y = this.y;
        var z = this.pins.length === 3 ? this.z : 1;
        var xAbs = abs(x);
        var yAbs = abs(y);
        var zAbs = abs(z);

        if (xAbs < yAbs && xAbs < zAbs) {
          if (x > 0) {
            return 1;
          }
          return -1;
        }
        if (yAbs < xAbs && yAbs < zAbs) {
          if (y > 0) {
            return 2;
          }
          return -2;
        }
        if (zAbs < xAbs && zAbs < yAbs) {
          if (z > 0) {
            return 3;
          }
          return -3;
        }
        return 0;
      }
    }
  });
}


util.inherits(Accelerometer, events.EventEmitter);

module.exports = Accelerometer;
