var Board = require("../lib/board");
var EVS = require("../lib/evshield");
var Emitter = require("events").EventEmitter;
var util = require("util");
var __ = require("../lib/fn");
var priv = new Map();


function analogHandler(opts, dataHandler) {
  this.io.pinMode(this.pin, this.io.MODES.ANALOG);
  this.io.analogRead(this.pin, function(data) {
    dataHandler.call(this, data);
  }.bind(this));
}

function pad(value, length) {
  return Array(length - String(value).length + 1).join("0") + value;
}

var Controllers = {
  // This is a placeholder...
  DEFAULT: {
    initialize: {
      value: analogHandler
    },
    toColor: {
      value: function(raw) {
        return raw;
      }
    }
  },
  EVS_EV3: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);

        if (opts.mode) {
          opts.mode = opts.mode.toUpperCase();
        }

        state.mode = opts.mode === "RGB" ? EVS.Type_EV3_COLOR_RGBRAW : EVS.Type_EV3_COLOR;
        state.bytes = state.mode === EVS.Type_EV3_COLOR_RGBRAW ? 6 : 2;

        // Do not change the order of these items. They are listed such that the
        // index corresponds to the color code produced by the EV3 color sensor.
        // The range is very limited.
        state.colors = [
          { name: "none", rgb: [] },
          { name: "black", rgb: [0, 0, 0] },
          { name: "blue", rgb: [0, 0, 255] },
          { name: "green", rgb: [0, 128, 0] },
          { name: "yellow", rgb: [255, 255, 0] },
          { name: "red", rgb: [255, 0, 0] },
          { name: "white", rgb: [255, 255, 255] },
          { name: "brown", rgb: [139, 69, 19] },
        ];

        state.shield = EVS.shieldPort(opts.pin);
        state.ev3 = new EVS(Object.assign(opts, { io: this.io }));

        state.ev3.setup(state.shield, EVS.Type_EV3);
        state.ev3.write(state.shield, 0x81 + state.shield.offset, state.mode);
        state.ev3.read(state.shield, EVS.ColorMeasure, state.bytes, function(data) {
          var value = "";
          if (state.bytes === 2) {
            value += String((data[0] | (data[1] << 8)) || 1);
          } else {
            for (var i = 0; i < 3; i++) {
              value += pad(data[i * 2].toString(16), 2);
            }
          }
          dataHandler(value);
        });
      }
    },
    toColor: {
      value: function(raw) {
        var state = priv.get(this);
        var rgb;

        if (state.mode === EVS.Type_EV3_COLOR) {
          return raw > 0 && raw < 8 ? state.colors[raw] : state.colors[0];
        } else {
          raw = String(raw);
          rgb = [0, 0, 0].map(function(zero, index) {
            return parseInt(raw.slice(index * 2, index * 2 + 2), 16);
          });

          return {
            // How can this be derived?
            name: "unknown",
            rgb: rgb
          };
        }
      }
    }
  },
  EVS_NXT: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);

        if (opts.mode) {
          opts.mode = opts.mode.toUpperCase();
        }

        state.mode = opts.mode === "RGB" ? EVS.Type_NXT_COLOR_RGBRAW : EVS.Type_NXT_COLOR;
        state.bytes = state.mode === EVS.Type_NXT_COLOR_RGBRAW ? 10 : 1;

        if (state.mode === EVS.Type_NXT_COLOR_RGBRAW) {
          throw new Error("Raw RGB is not currently supported for the NXT.")
        }

        // Do not change the order of these items. They are listed such that the
        // index corresponds to the color code produced by the EV3 color sensor.
        // The range is very limited.
        state.colors = [
          { name: "none", rgb: [] },
          { name: "black", rgb: [0, 0, 0] },
          { name: "blue", rgb: [0, 0, 255] },
          { name: "green", rgb: [0, 128, 0] },
          { name: "yellow", rgb: [255, 255, 0] },
          { name: "red", rgb: [255, 0, 0] },
          { name: "white", rgb: [255, 255, 255] },
        ];

        state.shield = EVS.shieldPort(opts.pin);
        state.ev3 = new EVS(Object.assign(opts, { io: this.io }));
        state.ev3.setup(state.shield, EVS.Type_NXT_COLOR);
        state.ev3.read(state.shield, 0x70 + state.shield.offset, state.bytes, function(data) {
          var value = "";

          if (state.bytes === 1) {
            value += String(data[0]);
          } else {

            // One day I'll figure this out :|
            // There is a lot of documentation that
            // claims this is possible, but I couldn't
            // figure out how to make sense of the
            // data that's returned.
            //
            // http://www.mathworks.com/help/supportpkg/legomindstormsnxt/ref/legomindstormsnxtcolorsensor.html#zmw57dd0e700
            // https://msdn.microsoft.com/en-us/library/ff631052.aspx
            // http://www.lejos.org/nxt/nxj/api/lejos/nxt/ColorSensor.html
            // http://www.robotc.net/forums/viewtopic.php?f=52&t=6939
            // http://code.metager.de/source/xref/lejos/classes/src/lejos/nxt/SensorPort.java#calData
            // http://code.metager.de/source/xref/lejos/classes/src/lejos/nxt/SensorPort.java#SP_MODE_INPUT
            // http://code.metager.de/source/xref/lejos/classes/src/lejos/nxt/SensorPort.java#416
          }

          // if (data[4] !== 0) {
            dataHandler(value);
          // }
        });
      }
    },
    toColor: {
      value: function(raw) {
        var state = priv.get(this);
        var rgb;

        if (state.mode === EVS.Type_NXT_COLOR) {
          return raw > 0 && raw < 7 ? state.colors[raw] : state.colors[0];
        } else {
          raw = String(raw);
          rgb = [0, 0, 0].map(function(zero, index) {
            return parseInt(raw.slice(index * 2, index * 2 + 2), 16);
          });

          return {
            // How can this be derived?
            name: "unknown",
            rgb: rgb
          };
        }
      }
    }
  },
};


var colorNames = ["red", "green", "blue"];


/**
 * Color
 * @constructor
 *
 */

function Color(opts) {

  if (!(this instanceof Color)) {
    return new Color(opts);
  }

  var controller = null;
  var state = {};
  var freq = opts.freq || 25;
  var raw = 0;
  var last = null;

  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  if (typeof opts.controller === "string") {
    controller = Controllers[opts.controller];
  } else {
    controller = opts.controller || Controllers.DEFAULT;
  }

  Object.defineProperties(this, controller);

  if (!this.toColor) {
    this.toColor = opts.toColor || function(x) {
      return x;
    };
  }

  priv.set(this, state);

  Object.defineProperties(this, {
    value: {
      get: function() {
        return raw;
      }
    },
    rgb: {
      get: function() {
        return this.toColor(raw).rgb.reduce(function(accum, value, index) {
          accum[colorNames[index]] = value;
          return accum;
        }, {});
      }
    },
    color: {
      get: function() {
        return this.toColor(raw).name;
      }
    }
  });

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      raw = data;
    });
  }

  setInterval(function() {
    if (raw === undefined) {
      return;
    }

    var data = {
      color: this.color,
      rgb: this.rgb,
    };

    this.emit("data", data);

    if (raw !== last) {
      last = raw;
      this.emit("change", data);
    }
  }.bind(this), freq);
}

util.inherits(Color, Emitter);

Color.hexCode = function(rgb) {
  if (rgb.red === undefined || rgb.green === undefined || rgb.blue === undefined) {
    return null;
  }
  return rgb.length === 0 ? "unknown" : colorNames.reduce(function(accum, name) {
    return accum += pad(rgb[name].toString(16), 2);
  }, "");
};


module.exports = Color;
