var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  __ = require("../lib/fn.js"),
  sum = __.sum,
  scale = __.scale;

var priv = new Map();
var axes = ["x", "y", "z"];
var rad2deg = 180 / Math.PI;


function fma(a, b, c) {
  var aHigh = 134217729 * a;
  var aLow;

  aHigh = aHigh + (a - aHigh);
  aLow = a - aHigh;

  var bHigh = 134217729 * b;
  var bLow;

  bHigh = bHigh + (b - bHigh);
  bLow = b - bHigh;

  var r1 = a * b;
  var r2 = -r1 + aHigh * bHigh + aHigh * bLow + aLow * bHigh + aLow * bLow;

  var s = r1 + c;
  var t = (r1 - (s - c)) + (c - (s - r1));

  return s + (t + r2);
}

function ToPrecision(val, precision) {
  return +(val).toPrecision(precision);
}

function magnitude(x, y, z) {
  var a;

  a = x * x;
  a = fma(y, y, a);
  a = fma(z, z, a);

  return Math.sqrt(a);
}

function gravity(aref, value) {
  var voltage = value * aref;
  var mvG = aref / 10;
  var bias = aref / 2;

  voltage /= 1024;

  return (voltage - bias) / mvG;
}

/**
 * Accelerometer
 * @constructor
 *
 * five.Accelerometer([ x, y[, z] ]);
 *
 * five.Accelerometer({
 *   pins: [ x, y[, z] ]
 *   zeroV: ...
 *   sensitivity: ...
 * });
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
      acceleration: null,
    },
    y: {
      value: 0,
      previous: 0,
      stash: [],
      orientation: null,
      inclination: null,
      acceleration: null,
    },
    z: {
      value: 0,
      previous: 0,
      stash: [],
      orientation: null,
      inclination: null,
      acceleration: null,
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

      this.emit("data", {
        x: state.x.value,
        y: state.y.value,
        z: state.z.value
      });

      if (this.acceleration !== sensor.acceleration) {
        sensor.acceleration = this.acceleration;
        isChange = true;
        this.emit("acceleration", sensor.acceleration);
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
        this.emit("change", {
          x: this.x,
          y: this.y,
          z: this.z
        });
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
        var x, y, z, rads;

        x = this.x;
        y = this.y;
        z = this.pins.length === 3 ? this.z : 1;

        rads = Math.atan2(x, Math.hypot(y, z));

        return ToPrecision(rads * rad2deg, 2);
      }
    },
    /**
     * [read-only] Calculated roll value
     * @property roll
     * @type Number
     */
    roll: {
      get: function() {
        var x, y, z, rads;

        x = this.x;
        y = this.y;
        z = this.pins.length === 3 ? this.z : 1;

        rads = Math.atan2(y, Math.hypot(x, z));

        return ToPrecision(rads * rad2deg, 2);
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
    gravity: {
      get: function() {
        return {
          x: ToPrecision(gravity(aref, state.x.value), 2),
          y: ToPrecision(gravity(aref, state.y.value), 2),
          z: ToPrecision(gravity(aref, state.z.value), 2),
        };
      }
    },
    acceleration: {
      get: function() {
        return magnitude(
          this.gravity.x,
          this.gravity.y,
          this.gravity.z
        );
      }
    },
    inclination: {
      get: function() {
        return Math.atan2(this.gravity.y, this.gravity.x) * rad2deg;
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
