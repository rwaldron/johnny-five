var Emitter = require("events").EventEmitter;
var util = require("util");
var Board = require("../lib/board.js");
var __ = require("../lib/fn.js");
var Pins = Board.Pins;
var map = Board.map;
var int16 = __.ToInt16FromTwoBytes;

var priv = new Map();

var aliases = {
  down: ["down", "press", "tap", "impact", "hit"],
  up: ["up", "release"],
  "hold": ["hold"]
};

var trigger = function(key, value) {
  aliases[key].forEach(function(type) {
    this.emit(type, value);
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
    COMMANDS: {
      value: require("../lib/definitions/mpr121.js")
    },
    initialize: {
      value: function(opts) {

        var state = priv.get(this);
        var address = opts.address || 0x5A;
        var keys = flatKeys(opts);
        var keyMap = this.COMMANDS.MAPS[opts.controller];
        var mapping = Object.keys(keyMap).reduce(function(accum, index) {
          accum[index] = keyMap[index];
          return accum;
        }.bind(this), []);
        var length = mapping.length;


        this.io.i2cConfig();

        this.io.i2cWrite(address, this.COMMANDS.MHD_RISING, 0x01);
        this.io.i2cWrite(address, this.COMMANDS.NHD_AMOUNT_RISING, 0x01);
        this.io.i2cWrite(address, this.COMMANDS.NCL_RISING, 0x00);
        this.io.i2cWrite(address, this.COMMANDS.FDL_RISING, 0x00);

        this.io.i2cWrite(address, this.COMMANDS.MHD_FALLING, 0x01);
        this.io.i2cWrite(address, this.COMMANDS.NHD_AMOUNT_FALLING, 0x01);
        this.io.i2cWrite(address, this.COMMANDS.NCL_FALLING, 0xFF);
        this.io.i2cWrite(address, this.COMMANDS.FDL_FALLING, 0x02);

        for (var i = 0; i < 12; i++) {
          this.io.i2cWrite(address, this.COMMANDS.ELE0_TOUCH_THRESHOLD + (i << 1), 40);
          this.io.i2cWrite(address, this.COMMANDS.ELE0_RELEASE_THRESHOLD + (i << 1), 20);
        }

        this.io.i2cWrite(address, this.COMMANDS.FILTER_CONFIG, 0x04);
        this.io.i2cWrite(address, this.COMMANDS.ELECTRODE_CONFIG, 0x0C);

        state.length = length;
        state.touches = touches(length);

        this.io.i2cRead(address, 0, 2, function(bytes) {
          var target = this.toTarget(bytes);
          var mapped = null;
          var alias = null;

          for (var i = 0; i < length; i++) {
            mapped = mapping[i];
            alias = keys[mapped - 1];

            if (alias) {
              mapped = alias;
            }

            if (target & (1 << i)) {
              if (state.touches[i] === 0) {

                state.timeout = Date.now() + opts.holdTime;
                trigger.call(this, "down", mapped);

              } else if (state.touches[i] === 1) {
                if (state.timeout !== null && Date.now() > state.timeout) {
                  state.timeout = Date.now() + opts.holdTime;
                  trigger.call(this, "hold", mapped);
                }
              }

              state.touches[i] = 1;
            } else {
              if (state.touches[i] === 1) {
                state.timeout = null;
                trigger.call(this, "up", mapped);
              }

              state.touches[i] = 0;
            }
            alias = null;
          }
        }.bind(this));
      }
    },
    toTarget: {
      value: function(raw) {
        if (raw.length !== 2) {
          return null;
        }
        return int16(raw[1], raw[0]);
      }
    }
  },

  // https://learn.sparkfun.com/tutorials/vkey-voltage-keypad-hookup-guide
  VKEY: {
    initialize: {
      value: function(opts) {

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

        this.io.pinMode(this.pin, this.io.MODES.ANALOG);
        this.io.analogRead(this.pin, function(adc) {
          var target = this.toTarget(adc);
          var mapped = null;
          var alias = null;

          for (var i = 0; i < length; i++) {
            mapped = mapping[i];
            alias = keys[i];

            if (alias) {
              mapped = alias;
            }

            if (target === i) {
              if (state.touches[i] === 0) {

                state.timeout = Date.now() + opts.holdTime;
                trigger.call(this, "down", mapped);

              } else if (state.touches[i] === 1) {
                if (state.timeout !== null && Date.now() > state.timeout) {
                  state.timeout = Date.now() + opts.holdTime;
                  trigger.call(this, "hold", mapped);
                }
              }

              state.touches[i] = 1;
            } else {
              if (state.touches[i] === 1) {
                state.timeout = null;
                trigger.call(this, "up", mapped);
              }
              state.touches[i] = 0;
            }
            alias = null;
          }
        }.bind(this));
      },
    },
    toTarget: {
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
      value: function(opts) {

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

        this.io.pinMode(this.pin, this.io.MODES.ANALOG);
        this.io.analogRead(this.pin, function(adc) {
          var target = this.toTarget(adc);
          var mapped = null;
          var alias = null;

          for (var i = 0; i < length; i++) {
            mapped = mapping[i];
            alias = keys[i];

            if (alias) {
              mapped = alias;
            }

            if (target === i) {
              if (state.touches[i] === 0) {
                state.timeout = Date.now() + opts.holdTime;
                trigger.call(this, "down", mapped);

              } else if (state.touches[i] === 1) {
                if (state.timeout !== null && Date.now() > state.timeout) {
                  state.timeout = Date.now() + opts.holdTime;
                  trigger.call(this, "hold", mapped);
                }
              }

              state.touches[i] = 1;
            } else {
              if (state.touches[i] === 1) {
                state.timeout = null;
                trigger.call(this, "up", mapped);
              }
              state.touches[i] = 0;
            }
            alias = null;
          }
        }.bind(this));
      }
    },
    toTarget: {
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

  var controller = null;
  var state = {
    touches: null,
    timeout: null,
    length: null
  };

  priv.set(this, state);

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    controller = Controllers.ANALOG;
  }

  Object.defineProperties(this, controller);

  opts.holdTime = opts.holdTime ? opts.holdTime : 500;

  if (controller.initialize) {
    this.initialize(opts);
  }
}

util.inherits(Keypad, Emitter);

module.exports = Keypad;
