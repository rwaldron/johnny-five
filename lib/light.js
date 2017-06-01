var Board = require("./board");
var EVS = require("./evshield");
var within = require("./mixins/within");
var Fn = require("./fn");
var Emitter = require("events").EventEmitter;
var util = require("util");
var priv = new Map();
// var int16 = Fn.int16;
var uint16 = Fn.uint16;
var toFixed = Fn.toFixed;

var Controllers = {
  DEFAULT: {
    initialize: {
      value: function(opts, dataHandler) {
        this.io.pinMode(this.pin, this.io.MODES.ANALOG);
        this.io.analogRead(this.pin, dataHandler);
      },
    },
    toIntensityLevel: {
      value: function(raw) {
        return toFixed(Fn.scale(raw, 0, 1023, 0, 100) / 100, 2);
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
        state.ev3 = new EVS(Object.assign(opts, {
          io: this.io
        }));
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
        return toFixed(raw / 100, 2);
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
        state.ev3 = new EVS(Object.assign(opts, {
          io: this.io
        }));
        state.ev3.setup(state.shield, state.mode);
        state.ev3.read(state.shield, state.shield.analog, EVS.Analog_Bytes, function(data) {
          var value = data[0] | (data[1] << 8);
          dataHandler(value);
        });
      }
    },
    toIntensityLevel: {
      value: function(raw) {
        return toFixed(Fn.scale(raw, 0, 1023, 100, 0) / 100, 2);
      }
    }
  },
  // http://www.adafruit.com/datasheets/TSL2561.pdf
  TSL2561: {
    ADDRESSES: {
      value: [0x29, 0x39, 0x49]
    },
    REGISTER: {
      value: {
        CONTROL: 0x00,
        TIMING: 0x01,
        READ: 0x2C,
      },
    },

    initialize: {
      value: function(opts, dataHandler) {
        var address = opts.address || 0x39;
        var command = function(byte) {
          // byte | 0b10000000;
          return byte | 0x80;
        };

        opts.address = address;

        this.io.i2cConfig(opts);

        // Page 15
        // Control Register (0h)
        // RESV  7:2
        // POWER 1:0
        //
        // Power up/power down.
        // By writing a 03h to this register, the device is powered up.
        // By writing a 00h to this register, the device is powered down.
        //
        // 0b00000011 = 0x03
        // 0b00000000 = 0x00
        this.io.i2cWriteReg(address, command(this.REGISTER.CONTROL), 0x03);

        // Gain & Integration
        // var isAutoGain = false;

        // Page 24
        // Integration time scaling factors
        var LUX_SCALE = 14; // scale by (2 ** 14)
        var RATIO_SCALE = 9; // scale ratio by (2 ** 9)

        // Page 24
        // T, FN, and CL Package coefficients
        var K1T = 0x0040; // 0.125 * (2 ** RATIO_SCALE)
        var B1T = 0x01F2; // 0.0304 * (2 ** LUX_SCALE)
        var M1T = 0x01BE; // 0.0272 * (2 ** LUX_SCALE)
        var K2T = 0x0080; // 0.250 * (2 ** RATIO_SCALE)
        var B2T = 0x0214; // 0.0325 * (2 ** LUX_SCALE)
        var M2T = 0x02D1; // 0.0440 * (2 ** LUX_SCALE)
        var K3T = 0x00C0; // 0.375 * (2 ** RATIO_SCALE)
        var B3T = 0x023F; // 0.0351 * (2 ** LUX_SCALE)
        var M3T = 0x037B; // 0.0544 * (2 ** LUX_SCALE)
        var K4T = 0x0100; // 0.50 * (2 ** RATIO_SCALE)
        var B4T = 0x0270; // 0.0381 * (2 ** LUX_SCALE)
        var M4T = 0x03FE; // 0.0624 * (2 ** LUX_SCALE)
        var K5T = 0x0138; // 0.61 * (2 ** RATIO_SCALE)
        var B5T = 0x016F; // 0.0224 * (2 ** LUX_SCALE)
        var M5T = 0x01FC; // 0.0310 * (2 ** LUX_SCALE)
        var K6T = 0x019A; // 0.80 * (2 ** RATIO_SCALE)
        var B6T = 0x00D2; // 0.0128 * (2 ** LUX_SCALE)
        var M6T = 0x00FB; // 0.0153 * (2 ** LUX_SCALE)
        var K7T = 0x029A; // 1.3 * (2 ** RATIO_SCALE)
        var B7T = 0x0018; // 0.00146 * (2 ** LUX_SCALE)
        var M7T = 0x0012; // 0.00112 * (2 ** LUX_SCALE)
        var K8T = 0x029A; // 1.3 * (2 ** RATIO_SCALE)
        var B8T = 0x0000; // 0.000 * (2 ** LUX_SCALE)
        var M8T = 0x0000; // 0.000 * (2 ** LUX_SCALE)

        // Auto-gain thresholds
        // Max value at Ti 13ms = 5047
        // var AGT_LO_13MS = 100;
        // var AGT_HI_13MS = 4850;

        // // Max value at Ti 101ms = 37177
        // var AGT_LO_101MS = 200;
        // var AGT_HI_101MS = 36000;

        // // Max value at Ti 402ms = 65535
        // var AGT_LO_402MS = 500;
        // var AGT_HI_402MS = 63000;

        // var agtRanges = [
        //   // 0, TI_13MS
        //   [100, 4850],
        //   // 1, TI_101MS
        //   [200, 36000],
        //   // 2, TI_402MS
        //   [500, 63000],
        // ];

        // var CLIPPING_13MS = 4900;
        // var CLIPPING_101MS = 37000;
        // var CLIPPING_402MS = 65000;

        // var clipping = [
        //   // 0, TI_13MS
        //   4900,
        //   // 1, TI_101MS
        //   37000,
        //   // 2, TI_402MS
        //   65000,
        // ];


        var GAIN_1X = 0x00;
        var GAIN_16X = 0x10;

        // var TI_13MS = 0x00;
        // var TI_101MS = 0x01;
        // var TI_402MS = 0x02;

        var TintMs = [
          // 0, TI_13MS
          13,
          // 1, TI_101MS
          101,
          // 2, TI_402MS
          402,
        ];

        var TintDelayMs = [
          // 0, TI_13MS
          15,
          // 1, TI_101MS
          120,
          // 2, TI_402MS
          450,
        ];

        // Page 23 - 28
        // Simplified Lux Calculation
        // var CH_SCALE_D = 0x0010;
        // var CH_SCALE_0 = 0x7517;
        // var CH_SCALE_1 = 0x0FE7;

        var chScales = [
          // 0, TI_13MS
          0x07517,
          // 1, TI_101MS
          0x00FE7,
          // 2, TI_402MS
          0x10000,
        ];

        // Gain and Tint defaults;
        var gain = GAIN_16X;
        var TintIndex = 0;
        var Tint = TintMs[TintIndex];
        var lux = 0;

        // if (typeof opts.gain !== "undefined") {
        //   isAutoGain = false;
        //   gain = opts.gain;
        // }

        // if (typeof opts.integration !== "undefined") {
        //   isAutoGain = false;
        //   Tint = opts.integration;
        // }


        // TODO: reduce duplication here
        Object.defineProperties(this, {
          gain: {
            get: function() {
              return gain;
            },
            set: function(value) {
              if (value !== GAIN_1X && value !== GAIN_16X) {
                throw new RangeError("Invalid gain. Expected one of: 0, 16");
              }
              gain = value;

              this.io.i2cWriteReg(address, command(this.REGISTER.TIMING), TintIndex | gain);
            }
          },
          integration: {
            get: function() {
              return Tint;
            },
            set: function(value) {
              TintIndex = TintMs.indexOf(value);

              if (TintIndex === -1) {
                throw new RangeError("Invalid integration. Expected one of: 13, 101, 402");
              }

              Tint = value;

              this.io.i2cWriteReg(address, command(this.REGISTER.TIMING), TintIndex | gain);
            }
          },
          lux: {
            get: function() {
              return lux;
            }
          }
        });

        // Assign the default gain and integration values
        // These are validated and written to the device.
        // These will invoke the accessors above.
        this.gain = gain;
        this.integration = Tint;

        // Page 1
        // Description
        // Page 2
        // Functional Block Diagram
        // var data = {
        //   broadband: null,
        //   infrared: null,
        // };

        var read = function() {
          setTimeout(function() {
            // Page 19
            // Read ADC Channels Using Read Word Protocol − RECOMMENDED
            this.io.i2cReadOnce(address, command(this.REGISTER.READ), 4, function(data) {
              // Page 23 - 28
              // Simplified Lux Calculation
              var ch0 = uint16(data[1], data[0]);
              var ch1 = uint16(data[3], data[2]);
              var b = 0;
              var m = 0;

              // Page 26
              // CalculateLux(...)
              var chScale = chScales[TintIndex];


              if (!gain) {
                chScale = chScale << 4;
              }

              // Page 27
              // CalculateLux(...)
              ch0 = (ch0 * chScale) >> 10;
              ch1 = (ch1 * chScale) >> 10;

              var ratio1 = 0;

              if (ch0) {
                ratio1 = (ch1 << (RATIO_SCALE + 1)) / ch0;
              }

              ratio1 = Math.round(ratio1);

              var ratio = (ratio1 + 1) >> 1;

              if (ratio >= 0 && ratio <= K1T) {
                b = B1T;
                m = M1T;
              } else if (ratio <= K2T) {
                b = B2T;
                m = M2T;
              } else if (ratio <= K3T) {
                b = B3T;
                m = M3T;
              } else if (ratio <= K4T) {
                b = B4T;
                m = M4T;
              } else if (ratio <= K5T) {
                b = B5T;
                m = M5T;
              } else if (ratio <= K6T) {
                b = B6T;
                m = M6T;
              } else if (ratio <= K7T) {
                b = B7T;
                m = M7T;
              } else if (ratio > K8T) {
                b = B8T;
                m = M8T;
              }
              // I followed the datasheet and it had no else clause here.

              var temp = (ch0 * b) - (ch1 * m);

              if (temp < 0) {
                temp = 0;
              }

              temp += 1 << (LUX_SCALE - 1);

              // Updating the `lux` binding
              // in the outer scope.
              lux = temp >>> LUX_SCALE;

              dataHandler(lux);
              read();
            });
          }.bind(this), TintDelayMs[TintIndex]);
        }.bind(this);

        read();
      }
    },
    toLux: {
      value: function(raw) {
        return raw;
      },
    },
    toIntensityLevel: {
      value: function(raw) {
        return toFixed(Fn.scale(raw, 0, 17000, 0, 100) / 100, 2);
      },
    },
  },
  BH1750: {
    // http://cpre.kmutnb.ac.th/esl/learning/bh1750-light-sensor/bh1750fvi-e_datasheet.pdf
    // https://www.mysensors.org/dl/57cc6e4595afb8801e529dab/design/bh1750fvi-e.pdf
    //
    // code based on Arduino library https://github.com/claws/BH1750
    // currently only "continuous H-resolution" mode supported
    ADDRESSES: {
      value: [0x23, 0x5C]
    },
    initialize: {
      value: function(opts, dataHandler) {
        var address = opts.address || 0x23;
        var mode = opts.mode || 0x10;
        opts.address = address;
        this.io.i2cConfig(opts);
        this.io.i2cWrite(address, mode);
        var read = function() {
          setTimeout(function() {
            this.io.i2cReadOnce(address, 2, function(data) {
              var raw = data[0];
              raw <<= 8;
              raw |= data[1];
              dataHandler(raw);
              read();
            });
          }.bind(this), 120);
        }.bind(this);
        read();
      },
    },
    toLux: {
      value: function(raw) {
        // Page 2.
        // H-Resolution Mode Resolution rHR － 1 － lx
        return Math.round(raw / 1.2);
      },
    },
    toIntensityLevel: {
      value: function(raw) {
        return toFixed(Fn.scale(raw / 1.2, 0, 65535, 0, 100) / 100, 2);
      },
    },
  },
};

Controllers.ALSPT19 = Controllers["ALS-PT19"] = Controllers.DEFAULT;


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
  var last = 0;
  var freq = opts.freq || 25;

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  if (typeof opts.controller === "string") {
    controller = Controllers[opts.controller];
  } else {
    controller = opts.controller || Controllers.DEFAULT;
  }

  Board.Controller.call(this, controller, opts);

  if (!this.toIntensityLevel) {
    this.toIntensityLevel = opts.toIntensityLevel || function(x) {
      return x;
    };
  }

  if (!this.toLux) {
    this.toLux = opts.toLux || function(x) {
      return x;
    };
  }

  Object.defineProperties(this, {
    value: {
      get: function() {
        return raw;
      },
    },
    level: {
      get: function() {
        return this.toIntensityLevel(raw);
      },
    },
  });

  priv.set(this, state);

  /* istanbul ignore else */
  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      raw = data;
    });
  }

  if (typeof this.lux === "undefined") {
    Object.defineProperty(this, "lux", {
      get: function() {
        return this.toLux(raw);
      },
    });
  }

  var data = {
    level: 0,
    lux: 0,
  };

  setInterval(function() {
    data.level = this.level;
    data.lux = this.lux;

    this.emit("data", data);

    if (raw !== last) {
      last = raw;
      this.emit("change", data);
    }
  }.bind(this), freq);
}

util.inherits(Light, Emitter);

Object.assign(Light.prototype, within);


/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Light.Controllers = Controllers;
  Light.purge = function() {
    priv.clear();
  };
}

module.exports = Light;

