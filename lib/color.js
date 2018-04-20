var Board = require("./board");
var EVS = require("./evshield");
var Emitter = require("events").EventEmitter;
var util = require("util");
var Fn = require("./fn");
var priv = new Map();


function pad(value, length) {
  return Array(length - String(value).length + 1).join("0") + value;
}

var Controllers = {
  EVS_EV3: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);

        if (opts.mode) {
          opts.mode = opts.mode.toUpperCase();
        }

        state.mode = opts.mode === "RAW" ? EVS.Type_EV3_COLOR_RGBRAW : EVS.Type_EV3_COLOR;
        state.bytes = state.mode === EVS.Type_EV3_COLOR_RGBRAW ? 6 : 2;

        // Do not change the order of these items. They are listed such that the
        // index corresponds to the color code produced by the EV3 color sensor.
        // The range is very limited.
        state.colors = [
          [],
          [0, 0, 0],
          [0, 0, 255],
          [0, 128, 0],
          [255, 255, 0],
          [255, 0, 0],
          [255, 255, 255],
          [139, 69, 19],
        ];

        state.shield = EVS.shieldPort(opts.pin);
        state.ev3 = new EVS(Object.assign(opts, {
          io: this.io
        }));

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
    toRGB: {
      value: function(raw) {
        var state = priv.get(this);

        if (state.mode === EVS.Type_EV3_COLOR) {
          return raw > 0 && raw < 8 ? state.colors[raw] : state.colors[0];
        } else {
          raw = String(raw);
          return [0, 0, 0].map(function(zero, index) {
            return parseInt(raw.slice(index * 2, index * 2 + 2), 16);
          });
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

        state.mode = opts.mode === "RAW" ? EVS.Type_NXT_COLOR_RGBRAW : EVS.Type_NXT_COLOR;
        state.bytes = state.mode === EVS.Type_NXT_COLOR_RGBRAW ? 10 : 1;

        if (state.mode === EVS.Type_NXT_COLOR_RGBRAW) {
          throw new Error("Raw RGB is not currently supported for the NXT.");
        }

        // Do not change the order of these items. They are listed such that the
        // index corresponds to the color code produced by the EV3 color sensor.
        // The range is very limited.
        state.colors = [
          [],
          [0, 0, 0],
          [0, 0, 255],
          [0, 128, 0],
          [255, 255, 0],
          [255, 0, 0],
          [255, 255, 255],
        ];

        state.shield = EVS.shieldPort(opts.pin);
        state.ev3 = new EVS(Object.assign(opts, {
          io: this.io
        }));
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
    toRGB: {
      value: function(raw) {
        var state = priv.get(this);

        if (state.mode === EVS.Type_NXT_COLOR) {
          return raw > 0 && raw < 7 ? state.colors[raw] : state.colors[0];
        } else {
          raw = String(raw);
          return [0, 0, 0].map(function(zero, index) {
            return parseInt(raw.slice(index * 2, index * 2 + 2), 16);
          });
        }
      }
    }
  },
  ISL29125: {

    REGISTER: {
      value: {
        RESET: 0x00,
        // mode/lux range
        CONFIG1: 0x01,
        // ir adjust/filtering
        CONFIG2: 0x02,
        // interrupt control
        CONFIG3: 0x03,
        // Same as "GREEN DATA - LOW BYTE"
        READ: 0x09
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        // Cannot change address, so all values const/closed.
        var address = opts.address || 0x44;

        // TODO: make configs user "definable"

        opts.address = address;

        this.io.i2cConfig();

        // Reset chip
        this.io.i2cWriteReg(address, this.REGISTER.RESET, 0x46);

        // RGB | 10K Lux | 12bits
        this.io.i2cWriteReg(address, this.REGISTER.CONFIG1, 0x05 | 0x08 | 0x00);

        // High adjust
        this.io.i2cWriteReg(address, this.REGISTER.CONFIG2, 0x3F);

        // No Interrupts
        this.io.i2cWriteReg(address, this.REGISTER.CONFIG3, 0x00);

        this.io.i2cRead(address, this.REGISTER.READ, 6, function(data) {
          var value = "";

          // Register order: GLSB, GMSB, RLSB, RMSB, BLSB, BMSB
          var g = (data[1] << 8) | data[0];
          var r = (data[3] << 8) | data[2];
          var b = (data[5] << 8) | data[4];

          var rgb = [r >> 2, g >> 2, b >> 2].map(function(value) {
            return Fn.constrain(value, 0, 255);
          });

          for (var i = 0; i < 3; i++) {
            value += pad(rgb[i].toString(16), 2);
          }

          dataHandler(value);
        });
      }
    },
    toRGB: {
      value: function(raw) {
        raw = String(raw);
        return [0, 0, 0].map(function(zero, index) {
          return parseInt(raw.slice(index * 2, index * 2 + 2), 16);
        });
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

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  if (typeof opts.controller === "string") {
    controller = Controllers[opts.controller];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    throw new Error("Color expects a valid controller");
  }

  priv.set(this, state);

  Board.Controller.call(this, controller, opts);

  if (!this.toRGB) {
    this.toRGB = opts.toRGB || function(x) {
      return x;
    };
  }

  Object.defineProperties(this, {
    value: {
      get: function() {
        return raw;
      }
    },
    rgb: {
      get: function() {
        return this.toRGB(raw).reduce(function(accum, value, index) {
          accum[colorNames[index]] = value;
          return accum;
        }, {});
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


/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Color.Controllers = Controllers;
  Color.purge = function() {
    priv.clear();
  };
}

module.exports = Color;
