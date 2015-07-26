var Emitter = require("events").EventEmitter;
var util = require("util");
var Board = require("../lib/board.js");
var __ = require("../lib/fn.js");
var int16 = __.int16;

var priv = new Map();

var aliases = {
  down: ["down", "press", "tap", "impact", "hit"],
  up: ["up", "release"],
  hold: ["hold"]
};

var trigger = function(key, value) {
  var event = { which: value, timestamp: Date.now() };
  aliases[key].forEach(function(type) {
    this.emit(type, event);
  }, this);
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
  MPR121QR2: {
    REGISTER: {
      value: require("../lib/definitions/mpr121.js")
    },
    initialize: {
      value: function(opts, dataHandler) {

        var state = priv.get(this);
        var address = opts.address || 0x5A;
        var keys = flatKeys(opts);
        var keyMap = this.REGISTER.MAPS[opts.controller].KEYS;
        var targets = this.REGISTER.MAPS[opts.controller].TARGETS;
        var mapping = Object.keys(keyMap).reduce(function(accum, index) {
          accum[index] = keyMap[index];
          return accum;
        }, []);

        var length = mapping.length;

        this.io.i2cConfig(opts);

        this.io.i2cWrite(address, this.REGISTER.MHD_RISING, 0x01);
        this.io.i2cWrite(address, this.REGISTER.NHD_AMOUNT_RISING, 0x01);
        this.io.i2cWrite(address, this.REGISTER.NCL_RISING, 0x00);
        this.io.i2cWrite(address, this.REGISTER.FDL_RISING, 0x00);

        this.io.i2cWrite(address, this.REGISTER.MHD_FALLING, 0x01);
        this.io.i2cWrite(address, this.REGISTER.NHD_AMOUNT_FALLING, 0x01);
        this.io.i2cWrite(address, this.REGISTER.NCL_FALLING, 0xFF);
        this.io.i2cWrite(address, this.REGISTER.FDL_FALLING, 0x02);

        for (var i = 0; i < 12; i++) {
          this.io.i2cWrite(address, this.REGISTER.ELE0_TOUCH_THRESHOLD + (i << 1), 40);
          this.io.i2cWrite(address, this.REGISTER.ELE0_RELEASE_THRESHOLD + (i << 1), 20);
        }

        this.io.i2cWrite(address, this.REGISTER.FILTER_CONFIG, 0x04);
        this.io.i2cWrite(address, this.REGISTER.ELECTRODE_CONFIG, 0x0C);


        if (!keys.length) {
          keys = Array.from(Object.assign({}, keyMap, {length: length}));
        }

        state.length = length;
        state.touches = touches(length);
        state.keys = keys;
        state.mapping = mapping;
        state.targets = targets;

        this.io.i2cRead(address, 0x00, 2, function(bytes) {
          dataHandler(int16(bytes[1], bytes[0]));
        });
      }
    },
    toAlias: {
      value: function(index) {
        var state = priv.get(this);
        return state.keys[index];
      }
    },
    toIndex: {
      value: function(raw) {
        var state = priv.get(this);
        // console.log("raw", raw, state.targets[raw]);
        return state.targets[raw];
      }
    }
  },

  // https://learn.sparkfun.com/tutorials/vkey-voltage-keypad-hookup-guide
  VKEY: {
    initialize: {
      value: function(opts, dataHandler) {

        var state = priv.get(this);
        var keys = flatKeys(opts);
        var mapping = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];
        var length = 0;

        if (!keys.length) {
          keys = mapping;
        }

        length = mapping.length;

        state.length = length;
        state.scale = { bottom: 17, step: 40, top: 496 };
        state.touches = touches(length);
        state.mapping = mapping;
        state.keys = keys;

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
    toIndex: {
      value: function(raw) {
        var state = priv.get(this);
        var scale = state.scale;
        var length = state.length;

        if (raw < scale.bottom || raw > scale.top) {
          return null;
        }

        return (length - ((raw - scale.bottom) / scale.step)) | 0;
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
          keys = Array.from({ length: opts.length }, function(_, key) {
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
        var ranges = Array.from({ length: total }, function(_, index) {
          var start = vrange * index;
          return Array.from({ length: vrange - 1 }, function(_, index) {
            return start + index;
          });
        });

        state.length = length;
        state.ranges = ranges;
        state.touches = touches(length);
        state.mapping = mapping;
        state.keys = keys;

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
    toIndex: {
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
          return null;
        }

        return index;
      }
    }
  }
};


// Otherwise known as...
Controllers["MPR121"] = Controllers.MPR121QR2;

function touches(length) {
  return Array.from({ length: length }, function() {
    return 0;
  });
}

function Keypad(opts) {

  if (!(this instanceof Keypad)) {
    return new Keypad(opts);
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
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



  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    controller = Controllers.ANALOG;
  }

  Object.defineProperties(this, controller);

  state.holdtime = opts.holdtime ? opts.holdtime : 500;

  priv.set(this, state);

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      var target = this.toIndex(data);
      var length = state.length;
      var alias = null;

      raw = data;

      for (var i = 0; i < length; i++) {
        alias = this.toAlias(i);

        if (target === i) {
          if (state.touches[i] === 0) {

            state.timeout = Date.now() + state.holdtime;
            trigger.call(this, "down", alias);

          } else if (state.touches[i] === 1) {
            if (state.timeout !== null && Date.now() > state.timeout) {
              state.timeout = Date.now() + state.holdtime;
              trigger.call(this, "hold", alias);
            }
          }

          state.touches[i] = 1;
        } else {
          if (state.touches[i] === 1) {
            state.timeout = null;
            trigger.call(this, "up", alias);
          }

          state.touches[i] = 0;
        }
        alias = null;
      }
    }.bind(this));
  }

  Object.defineProperties(this, {
    value: {
      get: function() {
        return raw;
      }
    },
    target: {
      get: function() {
        return state.keys[this.toIndex(this.value)];
      }
    }
  });
}

util.inherits(Keypad, Emitter);

module.exports = Keypad;
