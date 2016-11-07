var Emitter = require("events").EventEmitter;
var util = require("util");
var Board = require("./board");
var Fn = require("./fn");

var scale = Fn.scale;
var toFixed = Fn.toFixed;
var uint16 = Fn.uint16;

var priv = new Map();

var aliases = {
  down: ["down", "press", "tap", "impact", "hit", "touch"],
  up: ["up", "release"],
  hold: ["hold"]
};

function flatKeys(opts) {
  var keys = [];

  if (opts.keys && Array.isArray(opts.keys)) {
    keys = opts.keys.slice();

    if (keys.every(Array.isArray)) {
      keys = keys.reduce(function(accum, row) {
        return accum.concat(row);
      }, []);
    }
  }

  return keys;
}

// TODO:
//
// Provide a mechanism for explicitly naming aliases for buttons
//
//
var Controllers = {
  MPR121: {
    ADDRESSES: {
      value: [0x5A, 0x5B, 0x5C, 0x5D]
    },
    REGISTER: {
      value: require("./definitions/mpr121.js")
    },
    initialize: {
      value: function(opts, dataHandler) {

        var state = priv.get(this);
        var address = opts.address || this.ADDRESSES[0];
        var keys = flatKeys(opts);
        var keyMap = this.REGISTER.MAPS[opts.controller].KEYS;
        var targets = this.REGISTER.MAPS[opts.controller].TARGETS;
        var mapping = Object.keys(keyMap).reduce(function(accum, index) {
          accum[index] = keyMap[index];
          return accum;
        }, []);

        var length = mapping.length;
        opts.address = address;

        this.io.i2cConfig(opts);

        this.io.i2cWrite(address, this.REGISTER.MPR121_SOFTRESET, 0x63);

        this.io.i2cWrite(address, this.REGISTER.MHD_RISING, 0x01);
        this.io.i2cWrite(address, this.REGISTER.NHD_AMOUNT_RISING, 0x01);
        this.io.i2cWrite(address, this.REGISTER.NCL_RISING, 0x00);
        this.io.i2cWrite(address, this.REGISTER.FDL_RISING, 0x00);

        this.io.i2cWrite(address, this.REGISTER.MHD_FALLING, 0x01);
        this.io.i2cWrite(address, this.REGISTER.NHD_AMOUNT_FALLING, 0x01);
        this.io.i2cWrite(address, this.REGISTER.NCL_FALLING, 0xFF);
        this.io.i2cWrite(address, this.REGISTER.FDL_FALLING, 0x02);

        // https://www.sparkfun.com/datasheets/Components/MPR121.pdf
        //
        // p. 12
        //
        // 6. Touch and Release Threshold (0x41~0x5A)
        // The threshold is defined as a deviation value from the baseline value,
        // so it remains constant even baseline value changes. Typically the touch
        // threshold is a little bigger than the release threshold to touch debounce
        // and hysteresis. The range of the value is 0~255. For typical touch
        // application, the value can be in range 0x05~0x30 for example. The setting
        // of the threshold is depended on the actual application. For the operation
        // details and how to set the threshold refer to application note AN3892 and
        // MPR121 design guidelines.

        this.sensitivity = {
          // Inverted map approximately to 8 bit values:
          //
          // press: 12
          // release: 6
          //
          press: Array(12).fill(0.95),
          release: Array(12).fill(0.975),
          // These defaults as based on the defaults shown
          // in examples published by Adafruit
          // https://github.com/adafruit/Adafruit_MPR121/blob/master/Adafruit_MPR121.cpp#L43
        };

        // If keys were specified for a MPR121_SHIELD (adafruit shield),
        // then reverse the keys to align with the output of the.
        if (opts.keys && opts.controller === "MPR121_SHIELD") {
          keys = keys.reverse();
        }

        if (opts.sensitivity) {
          if (Array.isArray(opts.sensitivity)) {
            // Initialized as:
            //
            // new five.Keypad({
            //   controller: "MPR121",
            //   sensitivity: [
            //     { press: 0-1, release: 0-1, },
            //     { press: 0-1, release: 0-1, },
            //     { press: 0-1, release: 0-1, },
            //     ...
            //   ],
            // });
            //
            opts.sensitivity.forEach(function(sensitivity, index) {
              if (typeof sensitivity.press !== "undefined") {
                this.sensitivity.press[index] = sensitivity.press;
              }

              if (typeof sensitivity.release !== "undefined") {
                this.sensitivity.release[index] = sensitivity.release;
              }
            }, this);
          } else {
            // Initialized as:
            //
            // new five.Keypad({
            //   controller: "MPR121",
            //   sensitivity: {
            //     press: 0-1,
            //     release: 0-1,
            //   },
            // });
            //
            if (typeof opts.sensitivity.press !== "undefined") {
              this.sensitivity.press.fill(opts.sensitivity.press);
            }

            if (typeof opts.sensitivity.release !== "undefined") {
              this.sensitivity.release.fill(opts.sensitivity.release);
            }
          }
        }

        // The chip expects a LOWER value for a HIGHER sensitivity.
        // Most people don't think this way, so Johnny-Five aligns with
        // user/developer intuition, which we assume for this case is:
        //
        //  "Higher sensitivity value means greater touch sensitivity"
        //
        // This means that the value we received needs to be inverted
        // before it's written to the chip threshold configuration.
        //
        for (var i = 0; i < 12; i++) {
          this.io.i2cWrite(
            address,
            this.REGISTER.ELE0_TOUCH_THRESHOLD + (i << 1),
            scale(toFixed(1 - this.sensitivity.press[i], 3), 0, 1, 0, 255)
          );
          this.io.i2cWrite(
            address,
            this.REGISTER.ELE0_RELEASE_THRESHOLD + (i << 1),
            scale(toFixed(1 - this.sensitivity.release[i], 3), 0, 1, 0, 255)
          );
        }

        this.io.i2cWrite(address, this.REGISTER.FILTER_CONFIG, 0x13);
        this.io.i2cWrite(address, this.REGISTER.AFE_CONFIGURATION, 0x80);

        this.io.i2cWrite(address, this.REGISTER.AUTO_CONFIG_CONTROL_0, 0x8F);
        this.io.i2cWrite(address, this.REGISTER.AUTO_CONFIG_USL, 0xE4);
        this.io.i2cWrite(address, this.REGISTER.AUTO_CONFIG_LSL, 0x94);
        this.io.i2cWrite(address, this.REGISTER.AUTO_CONFIG_TARGET_LEVEL, 0xCD);

        this.io.i2cWrite(address, this.REGISTER.ELECTRODE_CONFIG, 0xCC);

        if (!keys.length) {
          keys = Array.from(Object.assign({}, keyMap, {
            length: length
          }));
        }

        state.length = length;
        state.touches = touches(length);
        state.keys = keys;
        state.mapping = mapping;
        state.targets = targets;
        state.isMultitouch = true;

        this.io.i2cRead(address, 0x00, 2, function(bytes) {
          dataHandler(uint16(bytes[1], bytes[0]));
        });
      }
    },
    toAlias: {
      value: function(index) {
        var state = priv.get(this);
        return state.keys[index];
      }
    },
    toIndices: {
      value: function(raw) {
        var state = priv.get(this);
        var indices = [];
        for (var i = 0; i < 12; i++) {
          if (raw & (1 << i)) {
            indices.push(state.targets[raw & (1 << i)]);
          }
        }
        return indices;
      }
    },
  },

  // https://learn.sparkfun.com/tutorials/vkey-voltage-keypad-hookup-guide
  VKEY: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);
        var aref = opts.aref || this.io.aref || 5;
        var use5V = Fn.inRange(aref, 4.5, 5.5);
        var keys = flatKeys(opts);
        var mapping = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        var length = 0;

        if (!keys.length) {
          keys = mapping;
        }

        state.scale = [
          use5V ? 17 : 26,
          use5V ? 40 : 58,
          use5V ? 496 : 721,
        ];

        length = mapping.length;
        state.length = length;
        state.touches = touches(length);
        state.mapping = mapping;
        state.keys = keys;
        state.isMultitouch = false;

        this.io.pinMode(this.pin, this.io.MODES.ANALOG);
        this.io.analogRead(this.pin, function(adc) {
          dataHandler(adc);
        }.bind(this));
      },
    },
    toAlias: {
      value: function(index) {
        var state = priv.get(this);
        return state.keys[index];
      }
    },
    toIndices: {
      value: function(raw) {
        var state = priv.get(this);
        var length = state.length;
        var low = state.scale[0];
        var step = state.scale[1];
        var high = state.scale[2];

        if (raw < low || raw > high) {
          return [];
        }

        return [(length - ((raw - low) / step)) | 0];
      }
    }
  },

  // WaveShare AD
  //  - http://www.amazon.com/WaveShare-Accessory-buttons-controlled-keyboard/dp/B00KM6UXVS
  //  - http://www.wvshare.com/product/A_D-Keypad.htm
  //
  //  TODO: Create docs to show how to create a DIY keypad
  //        that works with this class.
  //
  ANALOG: {
    initialize: {
      value: function(opts, dataHandler) {

        var keys = flatKeys(opts);
        var mapping = [];
        var length = 0;

        if (opts.length && !keys.length) {
          keys = Array.from({
            length: opts.length
          }, function(_, key) {
            return key;
          });
        }

        if (!keys.length) {
          throw new Error(
            "Missing `keys`. Analog Keypad requires either a numeric `length` or a `keys` array."
          );
        }

        mapping = keys;
        length = mapping.length;

        var state = priv.get(this);
        // keys + Idle state == length + 1
        var total = length + 1;
        var vrange = Math.round(1023 / total);
        var ranges = Array.from({
          length: total
        }, function(_, index) {
          var start = vrange * index;
          return Array.from({
            length: vrange - 1
          }, function(_, index) {
            return start + index;
          });
        });

        state.length = length;
        state.ranges = ranges;
        state.touches = touches(length);
        state.mapping = mapping;
        state.keys = keys;
        state.isMultitouch = true;

        this.io.pinMode(this.pin, this.io.MODES.ANALOG);
        this.io.analogRead(this.pin, function(adc) {
          dataHandler(adc);
        });
      }
    },
    toAlias: {
      value: function(index) {
        var state = priv.get(this);
        return state.keys[index];
      }
    },
    toIndices: {
      value: function(raw) {
        var state = priv.get(this);
        var ranges = state.ranges;
        var index = ranges.findIndex(function(range) {
          return range.includes(raw);
        });

        if (index === state.length) {
          index--;
        }

        if (index < 0) {
          return [];
        }

        return [index];
      }
    }
  },
  AT42QT1070: {
    ADDRESSES: {
      value: [0x1B]
    },
    REGISTER: {
      value: {
        READ: 0x03
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);
        var address = opts.address || this.ADDRESSES[0];
        var keys = flatKeys(opts);
        var mapping = [0, 1, 2, 3, 4, 5, 6];
        var length = 0;

        if (!keys.length) {
          keys = mapping;
        }

        length = mapping.length;

        state.length = length;
        state.touches = touches(length);
        state.mapping = mapping;
        state.keys = keys;
        state.isMultitouch = true;

        this.io.i2cConfig(opts);
        this.io.i2cRead(address, this.REGISTER.READ, 1, function(data) {
          dataHandler(data[0]);
        });
      }
    },
    toAlias: {
      value: function(index) {
        var state = priv.get(this);
        return state.keys[index];
      }
    },
    toIndices: {
      value: function(raw) {
        var indices = [];
        for (var i = 0; i < 7; i++) {
          if (raw & (1 << i)) {
            indices.push(i);
          }
        }
        return indices;
      }
    }
  },

  "3X4_I2C_NANO_BACKPACK": {
    ADDRESSES: {
      value: [0x0A, 0x0B, 0x0C, 0x0D]
    },
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);
        var address = opts.address || this.ADDRESSES[0];
        var keys = flatKeys(opts);
        var mapping = [1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"];
        var length = 0;

        if (!keys.length) {
          keys = mapping;
        }

        length = mapping.length;

        state.length = length;
        state.touches = touches(length);
        state.mapping = mapping;
        state.keys = keys;
        state.isMultitouch = true;

        opts.address = address;

        this.io.i2cConfig(opts);
        this.io.i2cRead(address, 2, function(bytes) {
          dataHandler(uint16(bytes[0], bytes[1]));
        });
      }
    },
    toAlias: {
      value: function(index) {
        var state = priv.get(this);
        return state.keys[index];
      }
    },
    toIndices: {
      value: function(raw) {
        var state = priv.get(this);
        var indices = [];
        for (var i = 0; i < state.length; i++) {
          if (raw & (1 << i)) {
            indices.push(i);
          }
        }
        return indices;
      }
    }
  },
  SX1509: {
    ADDRESSES: {
      value: [0x0A, 0x0B, 0x0C, 0x0D]
    },
    REGISTER: {
      value: {
        PULLUP: 0x03,
        OPEN_DRAIN: 0x05,
        DIR: 0x07,
        DIR_B: 0x0E,
        DIR_A: 0x0F,
        // OPEN_DRAIN_B: 0x0E,
        // OPEN_DRAIN_A: 0x0F,
      },
    },
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);
        var address = opts.address || this.ADDRESSES[0];
        var keys = flatKeys(opts);
        var mapping = [1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"];
        var length = 0;

        if (!keys.length) {
          keys = mapping;
        }

        length = mapping.length;

        state.length = length;
        state.touches = touches(length);
        state.mapping = mapping;
        state.keys = keys;
        state.isMultitouch = true;

        opts.address = address;

        this.io.i2cConfig(opts);

        this.io.i2cWriteReg(address, this.REGISTER.DIR, 0xF0);
        this.io.i2cWriteReg(address, this.REGISTER.OPEN_DRAIN, 0x0F);
        this.io.i2cWriteReg(address, this.REGISTER.PULLUP, 0xF0);

        this.io.i2cRead(address, 2, function(bytes) {
          dataHandler(uint16(bytes[0], bytes[1]));
        });
      }
    },
    toAlias: {
      value: function(index) {
        var state = priv.get(this);
        return state.keys[index];
      }
    },
    toIndices: {
      value: function(raw) {
        var state = priv.get(this);
        var indices = [];
        for (var i = 0; i < state.length; i++) {
          if (raw & (1 << i)) {
            indices.push(i);
          }
        }
        return indices;
      }
    }
  },
};


// Otherwise known as...
Controllers.MPR121QR2 = Controllers.MPR121;
Controllers.MPR121QR2_SHIELD = Controllers.MPR121;
Controllers.MPR121_KEYPAD = Controllers.MPR121;
Controllers.MPR121_SHIELD = Controllers.MPR121;
Controllers.QTOUCH = Controllers.AT42QT1070;

function touches(length) {
  return Array.from({
    length: length
  }, function() {
    return {
      timeout: null,
      value: 0,
    };
  });
}

function Keypad(opts) {

  if (!(this instanceof Keypad)) {
    return new Keypad(opts);
  }

  // Initialize a Device instance on a Board
  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  var raw = null;
  var controller = null;
  var state = {
    touches: null,
    timeout: null,
    length: null,
    keys: null,
    mapping: null,
    holdtime: null,
  };

  var trigger = Fn.debounce(function(type, value) {
    var event = {
      type: type,
      which: value,
      timestamp: Date.now()
    };
    aliases[type].forEach(function(type) {
      this.emit(type, event);
    }, this);

    this.emit("change", Object.assign({}, event));
  }, 5);


  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    controller = Controllers.ANALOG;
  }

  Board.Controller.call(this, controller, opts);

  state.holdtime = opts.holdtime ? opts.holdtime : 500;

  priv.set(this, state);

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {

      raw = data;

      var now = Date.now();
      var indices = this.toIndices(data);
      var kLength = state.length;

      var lists = {
        down: [],
        hold: [],
        up: [],
      };

      var target = null;
      var alias = null;

      for (var k = 0; k < kLength; k++) {
        alias = this.toAlias(k);

        if (indices.includes(k)) {
          if (state.touches[k].value === 0) {

            state.touches[k].timeout = now + state.holdtime;
            lists.down.push(alias);

          } else if (state.touches[k].value === 1) {
            if (state.touches[k].timeout !== null && now > state.touches[k].timeout) {
              state.touches[k].timeout = now + state.holdtime;
              lists.hold.push(alias);
            }
          }

          state.touches[k].value = 1;
        } else {
          if (state.touches[k].value === 1) {
            state.touches[k].timeout = null;
            lists.up.push(alias);
          }
          state.touches[k].value = 0;
        }
        target = null;
        alias = null;
      }

      Object.keys(lists).forEach(function(key) {
        var list = lists[key];

        if (list.length) {
          trigger.call(this, key, list);
        }
      }, this);
    }.bind(this));
  }

  Object.defineProperties(this, {
    isMultitouch: {
      get: function() {
        return state.isMultitouch;
      }
    },
    value: {
      get: function() {
        return raw;
      }
    },
  });
}

util.inherits(Keypad, Emitter);

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Keypad.Controllers = Controllers;
  Keypad.purge = function() {
    priv.clear();
  };
}

module.exports = Keypad;
