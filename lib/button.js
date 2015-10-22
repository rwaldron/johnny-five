var Board = require("../lib/board");
var EVS = require("../lib/evshield");
var Pins = Board.Pins;
var __ = require("../lib/fn");
var events = require("events");
var util = require("util");

// Button instance private data
var priv = new Map();
var aliases = {
  down: ["down", "press", "tap", "impact", "hit"],
  up: ["up", "release"]
};



var Controllers = {
  DEFAULT: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);

        if (Pins.isFirmata(this) && typeof opts.pinValue === "string" && opts.pinValue[0] === "A") {
          opts.pinValue = this.io.analogPins[+opts.pinValue.slice(1)];
        }

        this.pin = Number.isNaN(+opts.pinValue) ? opts.pinValue : +opts.pinValue;

        this.io.pinMode(this.pin, this.io.MODES.INPUT);

        // Enable the pullup resistor after setting pin mode
        if (this.pullup) {
          this.io.digitalWrite(this.pin, this.io.HIGH);
        }

        this.io.digitalRead(this.pin, function(data) {
          if (data !== state.last) {
            dataHandler(data);
          }
        });
      }
    },
    toBoolean: {
      value: function(raw) {
        return raw === this.downValue;
      }
    }
  },
  EVS_EV3: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);

        state.previous = 0;
        state.shield = EVS.shieldPort(opts.pin);
        state.register = EVS.Touch;

        state.ev3 = new EVS(Object.assign(opts, { io: this.io }));
        state.ev3.setup(state.shield, EVS.Type_EV3_TOUCH);
        state.ev3.read(state.shield, EVS.Touch, EVS.Touch_Bytes, function(data) {
          var value = data[0];
          // Since i2cRead is continuous regardless of the reading,
          // and digitalRead is continuous but only called for changes
          // in reading value, we need to suppress repeated calls to
          // dataHandler by limiting to only changed values.
          if (state.previous !== value) {
            dataHandler(value);
          }
          state.previous = value;
        });
      }
    },
    toBoolean: {
      value: function(raw) {
        return raw === this.downValue;
      }
    }
  },
  EVS_NXT: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);

        state.previous = 0;
        state.shield = EVS.shieldPort(opts.pin);

        state.ev3 = new EVS(Object.assign(opts, { io: this.io }));
        state.ev3.setup(state.shield, EVS.Type_ANALOG);
        state.ev3.read(state.shield, state.shield.analog, EVS.Analog_Bytes, function(data) {
          var value = data[0] | (data[1] << 8);
          // Since i2cRead is continuous regardless of the reading,
          // and digitalRead is continuous but only called for changes
          // in reading value, we need to suppress repeated calls to
          // dataHandler by limiting to only changed values.
          value = value < 300 ? 1 : 0;

          if (state.previous !== value) {
            dataHandler(value);
          }
          state.previous = value;
        });
      }
    },
    toBoolean: {
      value: function(raw) {
        return raw === this.downValue;
      }
    }
  }
};

/**
 * Button
 * @constructor
 *
 * five.Button();
 *
 * five.Button({
 *   pin: 10
 * });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Button(opts) {
  if (!(this instanceof Button)) {
    return new Button(opts);
  }

  var pinValue;
  var raw;
  var invert = false;
  var downValue = 1;
  var upValue = 0;
  var controller = null;
  var state = {
    interval: null,
    last: null
  };

  // Create a 5 ms debounce boundary on event triggers
  // this avoids button events firing on
  // press noise and false positives
  var trigger = __.debounce(function(key) {
    aliases[key].forEach(function(type) {
      this.emit(type, null);
    }, this);
  }, 7);

  pinValue = typeof opts === "object" ? opts.pin : opts;

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  opts.pinValue = pinValue;

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    controller = Controllers.DEFAULT;
  }

  Board.Controller.call(this, controller, opts);

  // `holdtime` is used by an interval to determine
  // if the button has been released within a specified
  // time frame, in milliseconds.
  this.holdtime = opts.holdtime || 500;

  // `opts.isPullup` is included as part of an effort to
  // phase out "isFoo" options properties
  this.pullup = opts.pullup || opts.isPullup || false;

  // Turns out some button circuits will send
  // 0 for up and 1 for down, and some the inverse,
  // so we can invert our function with this option.
  // Default to invert in pullup mode, but use opts.invert
  // if explicitly defined (even if false)
  invert = typeof opts.invert !== "undefined" ?
    opts.invert : (this.pullup || false);

  if (invert) {
    downValue = downValue ^ 1;
    upValue = upValue ^ 1;
  }

  state.last = upValue;

  // Create a "state" entry for privately
  // storing the state of the button
  priv.set(this, state);

  Object.defineProperties(this, {
    value: {
      get: function() {
        return Number(this.isDown);
      }
    },
    invert: {
      get: function() {
        return invert;
      },
      set: function(value) {
        invert = value;
        downValue = invert ? 0 : 1;
        upValue = invert ? 1 : 0;

        state.last = upValue;
      }
    },
    downValue: {
      get: function() {
        return downValue;
      },
      set: function(value) {
        downValue = value;
        upValue = value ^ 1;
        invert = value ? true : false;

        state.last = upValue;
      }
    },
    upValue: {
      get: function() {
        return upValue;
      },
      set: function(value) {
        upValue = value;
        downValue = value ^ 1;
        invert = value ? true : false;

        state.last = downValue;
      }
    },
    isDown: {
      get: function() {
        return this.toBoolean(raw);
      }
    }
  });


  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      var err = null;

      // Update the raw data value, which
      // is used by isDown = toBoolean()
      raw = data;

      if (!this.isDown) {
        if (state.interval) {
          clearInterval(state.interval);
        }
        trigger.call(this, "up");
      }

      if (this.isDown) {
        trigger.call(this, "down");

        state.interval = setInterval(function() {
          if (this.isDown) {
            this.emit("hold", err);
          }
        }.bind(this), this.holdtime);
      }

      state.last = data;
    }.bind(this));
  }
}

util.inherits(Button, events.EventEmitter);


/**
 * Fired when the button is pressed down
 *
 * @event
 * @name down
 * @memberOf Button
 */

/**
 * Fired when the button is held
 *
 * @event
 * @name hold
 * @memberOf Button
 */

/**
 * Fired when the button is released
 *
 * @event
 * @name up
 * @memberOf Button
 */


module.exports = Button;
