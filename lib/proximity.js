var Sensor = require("../lib/sensor.js"),
  util = require("util");

var Controllers = {
  DEFAULT: {
    initialize: {
      value: function(opts) {
        Sensor.call(this, opts);
      }
    }
  }
};

var Devices = {
  GP2Y0A21YK: {
    // https://www.sparkfun.com/products/242
    controller: Controllers.DEFAULT,
    toCm: {
      value: function(raw) {
        return +(12343.85 * Math.pow(raw, -1.15)).toFixed(2);
      }
    }
  },
  GP2D120XJ00F: {
    // https://www.sparkfun.com/products/8959
    controller: Controllers.DEFAULT,
    toCm: {
      value: function(raw) {
        return +((2914 / (raw + 5)) - 1).toFixed(2);
      }
    }
  },
  GP2Y0A02YK0F: {
    // https://www.sparkfun.com/products/8958
    // 15cm - 150cm
    controller: Controllers.DEFAULT,
    toCm: {
      value: function(raw) {
        return +(10650.08 * Math.pow(raw, -0.935) - 10).toFixed(2);
      }
    }
  },
  GP2Y0A41SK0F: {
    // https://www.sparkfun.com/products/12728
    // 4cm - 30cm
    controller: Controllers.DEFAULT,
    toCm: {
      value: function(raw) {
        return +(2076 / (raw - 11)).toFixed(2);
      }
    }
  }
};

// Otherwise known as...
Devices["2Y0A21"] = Devices.GP2Y0A21YK;
Devices["2D120X"] = Devices.GP2D120XJ00F;
Devices["2Y0A02"] = Devices.GP2Y0A02YK0F;
Devices["OA41SK"] = Devices.GP2Y0A41SK0F;

// As shown here: http://www.acroname.com/articles/sharp.html
Devices["0A21"] = Devices.GP2Y0A21YK;
Devices["0A02"] = Devices.GP2Y0A02YK0F;

/**
 * Proximity
 * @constructor
 *
 * five.Proximity("A0");
 *
 * five.Proximity({
 *  device: "GP2Y0A41SK0F",
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

  var controller, device, err;

  if (typeof opts.device === "string") {
    device = Devices[opts.device];
  } else {
    device = opts.device || Devices["GP2Y0A21YK"];
  }

  Object.defineProperties(this, device);

  if (opts.controller) {
    controller = typeof opts.controller === "string" ? Controllers[opts.controller] : opts.controller;
  } else {
    controller = device.controller || Controllers.DEFAULT;
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

Proximity.Devices = [
  "2Y0A21", "GP2Y0A21YK",
  "2D120X", "GP2D120XJ00F",
  "2Y0A02", "GP2Y0A02YK0F",
  "OA41SK", "GP2Y0A41SK0F",
  "0A21", "GP2Y0A21YK",
  "0A02", "GP2Y0A02YK0F",
];

util.inherits(Proximity, Sensor);

module.exports = Proximity;
