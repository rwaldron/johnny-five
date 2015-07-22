var Board = require("../lib/board");
var EVS = require("../lib/evshield");
var within = require("./mixins/within");
var __ = require("./fn");
var Emitter = require("events").EventEmitter;
var util = require("util");
var priv = new Map();
var int16 = __.int16;

function analogHandler(opts, dataHandler) {
  this.io.pinMode(this.pin, this.io.MODES.ANALOG);
  this.io.analogRead(this.pin, function(data) {
    dataHandler.call(this, data);
  }.bind(this));
}

var Controllers = {
  DEFAULT: {
    initialize: {
      value: analogHandler
    },
    toIntensityLevel: {
      value: function(raw) {
        // TODO: Scale to percentage
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

        state.mode = opts.mode === "REFLECTED" ? EVS.Type_EV3_LIGHT_REFLECTED : EVS.Type_EV3_LIGHT;

        state.shield = EVS.shieldPort(opts.pin);
        state.ev3 = new EVS(Object.assign(opts, { io: this.io }));
        state.ev3.setup(state.shield, EVS.Type_EV3);
        state.ev3.write(state.shield, 0x81 + state.shield.offset, state.mode);
        state.ev3.read(state.shield, EVS.Light, EVS.Light_Bytes, function(data) {
          var value = data[0] | (data[1] << 8);
          dataHandler(value);
        });
      }
    },
    toIntensityLevel: {
      value: function(raw) {
        return raw;
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

        state.mode = opts.mode === "REFLECTED" ? EVS.Type_NXT_LIGHT_REFLECTED : EVS.Type_NXT_LIGHT;

        state.shield = EVS.shieldPort(opts.pin);
        state.ev3 = new EVS(Object.assign(opts, { io: this.io }));
        state.ev3.setup(state.shield, state.mode);
        state.ev3.read(state.shield, state.shield.analog, EVS.Analog_Bytes, function(data) {
          var value = data[0] | (data[1] << 8);
          dataHandler(value);
        });
      }
    },
    toIntensityLevel: {
      value: function(raw) {
        return __.scale(raw, 0, 1023, 100, 0);
      }
    }
  },
  TSL2561: {
    ADDRESSES: {
      value: [ 0x29, 0x39, 0x49 ]
    },
    REGISTER: {
      value: {

        CONTROL: 0x00,
        TIMING: 0x01,
        READ: 0x8C,
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var address = opts.address || 0x39;
        // var read = (address & 0x0F) | 0x80;
        var gain = opts.gain || 0;
        var time = opts.time || 0;

        var iMs = [ 13.7, 101, 402 ][ time ];

        // Default value of timing register
        // http://www.adafruit.com/datasheets/TSL2561.pdf
        // Page 15
        var timing = 0x02;

        // gain [ 0 => 1X, 1 => 16X]
        if (gain) {
          timing |= 0x10;
        } else {
          timing &= ~0x10;
        }

        // time [ 0 => 13.7, 1 => 101, 2 => 402 ] ms
        timing &= ~0x03;
        timing |= (time & 0x03);

        this.io.i2cConfig();

        // Write the "power on" byte to the control register
        this.io.i2cWriteReg(address, this.REGISTER.CONTROL, 0x03);

        // Configure the timing and gain
        this.io.i2cWriteReg(address, this.REGISTER.TIMING, timing);

        this.io.i2cRead(address, this.REGISTER.READ, 4, function(data) {
          var ch0 = int16(data[1], data[0]);
          var ch1 = int16(data[3], data[2]);
          var value = 0;
          var ratio = 0;

          // http://www.adafruit.com/datasheets/TSL2561.pdf
          // Page 23
          if (ch0 === 0xFFFF || ch1 === 0xFFFF) {
            value = 0;
          } else {

            ratio = ch1 / ch0;

            ch0 *= 402 / iMs;
            ch1 *= 402 / iMs;

            if (!gain) {
              ch0 *= 16;
              ch1 *= 16;
            }

            if (ratio < 0.5) {
              value = 0.0304 * ch0 - 0.062 * ch0 * Math.pow(ratio, 1.4);
            } else if (ratio < 0.61) {
              value = 0.0224 * ch0 - 0.031 * ch1;
            } else if (ratio < 0.80) {
              value = 0.0128 * ch0 - 0.0153 * ch1;
            } else if (ratio < 1.30) {
              value = 0.00146 * ch0 - 0.00112 * ch1;
            } else {
              value = 0;
            }
          }

          dataHandler(value);
        });
      }
    },
    toIntensityLevel: {
      value: function(raw) {
        //

console.log("???", raw);
        return __.scale(raw, 0.1, 40000, 0, 100);
      }
    }
  },
};


/**
 * Light
 * @constructor
 *
 */

function Light(opts) {

  if (!(this instanceof Light)) {
    return new Light(opts);
  }

  var controller = null;
  var state = {};
  var raw = 0;
  var freq = opts.freq || 25;
  var last = 0;

  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  if (typeof opts.controller === "string") {
    controller = Controllers[opts.controller];
  } else {
    controller = opts.controller || Controllers.DEFAULT;
  }

  Object.defineProperties(this, controller);

  if (!this.toIntensityLevel) {
    this.toIntensityLevel = opts.toIntensityLevel || function(x) {
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
    level: {
      get: function() {
        return this.toIntensityLevel(raw);
      }
    },
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
      level: this.level
    };

    this.emit("data", data);

    if (raw !== last) {
      last = raw;
      this.emit("change", data);
    }
  }.bind(this), freq);
}

util.inherits(Light, Emitter);

__.mixin(Light.prototype, within);

module.exports = Light;
