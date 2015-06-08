var Board = require("../lib/board");
var EVS = require("../lib/evshield");
var within = require("./mixins/within");
var __ = require("./fn");
var Emitter = require("events").EventEmitter;
var util = require("util");
var priv = new Map();

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
