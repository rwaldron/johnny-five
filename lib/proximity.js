var Sensor = require("../lib/sensor.js"),
  util = require("util");

function analogHandler(opts) {
  Sensor.call(this, opts);
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
  // SRF10: {
  //   initialize: function() {

  //     var samples = priv.get(this).samples;
  //     var address = 0x70;
  //     var delay = 65;

  //     // Set up I2C data connection
  //     this.io.sendI2CConfig(0);

  //     // Startup parameter
  //     this.io.sendI2CWriteRequest(address, [0x01, 16]);
  //     this.io.sendI2CWriteRequest(address, [0x02, 255]);

  //     this.io.setMaxListeners(100);

  //     function read() {
  //       this.io.sendI2CWriteRequest(address, [0x02]);
  //       this.io.sendI2CReadRequest(address, 2, function(data) {
  //         samples.push((data[0] << 8) | data[1]);
  //       }.bind(this));

  //       prime.call(this);
  //     }

  //     function prime() {
  //       // 0x52 result in us (microseconds)
  //       this.io.sendI2CWriteRequest(address, [0x00, 0x52]);

  //       setTimeout(read.bind(this), delay);
  //     }

  //     prime.call(this);
  //   },
  //   toCm: {
  //     value: function() {
  //       var median = priv.get(this).median;
  //       return +((((median / 2) * 343.2) / 10) / 1000).toFixed(1);
  //     }
  //   }
  // },
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

  var controller, err;

  if (typeof opts.controller === "string") {
    controller = Controllers[opts.controller];
  } else {
    controller = opts.controller || Controllers["GP2Y0A21YK"];
  }

  Object.defineProperties(this, controller);

  if (!this.toCm) {
    this.toCm = opts.toCm || function(x) { return x; };
  }

  Object.defineProperties(this, {
    /**
     * [read-only] Calculated centimeter value
     * @property centimeters
     * @type Number
     */
    centimeters: {
      get: function() {
        return this.toCm(this.value);
      }
    },
    cm: {
      get: function () {
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
      get: function () {
        return this.inches;
      }
    },
  });

  if (typeof this.initialize === "function") {
    this.initialize(opts);
  }
}

Proximity.Controllers = [
  "2Y0A21", "GP2Y0A21YK",
  "2D120X", "GP2D120XJ00F",
  "2Y0A02", "GP2Y0A02YK0F",
  "OA41SK", "GP2Y0A41SK0F",
  "0A21", "GP2Y0A21YK",
  "0A02", "GP2Y0A02YK0F",
];

util.inherits(Proximity, Sensor);

module.exports = Proximity;
