var Board = require("../lib/board");
var EVS = require("../lib/evshield");
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
        state.ev3.write(state.shield, 0x81 + state.shield.offset, EVS.Type_EV3_COLOR);
        state.ev3.read(state.shield, EVS.ColorMeasure, EVS.ColorMeasure_Bytes, function(data) {
          var value = data[0] | (data[1] << 8);
          dataHandler(value);
        });
      }
    },
    toColor: {
      value: function(raw) {
        var state = priv.get(this);
        return state.colors[raw];
      }
    }
  },
  EVS_NXT: {
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);

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
        state.ev3.read(state.shield, 0x70 + state.shield.offset, 1, function(data) {
          dataHandler(data[0]);
        });
      }
    },
    toColor: {
      value: function(raw) {
        var state = priv.get(this);
        return state.colors[raw];
      }
    }
  },
};


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
        return this.toColor(raw).rgb;
      }
    },
    color: {
      get: function() {
        return this.toColor(raw).name;
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

module.exports = Color;
