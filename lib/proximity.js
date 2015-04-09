var Board = require("../lib/board.js"),
  within = require("./mixins/within"),
  __ = require("./fn"),
  events = require("events"),
  util = require("util");

function analogHandler(opts, dataHandler) {

  this.io.pinMode(this.pin, this.io.MODES.ANALOG);

  this.io.analogRead(this.pin, function(data) {
    dataHandler.call(this, data);
  }.bind(this));

}

var Controllers = {
  GP2Y0A21YK: {
    // https://www.sparkfun.com/products/242
    initialize: {
      value: analogHandler
    },
    toCm: {
      value: function(raw) {
        return +(12343.85 * Math.pow(raw, -1.15)).toFixed(2);
      }
    }
  },
  GP2D120XJ00F: {
    // https://www.sparkfun.com/products/8959
    initialize: {
      value: analogHandler
    },
    toCm: {
      value: function(raw) {
        return +((2914 / (raw + 5)) - 1).toFixed(2);
      }
    }
  },
  GP2Y0A02YK0F: {
    // https://www.sparkfun.com/products/8958
    // 15cm - 150cm
    initialize: {
      value: analogHandler
    },
    toCm: {
      value: function(raw) {
        return +(10650.08 * Math.pow(raw, -0.935) - 10).toFixed(2);
      }
    }
  },
  GP2Y0A41SK0F: {
    // https://www.sparkfun.com/products/12728
    // 4cm - 30cm
    initialize: {
      value: analogHandler
    },
    toCm: {
      value: function(raw) {
        return +(2076 / (raw - 11)).toFixed(2);
      }
    }
  },
  SRF10: {
    initialize: {
      value: function(opts, dataHandler) {

        var address = 0x70;
        var delay = 65;

        // Set up I2C data connection
        this.io.i2cConfig(0);

        // Startup parameter
        this.io.i2cWrite(address, [0x01, 16]);
        this.io.i2cWrite(address, [0x02, 255]);

        function read() {
          this.io.i2cWrite(address, [0x02]);
          this.io.i2cReadOnce(address, 2, function(data) {
            dataHandler((data[0] << 8) | data[1]);
          }.bind(this));

          prime.call(this);
        }

        function prime() {
          // 0x51 result in cm (centimeters)
          this.io.i2cWrite(address, [0x00, 0x51]);

          setTimeout(read.bind(this), delay);
        }

        prime.call(this);
      }
    },
    toCm: {
      value: function(raw) {
        return raw;
      }
    }
  },
  MB1003: {
    initialize: {
      value: analogHandler
    },
    toCm: {
      value: function(raw) {
        // http://www.maxbotix.com/articles/032.htm
        return raw / 2;
      }
    }
  }
};

// Sensor aliases
// IR
Controllers["2Y0A21"] = Controllers.GP2Y0A21YK;
Controllers["2D120X"] = Controllers.GP2D120XJ00F;
Controllers["2Y0A02"] = Controllers.GP2Y0A02YK0F;
Controllers["OA41SK"] = Controllers.GP2Y0A41SK0F;
Controllers["0A21"] = Controllers.GP2Y0A21YK;
Controllers["0A02"] = Controllers.GP2Y0A02YK0F;

// Sonar
Controllers["HRLV-MaxSonar-EZ0"] = Controllers.MB1003;

/**
 * Proximity
 * @constructor
 *
 * five.Proximity("A0");
 *
 * five.Proximity({
 *  controller: "GP2Y0A41SK0F",
 *  pin: "A0",
 *  freq: 100
 * });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Proximity(opts) {

  if (!(this instanceof Proximity)) {
    return new Proximity(opts);
  }

  var controller,
    raw = 0,
    freq = opts.freq || 25,
    range = opts.range || [0, 1023],
    limit = opts.limit || null,
    threshold = opts.threshold === undefined ? 1 : opts.threshold,
    isScaled = false,
    last = 0;

  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  if (typeof opts.controller === "string") {
    controller = Controllers[opts.controller];
  } else {
    controller = opts.controller || Controllers["GP2Y0A21YK"];
  }

  Object.defineProperties(this, controller);

  if (!this.toCm) {
    this.toCm = opts.toCm || function(x) {
      return x;
    };
  }

  Object.defineProperties(this, {
    /**
     * [read-only] Calculated centimeter value
     * @property centimeters
     * @type Number
     */
    centimeters: {
      get: function() {
        return this.toCm(raw);
      }
    },
    cm: {
      get: function() {
        return this.centimeters;
      }
    },
    /**
     * [read-only] Calculated inch value
     * @property inches
     * @type Number
     */
    inches: {
      get: function() {
        return +(this.centimeters * 0.39).toFixed(2);
      }
    },
    in: {
      get: function() {
        return this.inches;
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
      cm: this.cm,
      centimeters: this.centimeters,
      in : this.in,
      inches: this.inches
    };

    this.emit("data", data);

    if (raw !== last) {
      last = raw;
      this.emit("change", data);
    }
  }.bind(this), freq);
}

Proximity.Controllers = [
  "2Y0A21", "GP2Y0A21YK",
  "2D120X", "GP2D120XJ00F",
  "2Y0A02", "GP2Y0A02YK0F",
  "OA41SK", "GP2Y0A41SK0F",
  "0A21", "GP2Y0A21YK",
  "0A02", "GP2Y0A02YK0F",
];

util.inherits(Proximity, events.EventEmitter);

__.mixin(Proximity.prototype, within);

module.exports = Proximity;
