var Sensor = require("../lib/sensor.js"),
  util = require("util");


// References
//  - http://www.acroname.com/articles/linearizing-sharp-ranger.html
//  - http://luckylarry.co.uk/arduino-projects/arduino-using-a-sharp-ir-sensor-for-distance-calculation/
//  - http://forum.arduino.cc/index.php?topic=63433.0
//  - https://github.com/pjwerneck/Diaspar/blob/master/robots/sensors/sharp_table.py
//
//
var Controllers = {
  GP2Y0A21YK: {
    // https://www.sparkfun.com/products/242
    initialize: {
      value: function(opts) {
        Sensor.call(this, opts);
      }
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
      value: function(opts) {
        Sensor.call(this, opts);
      }
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
      value: function(opts) {
        Sensor.call(this, opts);
      }
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
      value: function(opts) {
        Sensor.call(this, opts);
      }
    },
    toCm: {
      value: function(raw) {
        return +(2076 / (raw - 11)).toFixed(2);
      }
    }
  }
};

// Otherwise known as...
Controllers["2Y0A21"] = Controllers.GP2Y0A21YK;
Controllers["2D120X"] = Controllers.GP2D120XJ00F;
Controllers["2Y0A02"] = Controllers.GP2Y0A02YK0F;
Controllers["OA41SK"] = Controllers.GP2Y0A41SK0F;

// As shown here: http://www.acroname.com/articles/sharp.html
Controllers["0A21"] = Controllers.GP2Y0A21YK;
Controllers["0A02"] = Controllers.GP2Y0A02YK0F;

/**
 * IR.Distance
 *
 * @deprecated
 * @constructor
 *
 * five.IR.Distance("A0");
 *
 * five.IR.Distance({
 *  device: "GP2Y0A41SK0F",
 *  pin: "A0",
 *  freq: 100
 * });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Distance(opts) {

  if (!(this instanceof Distance)) {
    return new Distance(opts);
  }

  var controller = null;

  if (typeof opts.controller === "string") {
    controller = Controllers[opts.controller];
  } else {
    controller = opts.controller;
  }

  if (controller == null) {
    controller = Controllers["GP2Y0A21YK"];
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
        return this.toCm(this.value);
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
    in : {
      get: function() {
        return this.inches;
      }
    },
  });

  if (typeof this.initialize === "function") {
    this.initialize(opts);
  }
}

Distance.Controllers = [
  "2Y0A21", "GP2Y0A21YK",
  "2D120X", "GP2D120XJ00F",
  "2Y0A02", "GP2Y0A02YK0F",
  "OA41SK", "GP2Y0A41SK0F",
  "0A21", "GP2Y0A21YK",
  "0A02", "GP2Y0A02YK0F",
];

util.inherits(Distance, Sensor);

module.exports = Distance;


// http://www.acroname.com/robotics/info/articles/sharp/sharp.html
